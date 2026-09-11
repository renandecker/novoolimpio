import {useCallback, useEffect, useMemo, useState} from 'react';

import {ArrowLeft, Plus, Search, Trash2, X} from 'lucide-react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {api, useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';

import {Wizard, useWizardData} from '../../../shared/components/Wizard';

import {Tabs, type TabItem} from '../../../shared/components/Tabs';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {ApiItem} from '../../../shared/types/types.ts';

import {BooleanField} from '../../../shared/components/BooleanField';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

const ACaoDeCampanha = [
    {id: 1, descricao: 'Telemarketing Ativo', tipoCanal: {id: 1, descricao: 'Telefone'}},
    {id: 2, descricao: 'Telemarketing Receptivo', tipoCanal: {id: 1, descricao: 'Telefone'}},
    {id: 3, descricao: 'E-mail Marketing', tipoCanal: {id: 2, descricao: 'E-mail'}},
    {id: 4, descricao: 'WhatsApp', tipoCanal: {id: 3, descricao: 'WhatsApp'}},
    {id: 5, descricao: 'SMS', tipoCanal: {id: 4, descricao: 'SMS'}},
];

const TIPOS_FILTRO_LIGACAO = [
    {id: 0, descricao: 'Selecione'},
    {id: 6, descricao: 'Ligação nunca feita'},
    {id: 1, descricao: 'Resultado ligação'},
    {id: 2, descricao: 'Quantidade ligação'},
    {id: 3, descricao: 'Estar no período ligação'},
    {id: 5, descricao: 'Fora do período ligação'},
    {id: 4, descricao: 'Somente no período ligação'},
];

const OPERACOES = [
    {value: 'EQ', label: 'Igual'},
    {value: 'NE', label: 'Diferente'},
    {value: 'GT', label: 'Maior que'},
    {value: 'LT', label: 'Menor que'},
    {value: 'GE', label: 'Maior ou igual'},
    {value: 'LE', label: 'Menor ou igual'},
    {value: 'LIKE', label: 'Contém'},
    {value: 'BETWEEN', label: 'Entre'},
    {value: 'IN', label: 'Na lista'},
];

const TIPO_FILTRO_ACADEMICO = [
    {id: 0, descricao: 'Selecione'},
    {id: 1, descricao: 'Status Oferecimento'},
    {id: 2, descricao: 'Aluno'},
    {id: 3, descricao: 'Não aluno'},
    {id: 4, descricao: 'Matriculado no período'},
    {id: 5, descricao: 'Matriculado somente no período'},
    {id: 6, descricao: 'Matriculado fora do período'},
    {id: 7, descricao: 'Matriculado'},
    {id: 8, descricao: 'Não Matriculado'},
];

interface FiltroAcaoItem {
    key: string;
    id?: number;
    descricao?: string;
    tipoAcao?: {descricao: string};
    contratante?: {pessoaFisica: {nome: string}};
}

interface FiltroCampoItem {
    key: string;
    campo?: {id: number; rotulo: string; tipo: string};
    operacao?: string;
    valor?: string;
    data?: string;
    data2?: string;
    valorCidade?: string;
    valorCampoInformacao?: string;
}

interface FiltroLigacaoItem {
    key: string;
    tipoFiltro?: number;
    resultadoContato?: {descricao: string};
    operacao?: string;
    data?: string;
    data2?: string;
    quantidade?: number;
    quantidade2?: number;
}

interface FiltroAcademicoItem {
    key: string;
    tipoFiltro?: number;
    curriculo?: {sucinto: string; curso: {nome: string}};
    componenteCurricular?: {descricao: string};
    status?: string;
    operacao?: string;
    data?: string;
    data2?: string;
}

