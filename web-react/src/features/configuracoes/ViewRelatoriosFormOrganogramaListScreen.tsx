import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';
import {api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';

// Mesmas 3 opções de direção do AG Charts Org Chart (ver tela de visualização).
const DIRECAO_OPTIONS = [
    {value: 'HORIZONTAL', label: 'Horizontal'},
    {value: 'VERTICAL', label: 'Vertical'},
    {value: 'TOGGLE_REVERSE', label: 'Toggle Reverse'},
];

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const tabs: FormTabConfig[] = [
    {
        key: 'definicao',
        label: 'Definição',
        fields: [
            {name: 'id', label: 'ID', readOnly: true, span: 1},
            {name: 'nome', label: 'Nome', required: true, span: 3},
            {name: 'direcao', label: 'Direção', type: 'select', options: DIRECAO_OPTIONS, required: true, span: 1},
            {
                name: 'sql',
                label: 'SQL',
                type: 'textarea',
                required: true,
                span: 4,
                placeholder: 'select id, parentId, name, job, department, location, status, avatar from <Tabela> where <condição>',
            },
        ],
    },
];

export default function ViewRelatoriosFormOrganogramaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [organogramaId, setOrganogramaId] = useState<number | undefined>();
    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({direcao: 'VERTICAL'});
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const resp = await api.get<Record<string, unknown>>(`${API_PATHS.relatorios.organograma}/${idParam}`);
                if (!ativo) return;
                const organograma = resp.data;
                setOrganogramaId(organograma.id as number);
                setInitialValues({
                    id: str(organograma.id),
                    nome: str(organograma.nome),
                    direcao: str(organograma.direcao) || 'VERTICAL',
                    sql: str(organograma.sql),
                });
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam]);

    const voltar = () => navigate('/view/relatorios/listOrganograma');

    const salvar = async (vals: Record<string, unknown>) => {
        if (!vals.nome || !vals.sql) {
            setError('Informe pelo menos Nome e SQL.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const body = {
                nome: vals.nome,
                direcao: vals.direcao || 'VERTICAL',
                sql: vals.sql,
            };
            const resposta = organogramaId
                ? await api.put(`${API_PATHS.relatorios.organograma}/${organogramaId}`, body)
                : await api.post(API_PATHS.relatorios.organograma, body);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? organogramaId;
            alert('Organograma salvo com sucesso.');
            navigate(`/view/relatorios/formOrganograma?id=${novoId}`);
        } catch (erro) {
            console.error('Erro ao salvar organograma:', erro);
            setError('Erro ao salvar organograma.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Organograma"
                    tabs={tabs}
                    initialValues={initialValues}
                    onSubmit={salvar}
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
