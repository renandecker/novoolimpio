import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {ModuleTabs} from '../../../shared/components/ModuleTabs';

import type {DataTableColumn} from '../../../shared/components/DataTable';

import {api} from '../../../shared/services/api';

import type {ApiItem} from '../../../shared/types/types.ts';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const CALENDARIO_COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Dia Aula', render: (item) => formatDate(asRecord(item).data)},
    {
        key: 'aulaPresencial',
        label: 'Aula Presencial',
        render: (item) => {
            const v = asRecord(item).aulaPresencial;
            if (v === null || v === undefined) return '';
            return v ? 'Sim' : 'Não';
        },
    },
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'dia_semana', label: 'Dia Semana'},
    {key: 'tipo', label: 'Tipo'},
];

/**
 * Sub-tela de "Turma" (não aparece no menu).
 * Réplica simplificada do legado recriarCalendarioAcademico.xhtml:
 * lista os dias de aula da turma, permite recriar/salvar e voltar para a Turma.
 */
export default function ViewTurmaRecriarCalendarioAcademicoScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const turmaId = searchParams.get('id');
    const [turmaInfo, setTurmaInfo] = useState<string>('');
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!turmaId) return;
        let active = true;
        api.get<ApiItem>(`/api/educacao/turma/${turmaId}`)
            .then(({data}) => {
                if (!active) return;
                const r = asRecord(data);
                setTurmaInfo(
                    [r.unidade_descricao, r.grupo_descricao, r.curriculo_descricao, r.componente_curricular_descricao]
                        .filter(Boolean)
                        .join(' · ')
                );
            })
            .catch(() => {
                if (active) setTurmaInfo('');
            });
        return () => {
            active = false;
        };
    }, [turmaId]);

    const salvar = async () => {
        if (!turmaId) {
            alert('Nenhuma turma selecionada.');
            return;
        }
        setSalvando(true);
        try {
            await api.post(`/api/educacao/calendario/recriar`, {turmaId: Number(turmaId)});
            alert('Calendário recriado com sucesso!');
        } catch (e: unknown) {
            const err = e as {response?: {data?: {error?: string; message?: string}}};
            alert(err.response?.data?.error || err.response?.data?.message || 'Não foi possível recriar o calendário.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Recriar Calendário Acadêmico{turmaId ? ` - Turma #${turmaId}` : ''}</h1>
                {turmaInfo && <p className="master-detail-empty">{turmaInfo}</p>}

                <ModuleTabs
                    tabs={[
                        {
                            key: 'diasAula',
                            label: 'Dias Aula',
                            path: '/api/educacao/ocorrencia-componente-curricular',
                            params: turmaId ? {turmaId: Number(turmaId)} : undefined,
                            columns: CALENDARIO_COLUMNS,
                            maxMainColumns: CALENDARIO_COLUMNS.length,
                        },
                        {key: 'conflitos', label: 'Aulas com Conflito', empty: 'Nenhum conflito encontrado.'},
                        {key: 'coringa', label: 'Aulas Coringa', empty: 'Nenhuma aula coringa lançada.'},
                    ]}
                />

                <div className="modal-actions form-footer" style={{marginTop: '16px'}}>
                    <button
                        type="button"
                        className="btnblue"
                        disabled={salvando || !turmaId}
                        onClick={() => void salvar()}
                    >
                        {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                        type="button"
                        className="btn-form-back btnyellow"
                        onClick={() => navigate(-1)}
                    >
                        Voltar
                    </button>
                </div>
            </main>
        </PermissionGate>
    );
}