interface PacoteData {
    entity: {
        id?: number;
        acaoDeCampanhaId?: number;
        unidadeId?: number;
        numeroProspectos?: number;
    };
    filtrosAcao: FiltroAcaoItem[];
    filtrosCampo: FiltroCampoItem[];
    filtrosLigacao: FiltroLigacaoItem[];
    filtrosAcademico: FiltroAcademicoItem[];
    operacional: {
        direcionamento?: string;
        coordenadorId?: number;
        coordenadorNome?: string;
        usuarios: {id: number; login: string; nome?: string}[];
    };
}

const INITIAL_DATA: PacoteData = {
    entity: {},
    filtrosAcao: [],
    filtrosCampo: [],
    filtrosLigacao: [],
    filtrosAcademico: [],
    operacional: {usuarios: []},
};

export default function ViewPacoteFormPacoteListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [acoesCampanha, setAcoesCampanha] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [campos, setCampos] = useState<ApiItem[]>([]);
    const [salvando, setSalvando] = useState(false);

    const {data, updateField, updateFields} = useWizardData<PacoteData>(INITIAL_DATA);

    useEffect(() => {
        (async () => {
            try {
                const [acoes, uns, cps] = await Promise.all([
                    api.get<ApiItem[]>('/api/comercial/acao').then(r => r.data).catch(() => []),
                    api.get<ApiItem[]>('/api/basico/unidade').then(r => r.data).catch(() => []),
                    api.get<ApiItem[]>('/api/comercial/campo').then(r => r.data).catch(() => []),
                ]);
                setAcoesCampanha(acoes ?? []);
                setUnidades(uns ?? []);
                setCampos(cps ?? []);

                if (idEdicao) {
                    try {
                        const ent = (await api.get(`/api/central/pacotes/${idEdicao}`)).data;
                        updateFields({
                            entity: {...ent},
                            filtrosAcao: ent.filtrosAcao ?? [],
                            filtrosCampo: ent.filtrosCampo ?? [],
                            filtrosLigacao: ent.filtrosLigacao ?? [],
                            filtrosAcademico: ent.filtrosAcademico ?? [],
                            operacional: ent.operacional ?? {usuarios: []},
                        });
                    } catch (erro) {
                        console.error('Erro ao carregar pacote:', erro);
                        alert('Não foi possível carregar o pacote para edição');
                    }
                }
            } finally {
                setCarregando(false);
            }
        })();
    }, [idEdicao, updateFields]);

    const validateStep1 = useCallback(async (currentData: PacoteData) => {
        if (!currentData.entity.acaoDeCampanhaId) {
            return 'Selecione uma Ação de Campanha';
        }
        if (!currentData.entity.unidadeId) {
            return 'Selecione uma Unidade';
        }
        if (!currentData.entity.numeroProspectos || currentData.entity.numeroProspectos <= 0) {
            return 'Informe a quantidade de prospectos (maior que zero)';
        }
        return true;
    }, []);

    const validateStep2 = useCallback(async (_currentData: PacoteData) => {
        return true;
    }, []);

    const validateStep3 = useCallback(async (_currentData: PacoteData) => {
        return true;
    }, []);

    const handleComplete = useCallback(async (formData: PacoteData) => {
        setSalvando(true);
        try {
            const payload = {
                ...semId(formData.entity as unknown as Record<string, unknown>),
                filtrosAcao: formData.filtrosAcao,
                filtrosCampo: formData.filtrosCampo,
                filtrosLigacao: formData.filtrosLigacao,
                filtrosAcademico: formData.filtrosAcademico,
                operacional: formData.operacional,
            };

            if (idEdicao) {
                await api.put(`/api/central/pacotes/${idEdicao}`, payload);
            } else {
                await api.post('/api/central/pacotes', payload);
            }

            alert('Pacote salvo com sucesso!');
            navigate('/view/pacote/listPacote');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar pacote');
        } finally {
            setSalvando(false);
        }
    }, [api, idEdicao, navigate]);

    const voltar = useCallback(() => navigate('/view/pacote/listPacote'), [navigate]);

    const addFiltroAcao = useCallback(() => {
        updateField('filtrosAcao', [
            ...data.filtrosAcao,
            {key: `acao-${Date.now()}`, descricao: ''},
        ]);
    }, [data.filtrosAcao, updateField]);

    const removeFiltroAcao = useCallback((key: string) => {
        updateField('filtrosAcao', data.filtrosAcao.filter(f => f.key !== key));
    }, [data.filtrosAcao, updateField]);

    const addFiltroCampo = useCallback(() => {
        updateField('filtrosCampo', [
            ...data.filtrosCampo,
            {key: `campo-${Date.now()}`, campo: undefined, operacao: 'EQ', valor: ''},
        ]);
    }, [data.filtrosCampo, updateField]);

    const removeFiltroCampo = useCallback((key: string) => {
        updateField('filtrosCampo', data.filtrosCampo.filter(f => f.key !== key));
    }, [data.filtrosCampo, updateField]);

    const addFiltroLigacao = useCallback(() => {
        updateField('filtrosLigacao', [
            ...data.filtrosLigacao,
            {key: `ligacao-${Date.now()}`, tipoFiltro: 0},
        ]);
    }, [data.filtrosLigacao, updateField]);

    const removeFiltroLigacao = useCallback((key: string) => {
        updateField('filtrosLigacao', data.filtrosLigacao.filter(f => f.key !== key));
    }, [data.filtrosLigacao, updateField]);

    const addFiltroAcademico = useCallback(() => {
        updateField('filtrosAcademico', [
            ...data.filtrosAcademico,
            {key: `academico-${Date.now()}`, tipoFiltro: 0},
        ]);
    }, [data.filtrosAcademico, updateField]);

    const removeFiltroAcademico = useCallback((key: string) => {
        updateField('filtrosAcademico', data.filtrosAcademico.filter(f => f.key !== key));
    }, [data.filtrosAcademico, updateField]);

    const addUsuario = useCallback((usuario: ApiItem) => {
        const existe = data.operacional.usuarios.some(u => u.id === usuario.id);
        if (!existe) {
            updateField('operacional', {
                ...data.operacional,
                usuarios: [...data.operacional.usuarios, {id: usuario.id, login: usuario.login, nome: usuario.nome}],
            });
        }
    }, [data.operacional.usuarios, updateField]);

    const removeUsuario = useCallback((id: number) => {
        updateField('operacional', {
            ...data.operacional,
            usuarios: data.operacional.usuarios.filter(u => u.id !== id),
        });
    }, [data.operacional.usuarios, updateField]);

    const tabs: TabItem[] = useMemo(() => [
        {
            key: 'informacoes',
            label: 'Informações',
            content: (
                <div className="form-grid" style={{padding: 16}}>
                    <label className="form-field">
                        <span className="form-label">Ação de Campanha *</span>
                        <select className="form-input form-select"
                                value={str(data.entity.acaoDeCampanhaId)}
                                onChange={e => updateField('entity', {...data.entity, acaoDeCampanhaId: num(e.target.value)})}>
                            <option value="">Selecione</option>
                            {acoesCampanha.map(a => (
                                <option key={String(a.id)} value={String(a.id)}>
                                    {(a as any).descricao ?? (a as any).nome ?? `Ação #${a.id}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span className="form-label">Unidade *</span>
                        <select className="form-input form-select"
                                value={str(data.entity.unidadeId)}
                                onChange={e => updateField('entity', {...data.entity, unidadeId: num(e.target.value)})}>
                            <option value="">Selecione</option>
                            {unidades.map(u => (
                                <option key={String(u.id)} value={String(u.id)}>
                                    {(u as any).sucinto ?? (u as any).nomeFantasia ?? (u as any).razaoSocial ?? `Unidade #${u.id}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span className="form-label">Quantidade de Prospectos *</span>
                        <input className="form-input" type="number" min={1}
                               value={str(data.entity.numeroProspectos)}
                               onChange={e => updateField('entity', {...data.entity, numeroProspectos: num(e.target.value)})} />
                    </label>
                </div>
            ),
        },
        {
            key: 'filtros',
            label: 'Filtros',
            content: (
                <Tabs tabs={[
                    {
                        key: 'acao',
                        label: 'Ação',
                        content: (
                            <div className="form-grid" style={{padding: 16}}>
                                <label className="form-field">
                                    <span className="form-label">Filtrar por Ação</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosAcao[0]?.id ?? '')}
                                            onChange={e => {
                                                const id = num(e.target.value);
                                                if (id && data.filtrosAcao.length === 0) {
                                                    updateField('filtrosAcao', [{key: `acao-${Date.now()}`, id}]);
                                                } else if (data.filtrosAcao.length > 0) {
                                                    const novos = [...data.filtrosAcao];
                                                    novos[0] = {...novos[0], id};
                                                    updateField('filtrosAcao', novos);
                                                }
                                            }}>
                                        <option value="">Selecione</option>
                                        {acoesCampanha.map(a => (
                                            <option key={String(a.id)} value={String(a.id)}>
                                                {(a as any).descricao ?? (a as any).nome ?? `Ação #${a.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="form-buttons" style={{borderTop: 'none', marginTop: 8, gridColumn: 'span 2'}}>
                                    <button type="button" className="btnblue" onClick={addFiltroAcao}>
                                        <Plus className="icon" /> Adicionar Ação
                                    </button>
                                </div>

                                {data.filtrosAcao.length > 0 && (
                                    <table className="data-table" style={{marginTop: 14, width: '100%', gridColumn: 'span 2'}}>
                                        <thead>
                                        <tr>
                                            <th>Ação</th>
                                            <th>Tipo Ação</th>
                                            <th>Contratante</th>
                                            <th style={{width: 50}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.filtrosAcao.map(f => {
                                            const acao = acoesCampanha.find(a => Number(a.id) === Number(f.id));
                                            return (
                                                <tr key={f.key}>
                                                    <td>{(acao as any)?.descricao ?? (acao as any)?.nome ?? '-'}</td>
                                                    <td>{(acao as any)?.tipoAcao?.descricao ?? (acao as any)?.tipoCanal?.descricao ?? '-'}</td>
                                                    <td>{(acao as any)?.contratante?.pessoaFisica?.nome ?? '-'}</td>
                                                    <td>
                                                        <button type="button" className="btn-action btnred" title="Remover"
                                                                onClick={() => removeFiltroAcao(f.key)}><Trash2 className="icon" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: 'prospecto',
                        label: 'Prospecto',
                        content: (
                            <div className="form-grid" style={{padding: 16}}>
                                <div className="form-field">
                                    <span className="form-label">Filtrar por Nota do Prospecto</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosCampo.find(f => f.campo?.nome === 'nota')?.operacao ?? 'EQ')}
                                            onChange={e => {
                                                const op = e.target.value;
                                                updateField('filtrosCampo', data.filtrosCampo.map(f =>
                                                    f.campo?.nome === 'nota' ? {...f, operacao: op} : f
                                                ));
                                            }}>
                                        {OPERACOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <span className="form-label">Nota</span>
                                    <input className="form-input" type="number" min={0} max={10} step={1}
                                           value={str(data.filtrosCampo.find(f => f.campo?.nome === 'nota')?.valor ?? '')}
                                           onChange={e => {
                                               const val = e.target.value;
                                               updateField('filtrosCampo', data.filtrosCampo.map(f =>
                                                   f.campo?.nome === 'nota' ? {...f, valor: val} : f
                                               ));
                                           }} />
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'campos',
                        label: 'Campos',
                        content: (
                            <div className="form-grid" style={{padding: 16}}>
                                <label className="form-field">
                                    <span className="form-label">Campo *</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosCampo[data.filtrosCampo.length - 1]?.campo?.id ?? '')}
                                            onChange={e => {
                                                const id = num(e.target.value);
                                                const campo = campos.find(c => Number(c.id) === id);
                                                if (campo && data.filtrosCampo.length > 0) {
                                                    const novos = [...data.filtrosCampo];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], campo: {id: campo.id, rotulo: (campo as any).rotulo, tipo: (campo as any).tipo}};
                                                    updateField('filtrosCampo', novos);
                                                }
                                            }}>
                                    <option value="">Selecione</option>
                                    {campos.map(c => (
                                        <option key={String(c.id)} value={String(c.id)}>
                                            {(c as any).rotulo ?? (c as any).nome ?? `Campo #${c.id}`}
                                        </option>
                                    ))}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Operação *</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosCampo[data.filtrosCampo.length - 1]?.operacao ?? 'EQ')}
                                            onChange={e => {
                                                if (data.filtrosCampo.length > 0) {
                                                    const novos = [...data.filtrosCampo];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], operacao: e.target.value};
                                                    updateField('filtrosCampo', novos);
                                                }
                                            }}>
                                        {OPERACOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Valor *</span>
                                    <input className="form-input"
                                           value={str(data.filtrosCampo[data.filtrosCampo.length - 1]?.valor ?? '')}
                                           onChange={e => {
                                               if (data.filtrosCampo.length > 0) {
                                                   const novos = [...data.filtrosCampo];
                                                   novos[novos.length - 1] = {...novos[novos.length - 1], valor: e.target.value};
                                                   updateField('filtrosCampo', novos);
                                               }
                                           }} />
                                </label>

                                <div className="form-buttons" style={{borderTop: 'none', marginTop: 8, gridColumn: 'span 2'}}>
                                    <button type="button" className="btnblue" onClick={addFiltroCampo}>
                                        <Plus className="icon" /> Adicionar Filtro
                                    </button>
                                </div>

                                {data.filtrosCampo.length > 0 && (
                                    <table className="data-table" style={{marginTop: 14, width: '100%', gridColumn: 'span 2'}}>
                                        <thead>
                                        <tr>
                                            <th>Campo</th>
                                            <th>Operação</th>
                                            <th>Valor</th>
                                            <th style={{width: 50}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.filtrosCampo.map(f => (
                                            <tr key={f.key}>
                                                <td>{f.campo?.rotulo ?? '-'}</td>
                                                <td>{OPERACOES.find(o => o.value === f.operacao)?.label ?? f.operacao}</td>
                                                <td>{f.valor ?? '-'}</td>
                                                <td>
                                                    <button type="button" className="btn-action btnred" title="Remover"
                                                            onClick={() => removeFiltroCampo(f.key)}><Trash2 className="icon" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: 'ligacao',
                        label: 'Ligação',
                        content: (
                            <div className="form-grid" style={{padding: 16}}>
                                <label className="form-field">
                                    <span className="form-label">Tipo de Filtro *</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosLigacao[data.filtrosLigacao.length - 1]?.tipoFiltro ?? 0)}
                                            onChange={e => {
                                                if (data.filtrosLigacao.length > 0) {
                                                    const novos = [...data.filtrosLigacao];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], tipoFiltro: num(e.target.value)};
                                                    updateField('filtrosLigacao', novos);
                                                }
                                            }}>
                                        {TIPOS_FILTRO_LIGACAO.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Resultado</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosLigacao[data.filtrosLigacao.length - 1]?.resultadoContato?.descricao ?? '')}
                                            onChange={e => {
                                                if (data.filtrosLigacao.length > 0) {
                                                    const novos = [...data.filtrosLigacao];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], resultadoContato: {descricao: e.target.value}};
                                                    updateField('filtrosLigacao', novos);
                                                }
                                            }}>
                                        <option value="">Selecione</option>
                                        <option value="Atendido">Atendido</option>
                                        <option value="Não Atendido">Não Atendido</option>
                                        <option value="Ocupado">Ocupado</option>
                                        <option value="Erro">Erro</option>
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Operação</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosLigacao[data.filtrosLigacao.length - 1]?.operacao ?? 'EQ')}
                                            onChange={e => {
                                                if (data.filtrosLigacao.length > 0) {
                                                    const novos = [...data.filtrosLigacao];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], operacao: e.target.value};
                                                    updateField('filtrosLigacao', novos);
                                                }
                                            }}>
                                        {OPERACOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Data</span>
                                    <input className="form-input" type="date"
                                           value={toDateInput(data.filtrosLigacao[data.filtrosLigacao.length - 1]?.data)}
                                           onChange={e => {
                                               if (data.filtrosLigacao.length > 0) {
                                                   const novos = [...data.filtrosLigacao];
                                                   novos[novos.length - 1] = {...novos[novos.length - 1], data: e.target.value};
                                                   updateField('filtrosLigacao', novos);
                                               }
                                           }} />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Quantidade</span>
                                    <input className="form-input" type="number" min={1}
                                           value={str(data.filtrosLigacao[data.filtrosLigacao.length - 1]?.quantidade ?? '')}
                                           onChange={e => {
                                               if (data.filtrosLigacao.length > 0) {
                                                   const novos = [...data.filtrosLigacao];
                                                   novos[novos.length - 1] = {...novos[novos.length - 1], quantidade: num(e.target.value)};
                                                   updateField('filtrosLigacao', novos);
                                               }
                                           }} />
                                </label>

                                <div className="form-buttons" style={{borderTop: 'none', marginTop: 8, gridColumn: 'span 2'}}>
                                    <button type="button" className="btnblue" onClick={addFiltroLigacao}>
                                        <Plus className="icon" /> Adicionar Filtro
                                    </button>
                                </div>

                                {data.filtrosLigacao.length > 0 && (
                                    <table className="data-table" style={{marginTop: 14, width: '100%', gridColumn: 'span 2'}}>
                                        <thead>
                                        <tr>
                                            <th>Filtro</th>
                                            <th>Resultado</th>
                                            <th>Operação</th>
                                            <th>Data</th>
                                            <th>Qtd</th>
                                            <th style={{width: 50}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.filtrosLigacao.map(f => (
                                            <tr key={f.key}>
                                                <td>{TIPOS_FILTRO_LIGACAO.find(t => t.id === f.tipoFiltro)?.descricao ?? '-'}</td>
                                                <td>{f.resultadoContato?.descricao ?? '-'}</td>
                                                <td>{OPERACOES.find(o => o.value === f.operacao)?.label ?? f.operacao}</td>
                                                <td>{f.data ? toDateInput(f.data) : '-'}</td>
                                                <td>{f.quantidade ?? '-'}</td>
                                                <td>
                                                    <button type="button" className="btn-action btnred" title="Remover"
                                                            onClick={() => removeFiltroLigacao(f.key)}><Trash2 className="icon" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: 'academico',
                        label: 'Acadêmico',
                        content: (
                            <div className="form-grid" style={{padding: 16}}>
                                <label className="form-field">
                                    <span className="form-label">Tipo de Filtro *</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.tipoFiltro ?? 0)}
                                            onChange={e => {
                                                if (data.filtrosAcademico.length > 0) {
                                                    const novos = [...data.filtrosAcademico];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], tipoFiltro: num(e.target.value)};
                                                    updateField('filtrosAcademico', novos);
                                                }
                                            }}>
                                        {TIPO_FILTRO_ACADEMICO.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Curso</span>
                                    <AutoComplete
                                        value={str(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.curriculo?.sucinto ?? '')}
                                        onChange={async (val) => {
                                            if (data.filtrosAcademico.length > 0) {
                                                const novos = [...data.filtrosAcademico];
                                                novos[novos.length - 1] = {...novos[novos.length - 1], curriculo: {sucinto: val, curso: {nome: ''}}};
                                                updateField('filtrosAcademico', novos);
                                            }
                                        }}
                                        fetchSuggestions={async (query) => {
                                            if (query.length < 3) return [];
                                            try {
                                                const res = await api.get<ApiItem[]>('/api/educacao/curriculo', {params: {q: query}});
                                                return (res.data ?? []).map(c => ({id: c.id, label: (c as any).sucinto ?? (c as any).nome ?? `Curso #${c.id}`}));
                                            } catch { return []; }
                                        }}
                                        getOptionLabel={opt => opt.label}
                                    />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Componente Curricular</span>
                                    <AutoComplete
                                        value={str(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.componenteCurricular?.descricao ?? '')}
                                        onChange={async (val) => {
                                            if (data.filtrosAcademico.length > 0) {
                                                const novos = [...data.filtrosAcademico];
                                                novos[novos.length - 1] = {...novos[novos.length - 1], componenteCurricular: {descricao: val}};
                                                updateField('filtrosAcademico', novos);
                                            }
                                        }}
                                        fetchSuggestions={async (query) => {
                                            if (query.length < 3) return [];
                                            try {
                                                const res = await api.get<ApiItem[]>('/api/educacao/componente-curricular', {params: {q: query}});
                                                return (res.data ?? []).map(c => ({id: c.id, label: (c as any).descricao ?? `Componente #${c.id}`}));
                                            } catch { return []; }
                                        }}
                                        getOptionLabel={opt => opt.label}
                                    />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Status</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.status ?? '')}
                                            onChange={e => {
                                                if (data.filtrosAcademico.length > 0) {
                                                    const novos = [...data.filtrosAcademico];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], status: e.target.value};
                                                    updateField('filtrosAcademico', novos);
                                                }
                                            }}>
                                        <option value="">Selecione</option>
                                        <option value="ABERTO">Aberto</option>
                                        <option value="FECHADO">Fechado</option>
                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Operação</span>
                                    <select className="form-input form-select"
                                            value={str(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.operacao ?? 'EQ')}
                                            onChange={e => {
                                                if (data.filtrosAcademico.length > 0) {
                                                    const novos = [...data.filtrosAcademico];
                                                    novos[novos.length - 1] = {...novos[novos.length - 1], operacao: e.target.value};
                                                    updateField('filtrosAcademico', novos);
                                                }
                                            }}>
                                        {OPERACOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Data</span>
                                    <input className="form-input" type="date"
                                           value={toDateInput(data.filtrosAcademico[data.filtrosAcademico.length - 1]?.data)}
                                           onChange={e => {
                                               if (data.filtrosAcademico.length > 0) {
                                                   const novos = [...data.filtrosAcademico];
                                                   novos[novos.length - 1] = {...novos[novos.length - 1], data: e.target.value};
                                                   updateField('filtrosAcademico', novos);
                                               }
                                           }} />
                                </label>

                                <div className="form-buttons" style={{borderTop: 'none', marginTop: 8, gridColumn: 'span 2'}}>
                                    <button type="button" className="btnblue" onClick={addFiltroAcademico}>
                                        <Plus className="icon" /> Adicionar Filtro
                                    </button>
                                </div>

                                {data.filtrosAcademico.length > 0 && (
                                    <table className="data-table" style={{marginTop: 14, width: '100%', gridColumn: 'span 2'}}>
                                        <thead>
                                        <tr>
                                            <th>Filtro</th>
                                            <th>Curso</th>
                                            <th>Componente</th>
                                            <th>Status</th>
                                            <th>Operação</th>
                                            <th>Data</th>
                                            <th style={{width: 50}}></th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.filtrosAcademico.map(f => (
                                            <tr key={f.key}>
                                                <td>{TIPO_FILTRO_ACADEMICO.find(t => t.id === f.tipoFiltro)?.descricao ?? '-'}</td>
                                                <td>{f.curriculo?.sucinto ?? '-'}</td>
                                                <td>{f.componenteCurricular?.descricao ?? '-'}</td>
                                                <td>{f.status ?? '-'}</td>
                                                <td>{OPERACOES.find(o => o.value === f.operacao)?.label ?? f.operacao}</td>
                                                <td>{f.data ? toDateInput(f.data) : '-'}</td>
                                                <td>
                                                    <button type="button" className="btn-action btnred" title="Remover"
                                                            onClick={() => removeFiltroAcademico(f.key)}><Trash2 className="icon" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ),
                    },
                ]} />
            ),
        },
        {
            key: 'operacional',
            label: 'Operacional',
            content: (
                <div className="form-grid" style={{padding: 16}}>
                    <label className="form-field">
                        <span className="form-label">Direcionamento *</span>
                        <select className="form-input form-select"
                                value={str(data.operacional.direcionamento ?? '')}
                                onChange={e => updateField('operacional', {...data.operacional, direcionamento: e.target.value})}>
                            <option value="">Selecione</option>
                            <option value="INTERNO">Interno</option>
                        </select>
                    </label>

                    <label className="form-field">
                        <span className="form-label">Coordenador</span>
                        <AutoComplete
                            value={str(data.operacional.coordenadorNome ?? '')}
                            onChange={async (val) => {
                                updateField('operacional', {...data.operacional, coordenadorNome: val});
                            }}
                            fetchSuggestions={async (query) => {
                                if (query.length < 3) return [];
                                try {
                                    const res = await api.get<ApiItem[]>('/api/basico/usuario', {params: {q: query}});
                                    return (res.data ?? []).map(u => ({id: u.id, label: (u as any).login ?? (u as any).nome ?? `Usuário #${u.id}`}));
                                } catch { return []; }
                            }}
                            getOptionLabel={opt => opt.label}
                            onSelect={opt => updateField('operacional', {...data.operacional, coordenadorId: opt.id, coordenadorNome: opt.label})}
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">Equipe (Operadores)</span>
                        <AutoComplete
                            value=""
                            onChange={async () => {}}
                            fetchSuggestions={async (query) => {
                                if (query.length < 3) return [];
                                try {
                                    const res = await api.get<ApiItem[]>('/api/basico/usuario', {params: {q: query}});
                                    return (res.data ?? []).map(u => ({id: u.id, label: (u as any).login ?? (u as any).nome ?? `Usuário #${u.id}`}));
                                } catch { return []; }
                            }}
                            getOptionLabel={opt => opt.label}
                            onSelect={addUsuario}
                        />
                    </label>

                    {data.operacional.usuarios.length > 0 && (
                        <table className="data-table" style={{marginTop: 14, width: '100%', gridColumn: 'span 2'}}>
                            <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Login</th>
                                <th style={{width: 50}}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.operacional.usuarios.map(u => (
                                <tr key={u.id}>
                                    <td>{u.nome ?? '-'}</td>
                                    <td>{u.login}</td>
                                    <td>
                                        <button type="button" className="btn-action btnred" title="Remover"
                                                onClick={() => removeUsuario(u.id)}><Trash2 className="icon" /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ),
        },
    ], [
        data, acoesCampanha, unidades, campos,
        addFiltroAcao, removeFiltroAcao,
        addFiltroCampo, removeFiltroCampo,
        addFiltroLigacao, removeFiltroLigacao,
        addFiltroAcademico, removeFiltroAcademico,
        addUsuario, removeUsuario,
        updateField
    ]);

    if (carregando) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <PermissionGate permission="WRITE">
            <main style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h1>{idEdicao ? 'Editar Pacote' : 'Novo Pacote'}</h1>
                    <button className="btn-form-back" onClick={voltar}><ArrowLeft className="icon" /> Voltar</button>
                </div>

                <Wizard
                    steps={tabs.map(t => ({key: t.key, label: t.label, content: t.content, validate: t.key === 'informacoes' ? validateStep1 : t.key === 'filtros' ? validateStep2 : validateStep3}))}
                    onComplete={handleComplete}
                    initialData={data}
                    onDataChange={updateFields}
                    completeLabel="Salvar Pacote"
                />
            </main>
        </PermissionGate>
    );
}
