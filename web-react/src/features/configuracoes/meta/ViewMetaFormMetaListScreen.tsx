import {PermissionGate} from '../../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../../shared/components/FormLayout';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types.ts';

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);
const bool = (v: unknown): boolean => v === true || v === 'true';

const OPERADOR_OPTIONS: ApiItem[] = [];
const OPERACIONAL_OPTIONS: ApiItem[] = [];

export default function ViewMetaFormMetaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [metaId, setMetaId] = useState<number | undefined>();
    const [metaOriginal, setMetaOriginal] = useState<Record<string, unknown> | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [periodo, setPeriodo] = useState(true);
    const [equipe, setEquipe] = useState(false);

    const tabs: FormTabConfig[] = [
        {
            key: 'dados',
            label: 'Dados da Meta',
            fields: [
                {name: 'id', label: 'ID', type: 'text', readOnly: true, span: 1},
                {name: 'coordenador', label: 'Coordenador', type: 'text', readOnly: true, span: 2},
                {name: 'meta', label: 'Meta Diária *', type: 'number', required: true, span: 1},
                {name: 'periodo', label: 'Tipo Período', type: 'select', options: [{value: 'true', label: 'Período'}, {value: 'false', label: 'Data'}], span: 2},
                {name: 'data', label: 'Data', type: 'date', span: 1},
                {name: 'dataInicial', label: 'Data Inicial', type: 'date', span: 1},
                {name: 'dataFinal', label: 'Data Final', type: 'date', span: 1},
                {name: 'equipe', label: 'Tipo Seleção', type: 'select', options: [{value: 'true', label: 'Equipe'}, {value: 'false', label: 'Operador'}], span: 2},
                {name: 'operador', label: 'Operador', type: 'select', options: OPERADOR_OPTIONS.map(o => ({value: str(o.id), label: str(o.login)})), span: 2},
                {name: 'operacional', label: 'Equipe', type: 'select', options: OPERACIONAL_OPTIONS.map(o => ({value: str(o.id), label: `${str(o.pacote?.id)} - ${str(o.pacote?.descricao)}`})), span: 2},
            ],
        },
    ];

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const meta = (await api.get<Record<string, unknown>>(`/api/view/meta/formMeta/${idParam}`)).data;
                if (!ativo) return;
                setMetaId(meta.id as number);
                setMetaOriginal(meta);
                setPeriodo(meta.periodo === true);
                setEquipe(meta.equipe === true);
                setInitialValues({
                    id: str(meta.id),
                    coordenador: str(meta.usuario?.login ?? meta.operador?.login),
                    meta: num(str(meta.meta)),
                    periodo: meta.periodo === true,
                    data: toDateInput(meta.data),
                    dataInicial: toDateInput(meta.dataInicial),
                    dataFinal: toDateInput(meta.dataFinal),
                    equipe: meta.equipe === true,
                    operador: str(meta.operador?.id),
                    operacional: str(meta.operacional?.id),
                });
            } catch (erro) {
                console.error('Erro ao carregar meta:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => { ativo = false; };
    }, [idParam]);

    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setPeriodo(initialValues.periodo === 'true' || initialValues.periodo === true);
            setEquipe(initialValues.equipe === 'true' || initialValues.equipe === true);
        }
    }, [initialValues]);

    const voltar = () => navigate('/view/meta/listMeta');

    const salvar = async (voltarDepois: boolean) => {
        const vals = initialValues;
        if (!vals.meta) {
            setError('Informe a Meta Diária.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const metaBody: Record<string, unknown> = {
                ...metaOriginal,
                meta: num(vals.meta as string),
                periodo: vals.periodo === 'true' || vals.periodo === true,
                data: vals.data || null,
                dataInicial: vals.dataInicial || null,
                dataFinal: vals.dataFinal || null,
                equipe: vals.equipe === 'true' || vals.equipe === true,
                operadorId: num(vals.operador as string),
                operacionalId: num(vals.operacional as string),
            };
            const resposta = metaId
                ? await api.put(`/api/central/meta/${metaId}`, metaBody)
                : await api.post('/api/central/meta', metaBody);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? metaId;
            if (voltarDepois) {
                voltar();
            } else {
                alert('Registro salvo com sucesso.');
                navigate(`/view/meta/formMeta?id=${novoId}`);
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setError('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Meta"
                    tabs={tabs}
                    initialValues={initialValues}
                    onSubmit={(vals) => {
                        setInitialValues(vals);
                        salvar(false);
                    }}
                    onCancel={voltar}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                    saving={salvando}
                    error={error}
                />
            </main>
        </PermissionGate>
    );
}
