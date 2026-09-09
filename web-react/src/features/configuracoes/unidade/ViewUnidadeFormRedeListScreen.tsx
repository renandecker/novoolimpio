import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';
import {MasterDetail} from '../../shared/components/MasterDetail';
import type {ApiItem} from '../../features/auth/types';
import {api} from '../../shared/services/api';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../../shared/services/masterDetailSources';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

export default function ViewUnidadeFormRedeListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [redeId, setRedeId] = useState<number | undefined>();
    const [redeOriginal, setRedeOriginal] = useState<Record<string, unknown> | null>(null);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});

    const tabs: FormTabConfig[] = [
        {
            key: 'geral',
            label: 'Geral',
            fields: [
                {name: 'id', label: 'ID', type: 'text', readOnly: true, span: 1},
                {name: 'razaoSocial', label: 'Razão Social', required: true, span: 3},
                {name: 'nomeFantasia', label: 'Nome Fantasia', required: true, span: 3},
                {name: 'cnpj', label: 'CNPJ', type: 'mask', mask: '99.999.999/9999-99', required: true, span: 2},
                {name: 'usuario', label: 'Usuário Responsável', type: 'autoComplete', autoCompleteSource: '/api/view/usuario/listUsuario', span: 2},
                {name: 'layout', label: 'Layout', type: 'autoComplete', autoCompleteSource: '/api/educacao/layout', span: 2},
            ],
        },
        {
            key: 'unidade',
            label: 'Unidade',
            content: (
                <MasterDetail
                    label="Unidade"
                    source={UNIDADE_SOURCE}
                    valueKey="id"
                    searchKeys={UNIDADE_SEARCH}
                    columns={UNIDADE_COLUMNS}
                    items={unidades}
                    onChange={setUnidades}
                />
            ),
        },
    ];

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                // tenta buscar via basico (microserviço) e fallback para view
                let rede: Record<string, unknown> | null = null;
                try {
                    rede = (await api.get<Record<string, unknown>>(`/api/basico/rede/${idParam}`)).data;
                } catch {
                    try {
                        rede = (await api.get<Record<string, unknown>>(`/api/view/unidade/formRede/${idParam}`)).data;
                    } catch {
                        rede = null;
                    }
                }
                if (!ativo || !rede) return;
                setRedeId(rede.id as number);
                setRedeOriginal(rede as Record<string, unknown>);

                // mapeia campos - suporta tanto camelCase quanto snake_case, e objetos aninhados
                const usuarioVal = (rede as any).usuario?.id ?? (rede as any).usuarioId ?? (rede as any).id_usuario ?? (rede as any).usuario ?? '';
                const layoutVal = (rede as any).layout?.id ?? (rede as any).layoutId ?? (rede as any).id_layout ?? (rede as any).layout ?? '';

                setInitialValues({
                    id: str(rede.id),
                    razaoSocial: str((rede as any).razaoSocial ?? (rede as any).razao_social ?? ''),
                    nomeFantasia: str((rede as any).nomeFantasia ?? (rede as any).nome_fantasia ?? ''),
                    cnpj: str((rede as any).cnpj ?? ''),
                    usuario: str(usuarioVal),
                    layout: str(layoutVal),
                });

                // unidades pode vir como unidades, listaDetalheUnidade, listaUnidades
                const unidadesRaw = (rede as any).unidades ?? (rede as any).listaDetalheUnidade ?? (rede as any).listaUnidades ?? [];
                if (Array.isArray(unidadesRaw) && unidadesRaw.length > 0) {
                    setUnidades(unidadesRaw as ApiItem[]);
                } else if (redeId) {
                    // tenta buscar detalhes via endpoint de detalhe (se existir)
                    try {
                        const det = (await api.get<ApiItem[]>(`/api/basico/rede/${rede.id}/unidades`)).data;
                        if (Array.isArray(det)) setUnidades(det);
                    } catch {
                        // ignora
                    }
                }
            } catch (erro) {
                console.error('Erro ao carregar rede:', erro);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam]);

    const voltar = () => navigate('/view/unidade/listRede');

    const salvarComVals = async (vals: Record<string, unknown>) => {
        const v = vals as Record<string, string>;
        if (!v.razaoSocial || !v.nomeFantasia || !v.cnpj) {
            setError('Informe pelo menos Razão Social, Nome Fantasia e CNPJ.');
            return;
        }
        if (!v.usuario) {
            setError('Informe o usuário responsável.');
            return;
        }
        if (unidades.length === 0) {
            setError('Selecione pelo menos uma unidade.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const body: Record<string, unknown> = {
                ...semId(redeOriginal),
                razaoSocial: v.razaoSocial,
                nomeFantasia: v.nomeFantasia,
                cnpj: v.cnpj,
                usuarioId: num(v.usuario as string),
                layoutId: v.layout ? num(v.layout as string) : null,
                // compatibilidade com backend legado e microserviço
                unidades: unidades.map(u => ({id: (u as any).id})),
                unidadeIds: unidades.map(u => (u as any).id),
            };
            const resposta = redeId
                ? await api.put(`/api/basico/rede/${redeId}`, body)
                : await api.post('/api/basico/rede', body);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? redeId;
            alert('Registro salvo com sucesso.');
            if (novoId && !redeId) {
                navigate(`/view/unidade/formRede?id=${novoId}`);
            } else {
                voltar();
            }
        } catch (erro: any) {
            console.error('Erro ao salvar rede:', erro);
            const msg = erro?.response?.data?.error ?? erro?.response?.data?.message ?? 'Erro ao salvar registro.';
            setError(String(msg));
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Rede"
                    tabs={tabs}
                    initialValues={initialValues}
                    onSubmit={(vals) => {
                        setInitialValues(vals);
                        salvarComVals(vals);
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
