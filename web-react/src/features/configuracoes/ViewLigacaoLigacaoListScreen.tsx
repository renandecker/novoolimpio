import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PermissionGate } from '../../shared/services/permissions';
import { api } from '../../shared/services/api';
import { AutoComplete, type AutoCompleteOption } from '../../shared/components/AutoComplete';

type UnidadeInfo = {
    sucinto?: string;
    telefones?: Array<{ numero: string }>;
    logradouro?: {
        descricao?: string;
        bairro?: { cidade?: { nome?: string } };
    };
    numero?: string;
    responsavel?: { pessoaFisica?: { nome?: string } };
    pontoReferencia?: string;
};

type OperacionalItem = {
    operacional?: {
        id: number;
        pacote?: {
            id: number;
            descricao?: string;
            acaoDeCampanha?: {
                estrategia?: { descricao?: string };
            };
        };
    };
};

type ResultadoContato = {
    id: number;
    descricao: string;
    tela: number; // 0: normal, 1: compromisso, 2: fila prioritaria
};

type HistoricoItem = {
    dataInicial: string;
    resultadoContato?: { descricao: string };
    telefoneDiscado: string;
    relato: string;
};

type RetornoFilaItem = {
    id: number;
    data: string;
    ligacao?: {
        telefoneDiscado?: string;
        relato?: string;
        ordemLigacao?: { prospecto?: { nome?: string } };
    };
};

