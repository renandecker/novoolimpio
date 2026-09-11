import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs, ModuleTabItem} from '../../../shared/components/ModuleTabs';
import {DataTable, DataTableColumn} from '../../../shared/components/DataTable';
import {useState, useEffect} from 'react';
import {api} from '../../../shared/services/api';
import type {ApiItem} from '../../../shared/types/types.ts';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const FORMATO_LABELS: Record<string, string> = {
    'R': 'Real (R$)',
    'P': 'Percentual (%)',
    'N': 'Numérico',
};

export default function ViewMetaIndicadorMetaDinamicaListScreen() {
    const [activeTab, setActiveTab] = useState<string>('meta');
    const [metaDinamica, setMetaDinamica] = useState<Record<string, unknown>>({});
    const [metaValors, setMetaValors] = useState<Record<string, unknown>[]>([]);
    const [metaDiaNaoUtils, setMetaDiaNaoUtils] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [controleDiarizacao, setControleDiarizacao] = useState(false);
    const [controleEdicao, setControleEdicao] = useState(false);
    const [todosMeses, setTodosMeses] = useState(false);
    const [percentualTotal, setPercentualTotal] = useState<string>('0,00%');
    const [metaDinamicaWapper, setMetaDinamicaWapper] = useState<Record<string, unknown> | null>(null);

    const tabs: ModuleTabItem[] = [
        {
            key: 'meta',
            label: 'Meta',
            path: '/api/view/meta/listMetaDinamica',
            columns: [
                {key: 'id', label: 'ID'},
                {key: 'indicador_nome', label: 'Indicador'},
                {key: 'unidade_sucinto', label: 'Unidade'},
                {key: 'ano', label: 'Ano'},
                {key: 'mes', label: 'Mês'},
            ],
            createNavigateTo: '/view/meta/formMetaDinamica',
            editNavigateTo: '/view/meta/formMetaDinamica',
        },
        {
            key: 'valores',
            label: 'Valores da Meta',
            path: '/api/view/meta/indicadorMetaDinamica',
            columns: [
                {key: 'descricao', label: 'Descrição'},
                {key: 'formato', label: 'Formato', render: (item) => String(FORMATO_LABELS[(item as Record<string, unknown>).formato as string] ?? (item as Record<string, unknown>).formato)},
            ],
        },
    ];

    useEffect(() => {
        if (activeTab === 'meta') {
            loadMetaDinamica();
        }
    }, [activeTab]);

    const loadMetaDinamica = async () => {
        setLoading(true);
        setError(undefined);
        try {
            const metaResp = await api.get('/api/view/meta/listMetaDinamica');
            if (metaResp.data?.content && metaResp.data.content.length > 0) {
                const first = metaResp.data.content[0];
                setMetaDinamica(first);
                setControleDiarizacao(false);
                setControleEdicao(false);
                setTodosMeses(false);
            }
        } catch (erro) {
            console.error('Erro ao carregar meta dinâmica:', erro);
            setError('Erro ao carregar dados da meta.');
        } finally {
            setLoading(false);
        }
    };

    const somarPercentualSemana = () => {
        const percKeys = ['percSegunda', 'percTerca', 'percQuarta', 'percQuinta', 'percSexta', 'percSabado', 'percDomingo'];
        let total = 0;
        for (const key of percKeys) {
            const val = metaDinamica[key];
            if (val !== null && val !== undefined && val !== '') {
                total += parseFloat(String(val).replace(',', '.')) || 0;
            }
        }
        setPercentualTotal(`${total.toFixed(2).replace('.', ',')}%`);
    };

    useEffect(() => {
        somarPercentualSemana();
    }, [metaDinamica.percSegunda, metaDinamica.percTerca, metaDinamica.percQuarta, metaDinamica.percQuinta, metaDinamica.percSexta, metaDinamica.percSabado, metaDinamica.percDomingo]);

    const handleMetaDinamicaChange = (field: string, value: unknown) => {
        setMetaDinamica(prev => ({...prev, [field]: value}));
        if (field === 'indicador') {
            setTodosMeses(false);
        }
    };

    const novaMeta = () => {
        setControleDiarizacao(false);
        setControleEdicao(false);
        setMetaDinamica(prev => ({...prev, metaValors: []}));
        setMetaValors([]);
        setMetaDiaNaoUtils([]);
        setPercentualTotal('0,00%');
    };

    const salvar = async (continuar: boolean) => {
        setLoading(true);
        setError(undefined);
        try {
            const body = {
                ...metaDinamica,
                todosMeses,
            };
            if (metaDinamica.id) {
                await api.put(`/api/view/meta/formMetaDinamica/${metaDinamica.id}`, body);
            } else {
                await api.post('/api/view/meta/formMetaDinamica', body);
            }
            alert('Meta salva com sucesso.');
            if (!continuar) {
                loadMetaDinamica();
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setError('Erro ao salvar meta dinâmica.');
        } finally {
            setLoading(false);
        }
    };

    const diarizar = async () => {
        setLoading(true);
        setError(undefined);
        try {
            await api.post('/api/comercial/meta-dinamica/diarizar', {metaDinamicaId: metaDinamica.id});
            alert('Diarização realizada com sucesso.');
            loadMetaDinamica();
        } catch (erro) {
            console.error('Erro ao diarizar:', erro);
            setError('Erro ao diarizar valores.');
        } finally {
            setLoading(false);
        }
    };

    const diarizarEdicao = async () => {
        setLoading(true);
        setError(undefined);
        try {
            await api.post('/api/comercial/meta-dinamica/diarizarEdicao', {metaDinamicaId: metaDinamica.id});
            alert('Diarização de edição realizada com sucesso.');
            loadMetaDinamica();
        } catch (erro) {
            console.error('Erro ao diarizar edição:', erro);
            setError('Erro ao diarizar valores de edição.');
        } finally {
            setLoading(false);
        }
    };

    const adicionarDia = () => {
        const dia = (metaDinamica.metaDiaNaoUtil as Record<string, unknown>)?.dia;
        if (!dia) return;
        setMetaDiaNaoUtils(prev => [...prev, {id: Date.now(), dia}]);
        setMetaDinamica(prev => ({...prev, metaDiaNaoUtil: {dia: ''}}));
    };

    const removerDia = (item: Record<string, unknown>) => {
        setMetaDiaNaoUtils(prev => prev.filter(i => i.id !== item.id));
    };

    const alterar = () => {
        setControleEdicao(true);
        setControleDiarizacao(false);
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Indicador Meta Dinâmica</h1>
                {error && <div style={{color: 'crimson', marginBottom: '16px'}}>{error}</div>}
                {loading && <div>Carregando...</div>}

                <ModuleTabs
                    tabs={tabs}
                    initial={activeTab}
                />

                {activeTab === 'meta' && (
                    <div style={{marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
                        <h2>Definição</h2>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Indicador *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={str(metaDinamica.indicador_nome)}
                                    onChange={(e) => handleMetaDinamicaChange('indicador_nome', e.target.value)}
                                    placeholder="Digite para buscar indicador..."
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Unidade *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={str(metaDinamica.unidade_sucinto)}
                                    onChange={(e) => handleMetaDinamicaChange('unidade_sucinto', e.target.value)}
                                    placeholder="Digite para buscar unidade..."
                                />
                            </div>
                            <div>
                                <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}>
                                    <input
                                        type="checkbox"
                                        checked={todosMeses}
                                        onChange={(e) => setTodosMeses(e.target.checked)}
                                    />
                                    Todos os meses
                                </label>
                            </div>
                            {!todosMeses && (
                                <div>
                                    <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Mês *</label>
                                    <select
                                        className="form-input form-select"
                                        value={str(metaDinamica.mes)}
                                        onChange={(e) => handleMetaDinamicaChange('mes', e.target.value)}
                                        disabled={controleDiarizacao || controleEdicao}
                                    >
                                        <option value="">-- Selecione --</option>
                                        <option value="1">Janeiro</option>
                                        <option value="2">Fevereiro</option>
                                        <option value="3">Março</option>
                                        <option value="4">Abril</option>
                                        <option value="5">Maio</option>
                                        <option value="6">Junho</option>
                                        <option value="7">Julho</option>
                                        <option value="8">Agosto</option>
                                        <option value="9">Setembro</option>
                                        <option value="10">Outubro</option>
                                        <option value="11">Novembro</option>
                                        <option value="12">Dezembro</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Ano *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={str(metaDinamica.ano)}
                                    onChange={(e) => handleMetaDinamicaChange('ano', e.target.value)}
                                    disabled={controleDiarizacao || controleEdicao}
                                />
                            </div>
                        </div>

                        <h2>Metas</h2>
                        <DataTable
                            path="/api/view/meta/indicadorMetaDinamica/valores"
                            columns={[
                                {key: 'indicadorMeta_descricao', label: 'Descrição'},
                                {key: 'valor', label: 'Valor'},
{key: 'formato', label: 'Formato', render: (item) => String(FORMATO_LABELS[(item as Record<string, unknown>).formato as string] ?? (item as Record<string, unknown>).formato)},
                            ]}
                        />
                    </div>
                )}

                {activeTab === 'semana' && (
                    <div style={{marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
                        <h2>Percentual Semana</h2>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'}}>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Segunda</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percSegunda)}
                                    onChange={(e) => handleMetaDinamicaChange('percSegunda', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Terça</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percTerca)}
                                    onChange={(e) => handleMetaDinamicaChange('percTerca', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Quarta</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percQuarta)}
                                    onChange={(e) => handleMetaDinamicaChange('percQuarta', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Quinta</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percQuinta)}
                                    onChange={(e) => handleMetaDinamicaChange('percQuinta', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Sexta</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percSexta)}
                                    onChange={(e) => handleMetaDinamicaChange('percSexta', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Sábado</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percSabado)}
                                    onChange={(e) => handleMetaDinamicaChange('percSabado', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Domingo</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-input"
                                    value={str(metaDinamica.percDomingo)}
                                    onChange={(e) => handleMetaDinamicaChange('percDomingo', e.target.value)}
                                    disabled={controleDiarizacao}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Total</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={percentualTotal}
                                    readOnly
                                    style={{backgroundColor: '#f0f0f0'}}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'diasNaoUteis' && (
                    <div style={{marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
                        <h2>Dias para não diarizar</h2>
                        <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                            <input
                                type="number"
                                className="form-input"
                                style={{width: '80px'}}
                                value={str((metaDinamica.metaDiaNaoUtil as Record<string, unknown>)?.dia)}
                                onChange={(e) => handleMetaDinamicaChange('metaDiaNaoUtil', {...(metaDinamica.metaDiaNaoUtil as Record<string, unknown> || {}), dia: e.target.value})}
                                disabled={controleDiarizacao}
                                placeholder="Dia"
                            />
                            <button
                                className="btn-primary btnstop"
                                onClick={adicionarDia}
                                disabled={controleDiarizacao}
                            >
                                Adicionar Dia
                            </button>
                        </div>
                        <DataTable
                            path="/api/view/meta/indicadorMetaDinamica/diasNaoUteis"
                            columns={[
                                {key: 'dia', label: 'Dia'},
                            ]}
                            extraRowActions={[
                                {
                                    key: 'remover',
                                    title: 'Remover',
                                    className: 'btn-danger',
                                    icon: '−',
                                    onClick: removerDia,
                                },
                            ]}
                        />
                    </div>
                )}

                {activeTab === 'diarizacao' && (
                    <div style={{marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px'}}>
                        <h2>Diarização</h2>
                        {metaDinamicaWapper && (
                            <DataTable
                                path="/api/view/meta/indicadorMetaDinamica/diarizacao"
                                columns={[
                                    {key: 'semana', label: 'Semana'},
                                    {key: 'percentualSemana', label: 'Percentual (%)'},
                                    {key: 'valorSemana', label: 'Valor'},
                                ]}
                            />
                        )}
                    </div>
                )}

                <div style={{marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    <button
                        className="btn-primary btnyellow"
                        onClick={() => window.history.back()}
                    >
                        Voltar
                    </button>

                    {!controleDiarizacao && !controleEdicao && (
                        <>
                            <button
                                className="btn-primary btnstop"
                                onClick={() => salvar(true)}
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar e continuar'}
                            </button>
                            <button
                                className="btn-primary btnblue"
                                onClick={() => salvar(false)}
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Salvar e nova meta'}
                            </button>
                            <button
                                className="btn-primary btnred"
                                onClick={novaMeta}
                                disabled={loading}
                            >
                                Nova meta
                            </button>
                        </>
                    )}

                    {controleEdicao && (
                        <>
                            <button
                                className="btn-primary btnpurple"
                                onClick={alterar}
                                disabled={loading || controleDiarizacao}
                            >
                                Alterar parâmetros da meta
                            </button>
                        </>
                    )}

                    {!controleDiarizacao && !controleEdicao && (metaDinamica.indicador as Record<string, unknown>)?.fl_dia && (
                        <button
                            className="btn-primary btngrey"
                            onClick={diarizar}
                            disabled={loading}
                        >
                            Diarizar valores com parâmetros
                        </button>
                    )}

                    {controleEdicao && (metaDinamica.indicador as Record<string, unknown>)?.fl_dia && (
                        <button
                            className="btn-primary btnblack"
                            onClick={diarizarEdicao}
                            disabled={loading || controleDiarizacao}
                        >
                            Diarizar valores com parâmetros (edição)
                        </button>
                    )}
                </div>
            </main>
        </PermissionGate>
    );
}