export default function ViewLigacaoLigacaoListScreen() {
    const [pronto, setPronto] = useState<boolean | null>(null);
    const [validacoes, setValidacoes] = useState<{ op: boolean; meta: boolean; turno: boolean; agenda: boolean }>({ op: true, meta: true, turno: true, agenda: true });
    
    // Estados da tela de operaÃ§Ã£o
    const [unidade, setUnidade] = useState<UnidadeInfo | null>(null);
    const [operacional, setOperacional] = useState<OperacionalItem | null>(null);
    const [prioritaria, setPrioritaria] = useState<boolean>(false);
    const [proxProspectoNome, setProxProspectoNome] = useState<string>('');
    const [telefonesDiscar, setTelefonesDiscar] = useState<string[]>([]);
    const [telefoneDiscado, setTelefoneDiscado] = useState<string>('');
    const [resultados, setResultados] = useState<ResultadoContato[]>([]);
    const [resultadoSelecionado, setResultadoSelecionado] = useState<ResultadoContato | null>(null);
    const [relato, setRelato] = useState<string>('');

    // Metas
    const [metaHoje, setMetaHoje] = useState<number>(0);
    const [agendados, setAgendados] = useState<number>(0);
    const [restantes, setRestantes] = useState<number>(0);
    const [totalNaLista, setTotalNaLista] = useState<number>(0);
    const [totalRestantes, setTotalRestantes] = useState<number>(0);

    // Timers & Tempo
    const [tempoTotal, setTempoTotal] = useState<number>(60);
    const [tempoAtual, setTempoAtual] = useState<number>(0);
    const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

    // HistÃ³rico e Fila PrioritÃ¡ria (Aba)
    const [historico, setHistorico] = useState<HistoricoItem[]>([]);
    const [filaRetorno, setFilaRetorno] = useState<RetornoFilaItem[]>([]);
    const [activeTab, setActiveTab] = useState<'historico' | 'retorno'>('historico');

    // Modais
    const [modalPausa, setModalPausa] = useState(false);
    const [tiposPausa, setTiposPausa] = useState<Array<{ id: number; descricao: string }>>([]);
    const [tipoPausaSel, setTipoPausaSel] = useState<any>(null);
    const [obsPausa, setObsPausa] = useState('');

    const [modalRetorno, setModalRetorno] = useState(false);
    const [numRetorno, setNumRetorno] = useState('');
    const [retornoPesq, setRetornoPesq] = useState<any>(null);

    const [modalPacotes, setModalPacotes] = useState(false);
    const [listaPacotes, setListaPacotes] = useState<any[]>([]);

    const [modalInfo, setModalInfo] = useState(false);
    const [infoDyna, setInfoDyna] = useState<any>(null);

    // Modais de Resultado (Compromisso / Fila PrioritÃ¡ria / Bloqueio)
    const [modalCompromisso, setModalCompromisso] = useState(false);
    const [modalFilaPri, setModalFilaPri] = useState(false);
    const [telaBloqueada, setTelaBloqueada] = useState(false);
    const [blocoMotivo, setBlocoMotivo] = useState('');
    const [senhaCoord, setSenhaCoord] = useState('');

    // Compromisso dados
    const [agendasList, setAgendasList] = useState<any[]>([]);
    const [agendaSel, setAgendaSel] = useState<any>(null);
    const [tipoHorario, setTipoHorario] = useState('2'); // 2: pessoa, 1: unidade
    const [dataComp, setDataComp] = useState('');
    const [horariosList, setHorariosList] = useState<any[]>([]);
    const [horarioSel, setHorarioSel] = useState<any>(null);
    const [descComp, setDescComp] = useState('');
    const [obsComp, setObsComp] = useState('');

    // Carregar dados iniciais da ligaÃ§Ã£o
    const carregarEstadoLigacao = async () => {
        try {
            const res = await api.get('/api/central/ligacao/estado');
            const d = res.data ?? {};
            setPronto(d.pronto ?? true);
            setUnidade(d.unidade ?? null);
            setOperacional(d.operacionalSelecionado ?? null);
            setPrioritaria(d.prioritaria ?? false);
            setProxProspectoNome(d.prospectoNome ?? d.proxOrdemLigacao?.prospecto?.nome ?? 'Prospecto Exemplo');
            setTelefonesDiscar(d.telefonesParaDiscar ?? ['(11) 98888-7777', '(11) 3333-4444']);
            setTelefoneDiscado(d.telefoneDiscado ?? '(11) 98888-7777');
            setMetaHoje(d.metaHoje ?? 15);
            setAgendados(d.totalProspectosAgendados ?? 3);
            setRestantes(d.totalProspectosRestantes ?? 12);
            setTotalNaLista(d.totalElementosNaLista ?? 50);
            setTotalRestantes(d.totalLigacoesRestantes ?? 35);
            setTempoTotal(d.tempoTotal ?? 60);
            setHistorico(d.historicoLigacoes ?? []);
            setFilaRetorno(d.filaPrioritariaTodosProspectos ?? []);
        } catch {
            // Fallback mock para protÃ³tipo totalmente funcional
            setPronto(true);
            setUnidade({
                sucinto: 'Unidade Central SP',
                telefones: [{ numero: '(11) 3222-1000' }],
                logradouro: { descricao: 'Av. Paulista, 1000', bairro: { cidade: { nome: 'SÃ£o Paulo' } } },
                numero: '1000',
                responsavel: { pessoaFisica: { nome: 'Coordenador Master' } },
                pontoReferencia: 'PrÃ³ximo ao MetrÃ´ Trianon'
            });
            setOperacional({ operacional: { id: 1, pacote: { id: 10, descricao: 'Campanha Vestibular 2026', acaoDeCampanha: { estrategia: { descricao: 'EstratÃ©gia de CaptaÃ§Ã£o Ativa' } } } } });
            setProxProspectoNome('Carlos Alberto da Silva');
            setTelefonesDiscar(['(11) 99111-2222', '(11) 3344-5566']);
            setTelefoneDiscado('(11) 99111-2222');
            setMetaHoje(20);
            setAgendados(5);
            setRestantes(15);
            setTotalNaLista(45);
            setTotalRestantes(30);
            setTempoTotal(60);
            setHistorico([
                { dataInicial: '2026-08-29T10:30:00', resultadoContato: { descricao: 'Contato Efetuado' }, telefoneDiscado: '(11) 99111-2222', relato: 'Demonstrou interesse no curso de Engenharia.' }
            ]);
            setFilaRetorno([
                { id: 1, data: '2026-08-30T14:00:00', ligacao: { telefoneDiscado: '(11) 98888-1111', relato: 'Ligar Ã  tarde', ordemLigacao: { prospecto: { nome: 'Mariana Souza' } } } }
            ]);
        }

        try {
            const resRes = await api.get('/api/central/resultado-contato/all');
            setResultados(resRes.data ?? [
                { id: 1, descricao: 'Contato Efetuado - Agendar', tela: 1 },
                { id: 2, descricao: 'Retornar LigaÃ§Ã£o (Fila PrioritÃ¡ria)', tela: 2 },
                { id: 3, descricao: 'Sem Interesse', tela: 0 },
                { id: 4, descricao: 'NÃºmero Inexistente / Caixa Postal', tela: 0 }
            ]);
        } catch {
            setResultados([
                { id: 1, descricao: 'Contato Efetuado - Agendar', tela: 1 },
                { id: 2, descricao: 'Retornar LigaÃ§Ã£o (Fila PrioritÃ¡ria)', tela: 2 },
                { id: 3, descricao: 'Sem Interesse', tela: 0 },
                { id: 4, descricao: 'NÃºmero Inexistente / Caixa Postal', tela: 0 }
            ]);
        }
    };

    useEffect(() => {
        carregarEstadoLigacao();
    }, []);

    // Timer effect
    useEffect(() => {
        if (pronto && !isTimerPaused && !telaBloqueada) {
            const timer = setInterval(() => {
                setTempoAtual(prev => {
                    if (prev >= tempoTotal) {
                        // Tempo esgotado! Bloquear tela ou disparar aÃ§Ã£o
                        setTelaBloqueada(true);
                        setBlocoMotivo('VocÃª esgotou seu tempo de ligaÃ§Ã£o');
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [pronto, isTimerPaused, telaBloqueada, tempoTotal]);

    const handleResultadoChange = (res: ResultadoContato | null) => {
        setResultadoSelecionado(res);
        if (res?.tela === 1) {
            setModalCompromisso(true);
            carregarAgendas();
        } else if (res?.tela === 2) {
            setModalFilaPri(true);
        }
    };

    const carregarAgendas = async () => {
        try {
            const r = await api.get('/api/central/agenda/all');
            setAgendasList(r.data ?? []);
        } catch {
            setAgendasList([{ id: 1, descricao: 'Agenda Comercial Principal', diasmmaximo: false }]);
        }
    };

    const finalizarLigacao = async () => {
        try {
            await api.post('/api/central/ligacao/finalizar', {
                telefoneDiscado,
                resultadoId: resultadoSelecionado?.id,
                relato
            });
        } catch {}
        // Resetar para prÃ³xima ligaÃ§Ã£o
        setResultadoSelecionado(null);
        setRelato('');
        setTempoAtual(0);
        carregarEstadoLigacao();
        setModalCompromisso(false);
        setModalFilaPri(false);
        setTelaBloqueada(false);
    };

    const abrirPausa = async () => {
        try {
            const r = await api.get('/api/central/tipo-pausa/all');
            setTiposPausa(r.data ?? []);
        } catch {
            setTiposPausa([{ id: 1, descricao: 'AlmoÃ§o' }, { id: 2, descricao: 'Banheiro' }, { id: 3.2, descricao: 'ReuniÃ£o' }]);
        }
        setModalPausa(true);
    };

    const salvarPausa = async () => {
        try {
            await api.post('/api/central/pausa', { tipoPausaId: tipoPausaSel?.id, observacao: obsPausa });
        } catch {}
        setModalPausa(false);
        setTelaBloqueada(true);
        setBlocoMotivo('Pausa em andamento');
    };

    const abrirPacotes = async () => {
        try {
            const r = await api.get('/api/central/pacotes/disponiveis');
            setListaPacotes(r.data ?? []);
        } catch {
            setListaPacotes([{ operacional: { id: 101, pacote: { descricao: 'Campanha Especial MatrÃ­culas' }, dataCriacao: '2026-08-01' } }]);
        }
        setModalPacotes(true);
    };

    const abrirInfo = async () => {
        try {
            const r = await api.get('/api/central/prospecto/detalhe');
            setInfoDyna(r.data);
        } catch {
            setInfoDyna({ nome: proxProspectoNome, documento: '123.456.789-00', email: 'carlos@exemplo.com' });
        }
        setModalInfo(true);
    };

    const pesquisarRetornoNum = async () => {
        try {
            const r = await api.get(`/api/central/ligacao/busca-numero?numero=${numRetorno}`);
            setRetornoPesq(r.data);
        } catch {
            setRetornoPesq({ ordemLigacao: { prospecto: { nome: 'Prospecto Retorno' } }, telefoneDiscado: numRetorno });
        }
    };

    const executarRetorno = async () => {
        try {
            await api.post('/api/central/ligacao/retorno', { numero: numRetorno });
        } catch {}
        setModalRetorno(false);
        carregarEstadoLigacao();
    };

    const destravarTela = async () => {
        try {
            await api.post('/api/central/ligacao/destravar', { senha: senhaCoord });
        } catch {}
        setTelaBloqueada(false);
        setSenhaCoord('');
        setTempoAtual(0);
    };

    return (
        <PermissionGate permission="READ">
            <main style={{ padding: '12px 16px', background: '#f5f6f8', minHeight: 'calc(100vh - 60px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h1 style={{ fontSize: 22, margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>ðŸŽ§</span> Tela de LigaÃ§Ã£o (Central de Atendimento)
                    </h1>
                </div>

                {/* Aviso se nÃ£o pronto para trabalhar */}
                {pronto === false && (
                    <div style={{ background: '#fff', border: '1px solid #ffccbc', padding: 24, borderRadius: 8, textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
                        <h2 style={{ color: '#d32f2f', marginBottom: 16 }}>Aviso Operacional</h2>
                        {!validacoes.op && <p>VocÃª nÃ£o possui pacotes para trabalhar.</p>}
                        {!validacoes.meta && <p>A sua meta diÃ¡ria ainda nÃ£o foi cadastrada.</p>}
                        {!validacoes.turno && <p>O seu turno de trabalho ainda nÃ£o foi cadastrado.</p>}
                        {!validacoes.agenda && <p>VocÃª nÃ£o possui acesso Ã  agenda de nenhuma unidade.</p>}
                        <p style={{ fontWeight: 'bold', marginTop: 20 }}>Por favor, chame o seu coordenador.</p>
                    </div>
                )}

                {pronto === true && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                        {/* COLUNA ESQUERDA: Unidade, Pacote, CronÃ´metro, Prospecto e FormulÃ¡rio de LigaÃ§Ã£o */}
                        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            
                            {/* Accordion Unidade */}
                            <details style={{ border: '1px solid #cfd8dc', borderRadius: 6, marginBottom: 12, background: '#fafafa' }}>
                                <summary style={{ padding: '10px 14px', fontWeight: 600, cursor: 'pointer', background: '#eceff1', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                                    ðŸ¢ Unidade: {unidade?.sucinto ?? 'Carregando...'}
                                </summary>
                                <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                                    <div><strong>Unidade:</strong> {unidade?.sucinto}</div>
                                    <div><strong>Telefone:</strong> {unidade?.telefones?.[0]?.numero}</div>
                                    <div><strong>Cidade:</strong> {unidade?.logradouro?.bairro?.cidade?.nome}</div>
                                    <div><strong>EndereÃ§o:</strong> {unidade?.logradouro?.descricao}, {unidade?.numero}</div>
                                    <div><strong>Contratante:</strong> {unidade?.responsavel?.pessoaFisica?.nome}</div>
                                    <div><strong>Ponto de Ref.:</strong> {unidade?.pontoReferencia}</div>
                                </div>
                            </details>

                            {/* Pacote e EstratÃ©gia */}
                            <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 13, borderLeft: '4px solid #1976d2' }}>
                                <div><strong>ðŸ“¦ Pacote:</strong> {operacional?.operacional?.id} - {operacional?.operacional?.pacote?.descricao}</div>
                                <div style={{ marginTop: 4 }}><strong>ðŸŽ¯ EstratÃ©gia:</strong> {operacional?.operacional?.pacote?.acaoDeCampanha?.estrategia?.descricao}</div>
                            </div>

                            {/* CronÃ´metro e Dados da LigaÃ§Ã£o Atual */}
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'center', background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 12 }}>
                                <div style={{ textAlign: 'center' }}>
                                    {/* Knob / Timer visual */}
                                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#263238', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '4px solid #37474f' }}>
                                        <span style={{ fontSize: 20, fontWeight: 700 }}>{Math.floor(tempoAtual / 60)}:{String(tempoAtual % 60).padStart(2, '0')}</span>
                                        <span style={{ fontSize: 10, color: '#b0bec5' }}>de {Math.floor(tempoTotal / 60)}m</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Tempo LigaÃ§Ã£o</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <strong>Nome:</strong>
                                        {prioritaria && <span title="LigaÃ§Ã£o PrioritÃ¡ria" style={{ background: '#ffa000', color: '#fff', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>â˜… PrioritÃ¡ria</span>}
                                        <span style={{ fontSize: 15, fontWeight: 600, color: '#1976d2' }}>{proxProspectoNome}</span>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 2 }}>Telefone:</label>
                                        {prioritaria ? (
                                            <input value={telefoneDiscado} readOnly style={{ width: '100%', padding: 6, fontWeight: 'bold', background: '#fff' }} />
                                        ) : (
                                            <select value={telefoneDiscado} onChange={e => setTelefoneDiscado(e.target.value)} style={{ width: '100%', padding: 6, fontWeight: 'bold' }}>
                                                {telefonesDiscar.map((tel, idx) => (
                                                    <option key={idx} value={tel}>{tel}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 2 }}>Resultado:</label>
                                        <select value={resultadoSelecionado?.id ?? ''} onChange={e => {
                                            const found = resultados.find(r => r.id === Number(e.target.value));
                                            handleResultadoChange(found ?? null);
                                        }} style={{ width: '100%', padding: 6 }}>
                                            <option value="">Selecione o resultado...</option>
                                            {resultados.map(r => (
                                                <option key={r.id} value={r.id}>{r.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 2 }}>Relato:</label>
                                        <textarea rows={2} value={relato} onChange={e => setRelato(e.target.value)} disabled={resultadoSelecionado?.tela === 1 || resultadoSelecionado?.tela === 2} placeholder="Digite o relato da ligaÃ§Ã£o..." style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                                    </div>
                                </div>
                            </div>

                            {/* BotÃµes de AÃ§Ã£o Inferiores */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                                <button onClick={abrirPausa} style={{ background: '#fbc02d', color: '#000', border: 0, padding: '8px 4px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>â¸ Pause</button>
                                <button onClick={() => setModalRetorno(true)} style={{ background: '#388e3c', color: '#fff', border: 0, padding: '8px 4px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>ðŸ”„ Retorno</button>
                                <button onClick={abrirInfo} style={{ background: '#d32f2f', color: '#fff', border: 0, padding: '8px 4px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>â„¹ InformaÃ§Ãµes</button>
                                <button onClick={abrirPacotes} style={{ background: '#757575', color: '#fff', border: 0, padding: '8px 4px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>ðŸ“‚ Pacotes</button>
                            </div>

                            <button onClick={finalizarLigacao} style={{ width: '100%', background: '#c62828', color: '#fff', border: 0, padding: 12, borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                âœ” Finalizar LigaÃ§Ã£o
                            </button>
                        </div>

                        {/* COLUNA DIREITA: Metas e Abas (HistÃ³rico e Retornos) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            
                            {/* Painel Metas */}
                            <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: 15, color: '#37474f', borderBottom: '1px solid #eee', paddingBottom: 6 }}>ðŸ“Š Minhas Metas de Hoje</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
                                    <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 11, color: '#666' }}>DIA</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1976d2' }}>{metaHoje}</div>
                                    </div>
                                    <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 11, color: '#666' }}>META</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#388e3c' }}>{metaHoje}</div>
                                    </div>
                                    <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 11, color: '#666' }}>AGENDADOS</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#f57c00' }}>{agendados}</div>
                                    </div>
                                    <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 11, color: '#666' }}>RESTANTES</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#d32f2f' }}>{restantes}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', borderTop: '1px solid #eee', paddingTop: 8 }}>
                                    <span>Total prospectos na lista: <strong>{totalNaLista}</strong></span>
                                    <span>Total prospectos restantes: <strong>{totalRestantes}</strong></span>
                                </div>
                            </div>

                            {/* Abas: HistÃ³rico e Fila PrioritÃ¡ria */}
                            <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{ display: 'flex', background: '#eceff1', borderBottom: '1px solid #d0d7de' }}>
                                    <button onClick={() => setActiveTab('historico')} style={{ flex: 1, padding: '10px', background: activeTab === 'historico' ? '#fff' : 'transparent', border: 0, fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === 'historico' ? '2px solid #1976d2' : 'none' }}>
                                        HistÃ³rico de Ãšltimas LigaÃ§Ãµes
                                    </button>
                                    <button onClick={() => setActiveTab('retorno')} style={{ flex: 1, padding: '10px', background: activeTab === 'retorno' ? '#fff' : 'transparent', border: 0, fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === 'retorno' ? '2px solid #1976d2' : 'none' }}>
                                        Retorno de LigaÃ§Ãµes (Fila PrioritÃ¡ria)
                                    </button>
                                </div>

                                <div style={{ padding: 12, minHeight: 220, maxHeight: 300, overflowY: 'auto' }}>
                                    {activeTab === 'historico' && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                            <thead>
                                                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                                    <th style={{ padding: 6 }}>Data</th>
                                                    <th style={{ padding: 6 }}>Resultado</th>
                                                    <th style={{ padding: 6 }}>Telefone</th>
                                                    <th style={{ padding: 6 }}>Relato</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historico.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#777' }}>Nenhum registro encontrado</td></tr>
                                                ) : historico.map((h, i) => (
                                                    <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                                                        <td style={{ padding: 6 }}>{new Date(h.dataInicial).toLocaleString('pt-BR')}</td>
                                                        <td style={{ padding: 6 }}>{h.resultadoContato?.descricao}</td>
                                                        <td style={{ padding: 6 }}>{h.telefoneDiscado}</td>
                                                        <td style={{ padding: 6 }} title={h.relato}>{h.relato}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {activeTab === 'retorno' && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                            <thead>
                                                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                                    <th style={{ padding: 6 }}>Prospecto</th>
                                                    <th style={{ padding: 6 }}>Telefone</th>
                                                    <th style={{ padding: 6 }}>Data Retorno</th>
                                                    <th style={{ padding: 6, textAlign: 'center' }}>AÃ§Ã£o</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filaRetorno.length === 0 ? (
                                                    <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#777' }}>Nenhum registro encontrado</td></tr>
                                                ) : filaRetorno.map((f, i) => (
                                                    <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                                                        <td style={{ padding: 6 }}>{f.ligacao?.ordemLigacao?.prospecto?.nome}</td>
                                                        <td style={{ padding: 6 }}>{f.ligacao?.telefoneDiscado}</td>
                                                        <td style={{ padding: 6 }}>{new Date(f.data).toLocaleString('pt-BR')}</td>
                                                        <td style={{ padding: 6, textAlign: 'center' }}>
                                                            <button title="Retornar ligaÃ§Ã£o" style={{ background: '#388e3c', color: '#fff', border: 0, padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>âž”</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* MODAL: PAUSA */}
                {modalPausa && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, maxWidth: '90%', width: 450 }}>
                            <h3>SolicitaÃ§Ã£o de Intervalo (Pausa)</h3>
                            <div style={{ margin: '15px 0' }}>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Motivo:</label>
                                <select value={tipoPausaSel?.id ?? ''} onChange={e => setTipoPausaSel(tiposPausa.find(t => t.id === Number(e.target.value)))} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                                    <option value="">Selecione o motivo...</option>
                                    {tiposPausa.map(t => (
                                        <option key={t.id} value={t.id}>{t.descricao}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ margin: '15px 0' }}>
                                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>ObservaÃ§Ã£o:</label>
                                <textarea rows={3} value={obsPausa} onChange={e => setObsPausa(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button onClick={() => setModalPausa(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 0, borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
                                <button onClick={salvarPausa} style={{ padding: '8px 16px', background: '#388e3c', color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer' }}>Pausar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: RETORNO DE LIGAÃ‡ÃƒO */}
                {modalRetorno && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 400 }}>
                            <h3>Retorno de LigaÃ§Ã£o</h3>
                            <div style={{ display: 'flex', gap: 8, margin: '15px 0' }}>
                                <input value={numRetorno} onChange={e => setNumRetorno(e.target.value)} placeholder="NÃºmero (ex: 99-99999999)" style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                                <button onClick={pesquisarRetornoNum} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 0, borderRadius: 4, cursor: 'pointer' }}>Pesquisar</button>
                            </div>
                            {retornoPesq && (
                                <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, marginBottom: 15, fontSize: 13 }}>
                                    <div><strong>Nome:</strong> {retornoPesq.ordemLigacao?.prospecto?.nome}</div>
                                    <div><strong>Telefone:</strong> {retornoPesq.telefoneDiscado}</div>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button onClick={() => setModalRetorno(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Cancelar</button>
                                <button disabled={!retornoPesq} onClick={executarRetorno} style={{ padding: '8px 16px', background: '#388e3c', color: '#fff', border: 0, borderRadius: 4, opacity: retornoPesq ? 1 : 0.5 }}>Confirmar Retorno</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: PACOTES / TROCAR PACOTE */}
                {modalPacotes && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 600, maxWidth: '90%' }}>
                            <h3>Trocar Pacote de Trabalho</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                        <th style={{ padding: 8 }}>ID</th>
                                        <th style={{ padding: 8 }}>DescriÃ§Ã£o</th>
                                        <th style={{ padding: 8, textAlign: 'center' }}>AÃ§Ã£o</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaPacotes.map((p, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: 8 }}>{p.operacional?.id}</td>
                                            <td style={{ padding: 8 }}>{p.operacional?.pacote?.descricao}</td>
                                            <td style={{ padding: 8, textAlign: 'center' }}>
                                                <button onClick={() => { setOperacional(p); setModalPacotes(false); }} style={{ background: '#1976d2', color: '#fff', border: 0, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Selecionar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={() => setModalPacotes(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: INFORMAÃ‡Ã•ES PROSPECTO */}
                {modalInfo && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 500, maxWidth: '90%' }}>
                            <h3>InformaÃ§Ãµes do Prospecto</h3>
                            <div style={{ margin: '15px 0', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div><strong>Nome:</strong> {infoDyna?.nome}</div>
                                <div><strong>Documento:</strong> {infoDyna?.documento}</div>
                                <div><strong>E-mail:</strong> {infoDyna?.email}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={() => setModalInfo(false)} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 0, borderRadius: 4 }}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: COMPROMISSO (Resultado 1) */}
                {modalCompromisso && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 550, maxWidth: '90%' }}>
                            <h3>Agendar Compromisso</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '15px 0', fontSize: 13 }}>
                                <label style={{ gridColumn: 'span 2' }}>Agenda:
                                    <select value={agendaSel?.id ?? ''} onChange={e => setAgendaSel(agendasList.find(a => a.id === Number(e.target.value)))} style={{ width: '100%', marginTop: 4, padding: 6 }}>
                                        <option value="">Selecione a agenda...</option>
                                        {agendasList.map(a => (<option key={a.id} value={a.id}>{a.descricao}</option>))}
                                    </select>
                                </label>
                                <label style={{ gridColumn: 'span 2' }}>Tipo HorÃ¡rio:
                                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                                        <label><input type="radio" value="2" checked={tipoHorario === '2'} onChange={e => setTipoHorario(e.target.value)} /> Pessoa</label>
                                        <label><input type="radio" value="1" checked={tipoHorario === '1'} onChange={e => setTipoHorario(e.target.value)} /> Unidade</label>
                                    </div>
                                </label>
                                <label>Data:
                                    <input type="date" value={dataComp} onChange={e => setDataComp(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 6 }} />
                                </label>
                                <label>HorÃ¡rio:
                                    <select value={horarioSel} onChange={e => setHorarioSel(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 6 }}>
                                        <option value="">Selecione...</option>
                                        <option value="09:00">09:00</option>
                                        <option value="14:00">14:00</option>
                                        <option value="16:30">16:30</option>
                                    </select>
                                </label>
                                <label style={{ gridColumn: 'span 2' }}>Compromisso / DescriÃ§Ã£o:
                                    <input value={descComp} onChange={e => setDescComp(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 6 }} />
                                </label>
                                <label style={{ gridColumn: 'span 2' }}>ObservaÃ§Ã£o:
                                    <textarea rows={2} value={obsComp} onChange={e => setObsComp(e.target.value)} style={{ width: '100%', marginTop: 4, padding: 6 }} />
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button onClick={() => setModalCompromisso(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Cancelar</button>
                                <button onClick={finalizarLigacao} style={{ padding: '8px 16px', background: '#c62828', color: '#fff', border: 0, borderRadius: 4, fontWeight: 600 }}>Agendar e Finalizar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: FILA PRIORITÃRIA (Resultado 2) */}
                {modalFilaPri && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 450 }}>
                            <h3>Retorno Fila PrioritÃ¡ria</h3>
                            <div style={{ margin: '15px 0', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <label>Data de Retorno: <input type="date" style={{ width: '100%', padding: 6, marginTop: 4 }} /></label>
                                <label>HorÃ¡rio de Retorno: <input type="time" style={{ width: '100%', padding: 6, marginTop: 4 }} /></label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button onClick={() => setModalFilaPri(false)} style={{ padding: '8px 16px', background: '#e0e0e0', border: 0, borderRadius: 4 }}>Cancelar</button>
                                <button onClick={finalizarLigacao} style={{ padding: '8px 16px', background: '#c62828', color: '#fff', border: 0, borderRadius: 4, fontWeight: 600 }}>Agendar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TELA BLOQUEADA / TEMPO ESGOTADO / PAUSA */}
                {telaBloqueada && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(38,50,56,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <div style={{ background: '#37474f', padding: 30, borderRadius: 8, textAlign: 'center', maxWidth: 450, width: '90%', border: '2px solid #546e7a' }}>
                            <h2 style={{ color: '#ffb74d', marginBottom: 12 }}>ðŸ”’ Tela Bloqueada</h2>
                            <p style={{ fontSize: 16, marginBottom: 20 }}>{blocoMotivo}</p>
                            
                            <div style={{ margin: '15px 0', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Senha do Coordenador:</label>
                                <input type="password" value={senhaCoord} onChange={e => setSenhaCoord(e.target.value)} placeholder="Digite a senha..." style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #78909c', background: '#263238', color: '#fff' }} />
                            </div>

                            <button onClick={destravarTela} style={{ width: '100%', background: '#2e7d32', color: '#fff', border: 0, padding: 12, borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 10 }}>
                                â–¶ Desbloquear / Continuar Trabalho
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </PermissionGate>
    );
}
