import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Alert} from '../../../shared/components/SweetAlert';
import {api} from '../../../shared/services/api';

const CONTRATO_RESOURCE = '/api/view/educacao/listContratoRematricula';

const TABS = [
    {key: 'contrato', label: 'Contrato'},
    {key: 'turmas', label: 'Turmas'},
    {key: 'material', label: 'Material'},
    {key: 'valores', label: 'Valores'},
] as const;

type TabKey = (typeof TABS)[number]['key'];

type Contrato = {
    id: number;
    pessoa_id?: number;
    curriculo_id?: number;
    unidade_id?: number;
    aluno_nome?: string;
    aluno_cpf?: string;
    responsavel_nome?: string;
    curso_nome?: string;
    curriculo_sucinto?: string;
    unidade_sucinto?: string;
    ativo?: boolean;
    data?: string;
    valor_parcelas?: number;
};

type Grupo = {id: number; nome?: string; unidade_descricao?: string};
type OfertaTurma = {
    id: number;
    status?: string;
    componenteCurricular_descricao?: string;
    sala_descricao?: string;
    professor_descricao?: string;
    dataInicio?: string;
    dataFim?: string;
    vagas?: number;
    inscritos?: number;
};
type MaterialItem = {
    key: string;
    produtoId?: number;
    nome?: string;
    descricao?: string;
    valor?: number;
    quantidadeCurso?: number;
    quantidadeEstoque?: number;
    quantidadeCompra?: number;
};
type FormaPagamento = {id: number; vezes?: number; juros?: number | null; desconto?: number | null; perfilId?: number | null; ativo?: boolean};
type Parcela = {parcela: number; descricao: string; dataVencimento: string; valor: number};

const brDate = (value?: string): string => {
    if (!value) return '-';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    return m ? `${m[2]}/${m[3]}/${m[1]}` : String(value);
};

const todayIso = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addMonths = (iso: string, months: number): string => {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-').map(Number);
    const dt = new Date(ano, mes - 1 + months, dia);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const money = (value?: number | null): string =>
    new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(Number(value ?? 0));

const yesNo = (value?: boolean): string => (value ? 'Sim' : 'Não');

export default function ViewConsultorRematriculaScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('contrato');
    const [contrato, setContrato] = useState<Contrato | null>(null);

    const selecionarContrato = useCallback((c: Contrato) => {
        setContrato(c);
        setActiveTab('turmas');
    }, []);

    const goToTab = useCallback((tab: TabKey) => {
        if (tab !== 'contrato' && !contrato) {
            Alert.alert('Selecione um contrato', 'Selecione um contrato na aba "Contrato" para continuar.');
            return;
        }
        setActiveTab(tab);
    }, [contrato]);

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                {TABS.map((tab, index) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => goToTab(tab.key)}
                        style={[
                            styles.tab,
                            activeTab === tab.key && styles.tabActive,
                            tab.key !== 'contrato' && !contrato && styles.tabDisabled,
                        ]}
                    >
                        <Text style={[styles.tabNumber, activeTab === tab.key && styles.tabTextActive]}>{index + 1}</Text>
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {!contrato && activeTab !== 'contrato' && (
                <Text style={styles.hint}>Selecione um contrato para desbloquear esta etapa.</Text>
            )}

            {activeTab === 'contrato' && <ContratoTab contrato={contrato} onSelecionar={selecionarContrato}/>}
            {activeTab === 'turmas' && contrato && <TurmasTab contrato={contrato}/>}
            {activeTab === 'material' && contrato && <MaterialTab contrato={contrato}/>}
            {activeTab === 'valores' && contrato && <ValoresTab contrato={contrato}/>}
        </View>
    );
}



function ContratoTab({contrato, onSelecionar}: {contrato: Contrato | null; onSelecionar: (c: Contrato) => void}) {
    const [itens, setItens] = useState<Contrato[]>([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;
        const carregar = async () => {
            try {
                const {data} = await api.get(`${CONTRATO_RESOURCE}/search`, {
                    params: {page: 0, size: 100, filters: busca ? {aluno_nome: busca} : {}},
                });
                if (!cancelado) setItens(data?.content ?? []);
            } catch (e) {
                console.error('Erro ao carregar contratos:', e);
                if (!cancelado) setErro('Erro ao carregar os contratos elegíveis.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        if (busca.trim().length >= 2 || busca === '') {
            setCarregando(true);
            const t = setTimeout(carregar, busca ? 400 : 0);
            return () => {
                cancelado = true;
                clearTimeout(t);
            };
        }
        return () => {
            cancelado = true;
        };
    }, [busca]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return itens;
        return itens.filter((c) => `${c.aluno_nome ?? ''} ${c.aluno_cpf ?? ''} ${c.curso_nome ?? ''}`.toLowerCase().includes(termo));
    }, [itens, busca]);

    return (
        <View style={styles.body}>
            <Text style={styles.description}>
                Selecione o contrato que deseja rematricular. A listagem traz apenas contratos cujo currículo
                está marcado com possui rematrícula.
            </Text>

            {contrato && (
                <View style={styles.selectedBox}>
                    <Text style={styles.selectedTitle}>Contrato selecionado</Text>
                    <Text style={styles.selectedText}>
                        #{contrato.id} — {contrato.aluno_nome ?? '—'}
                    </Text>
                    <Text style={styles.selectedText}>
                        {contrato.curso_nome ?? '—'}{contrato.unidade_sucinto ? ` | ${contrato.unidade_sucinto}` : ''}
                    </Text>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Buscar por aluno, CPF ou curso..."
                placeholderTextColor="#8a8f98"
                value={busca}
                onChangeText={setBusca}
            />

            {carregando && <ActivityIndicator color="#2f6fd0" style={styles.loader}/>}
            {erro && <Text style={styles.error}>{erro}</Text>}
            {!carregando && filtrados.length === 0 && <Text style={styles.hint}>Nenhum contrato elegível encontrado.</Text>}

            {filtrados.map((c) => {
                const ativo = contrato?.id === c.id;
                return (
                    <View key={c.id} style={[styles.card, ativo && styles.cardActive]}>
                        <Text style={styles.cardTitle}>{c.aluno_nome ?? '—'}</Text>
                        <Text style={styles.cardLine}>CPF: {c.aluno_cpf ?? '—'}</Text>
                        <Text style={styles.cardLine}>Curso: {c.curso_nome ?? '—'}</Text>
                        <Text style={styles.cardLine}>Currículo: {c.curriculo_sucinto ?? '—'}</Text>
                        <Text style={styles.cardLine}>Unidade: {c.unidade_sucinto ?? '—'}</Text>
                        <Text style={styles.cardLine}>
                            Responsável: {c.responsavel_nome ?? '—'} · Ativo: {yesNo(c.ativo)}
                        </Text>
                        <Text style={styles.cardLine}>
                            Data: {brDate(c.data)} · Valor: {money(c.valor_parcelas)}
                        </Text>
                        <Pressable
                            style={[styles.btn, ativo ? styles.btnGreen : styles.btnBlue]}
                            onPress={() => onSelecionar(c)}
                        >
                            <Text style={styles.btnText}>{ativo ? 'Selecionado' : 'Selecionar'}</Text>
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );
}



function TurmasTab({contrato}: {contrato: Contrato}) {
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [abertos, setAbertos] = useState<Record<number, boolean>>({});
    const [ofertas, setOfertas] = useState<Record<number, OfertaTurma[]>>({});
    const [selecionadas, setSelecionadas] = useState<OfertaTurma[]>([]);

    useEffect(() => {
        setSelecionadas([]);
        setOfertas({});
        setAbertos({});
    }, [contrato.id]);

    useEffect(() => {
        if (!contrato.curriculo_id || !contrato.unidade_id) {
            setErro('O contrato selecionado não possui currículo/unidade informados.');
            return;
        }
        let cancelado = false;
        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const {data} = await api.get('/api/educacao/oferecimento-curso/listar-grupos', {
                    params: {curriculoId: contrato.curriculo_id, unidadeId: contrato.unidade_id},
                });
                if (!cancelado) setGrupos(data ?? []);
            } catch (e) {
                console.error('Erro ao carregar grupos:', e);
                if (!cancelado) setErro('Erro ao carregar os grupos de turmas.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        carregar();
        return () => {
            cancelado = true;
        };
    }, [contrato.id, contrato.curriculo_id, contrato.unidade_id]);

    const toggle = async (grupo: Grupo) => {
        const aberto = !abertos[grupo.id];
        setAbertos((p) => ({...p, [grupo.id]: aberto}));
        if (!aberto || ofertas[grupo.id]) return;
        try {
            const {data} = await api.get('/api/educacao/oferecimento-curso/listar-oferecimentos', {
                params: {grupoId: grupo.id},
            });
            setOfertas((p) => ({...p, [grupo.id]: data ?? []}));
        } catch (e) {
            console.error('Erro ao carregar turmas:', e);
            setOfertas((p) => ({...p, [grupo.id]: []}));
        }
    };

    const alternar = (oferta: OfertaTurma) =>
        setSelecionadas((p) => p.some((o) => o.id === oferta.id) ? p.filter((o) => o.id !== oferta.id) : [...p, oferta]);

    const ids = useMemo(() => new Set(selecionadas.map((o) => o.id)), [selecionadas]);

    return (
        <View style={styles.body}>
            <Text style={styles.description}>
                Selecione as turmas de {contrato.curso_nome ?? '—'} para a rematrícula.
            </Text>

            {selecionadas.length > 0 && (
                <View style={styles.selectedBox}>
                    <Text style={styles.selectedTitle}>Turmas selecionadas ({selecionadas.length})</Text>
                    {selecionadas.map((o) => (
                        <View key={o.id} style={styles.selectedRow}>
                            <Text style={styles.selectedText}>
                                #{o.id} — {o.componenteCurricular_descricao ?? '—'} ({o.inscritos ?? 0}/{o.vagas ?? 0})
                            </Text>
                            <Pressable style={styles.btnRedSmall} onPress={() => alternar(o)}>
                                <Text style={styles.btnText}>Remover</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}

            {carregando && <ActivityIndicator color="#2f6fd0" style={styles.loader}/>}
            {erro && <Text style={styles.error}>{erro}</Text>}
            {!carregando && !erro && grupos.length === 0 && (
                <Text style={styles.hint}>Nenhum grupo de turmas encontrado para este curso.</Text>
            )}

            {grupos.map((grupo) => {
                const aberto = Boolean(abertos[grupo.id]);
                const lista = ofertas[grupo.id];
                const noGrupo = lista?.filter((o) => ids.has(o.id)).length ?? 0;
                return (
                    <View key={grupo.id} style={styles.accordion}>
                        <Pressable style={styles.accordionHeader} onPress={() => toggle(grupo)}>
                            <Text style={styles.accordionToggle}>{aberto ? '▾' : '▸'}</Text>
                            <View style={{flex: 1}}>
                                <Text style={styles.accordionTitle}>{grupo.nome ?? `Grupo ${grupo.id}`}</Text>
                                <Text style={styles.cardLine}>
                                    {grupo.unidade_descricao ?? contrato.unidade_sucinto ?? '—'}
                                    {noGrupo > 0 ? ` — ${noGrupo} selecionada(s)` : ''}
                                </Text>
                            </View>
                        </Pressable>
                        {aberto && (
                            <View style={styles.accordionBody}>
                                {!lista && <Text style={styles.hint}>Carregando turmas...</Text>}
                                {lista?.length === 0 && <Text style={styles.hint}>Este grupo não possui turmas.</Text>}
                                {lista?.map((o) => {
                                    const marcada = ids.has(o.id);
                                    return (
                                        <View key={o.id} style={[styles.turmaRow, marcada && styles.cardActive]}>
                                            <Text style={styles.cardTitle}>
                                                {o.componenteCurricular_descricao ?? `Turma ${o.id}`}
                                            </Text>
                                            <Text style={styles.cardLine}>
                                                Sala {o.sala_descricao ?? '-'} · {brDate(o.dataInicio)} a {brDate(o.dataFim)}
                                            </Text>
                                            <Text style={styles.cardLine}>
                                                Professor: {o.professor_descricao ?? '-'} · Vagas {o.inscritos ?? 0}/{o.vagas ?? 0}
                                                {o.status ? ` · ${o.status}` : ''}
                                            </Text>
                                            <Pressable
                                                style={[styles.btnSmall, marcada ? styles.btnRed : styles.btnBlue]}
                                                onPress={() => alternar(o)}
                                            >
                                                <Text style={styles.btnText}>{marcada ? 'Remover' : 'Selecionar'}</Text>
                                            </Pressable>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
}



function MaterialTab({contrato}: {contrato: Contrato}) {
    const [materiais, setMateriais] = useState<MaterialItem[]>([]);
    const [disponiveis, setDisponiveis] = useState<MaterialItem[]>([]);
    const [formas, setFormas] = useState<FormaPagamento[]>([]);
    const [formaId, setFormaId] = useState<number | ''>('');
    const [primeiraParcela, setPrimeiraParcela] = useState(todayIso());
    const [modal, setModal] = useState(false);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        setMateriais([]);
        setDisponiveis([]);
        setModal(false);
    }, [contrato.id]);

    useEffect(() => {
        if (!contrato.curriculo_id || !contrato.unidade_id) return;
        let cancelado = false;
        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const [mc, controle, fp] = await Promise.all([
                    api.get(`/api/educacao/material-escolar-curso/curriculo/${contrato.curriculo_id}`),
                    api.get('/api/estoque/estoque-produto/controle', {params: {unidadeId: contrato.unidade_id}}),
                    api.get('/api/financeiro/forma-pagamento'),
                ]);
                if (cancelado) return;

                const porProduto = new Map<number, Record<string, unknown>>();
                for (const l of (controle.data ?? []) as Array<Record<string, unknown>>) {
                    porProduto.set(Number(l.produtoId), l);
                }

                const lista: MaterialItem[] = (mc.data ?? []).map((m: {id: number; produtoId: number; quantidade: number}) => {
                    const e = porProduto.get(Number(m.produtoId));
                    const estoque = Number(e?.quantidade ?? 0);
                    const reservado = Number(e?.qtdeReservado ?? 0) + Number(e?.qtdeSolicitado ?? 0)
                        + Number(e?.qtdeAprovadoNaoEntregue ?? 0);
                    return {
                        key: `mec-${m.id}`,
                        produtoId: Number(m.produtoId),
                        nome: (e?.produtoNome as string) ?? `Produto ${m.produtoId}`,
                        descricao: e?.produtoCategoriaDescricao as string | undefined,
                        valor: Number(e?.produtoValor ?? 0),
                        quantidadeCurso: Number(m.quantidade ?? 0),
                        quantidadeEstoque: estoque,
                        quantidadeCompra: Math.max(0, estoque - reservado),
                    };
                });

                setDisponiveis([...lista].sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '')));
                setFormas((fp.data ?? []).filter((f: FormaPagamento) => f.ativo !== false));
            } catch (e) {
                console.error('Erro ao carregar materiais:', e);
                if (!cancelado) setErro('Erro ao carregar os materiais do curso.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        carregar();
        return () => {
            cancelado = true;
        };
    }, [contrato.id, contrato.curriculo_id, contrato.unidade_id]);

    const adicionar = (item: MaterialItem) => {
        setMateriais((p) => {
            const i = p.findIndex((m) => m.produtoId === item.produtoId);
            if (i < 0) return [...p, {...item, quantidadeCompra: item.quantidadeCurso || 1}];
            return p.map((m, idx) => (idx === i
                ? {...m, quantidadeCompra: (m.quantidadeCompra ?? 0) + (item.quantidadeCurso || 1)}
                : m));
        });
        setModal(false);
    };

    const alterar = (produtoId: number | undefined, delta: number) =>
        setMateriais((p) => p.map((m) => (m.produtoId === produtoId
            ? {...m, quantidadeCompra: Math.max(0, (m.quantidadeCompra ?? 0) + delta)}
            : m)));

    const total = useMemo(
        () => materiais.reduce((s, m) => s + Number(m.valor ?? 0) * (m.quantidadeCompra ?? 0), 0),
        [materiais],
    );

    const forma = formas.find((f) => f.id === formaId);
    const parcelas: Parcela[] = useMemo(() => {
        if (!forma || !primeiraParcela) return [];
        const vezes = forma.vezes && forma.vezes > 0 ? forma.vezes : 1;
        const linhas: Parcela[] = [];
        for (let i = 0; i < vezes; i++) {
            linhas.push({
                parcela: i + 1,
                descricao: i === 0 ? 'Entrada' : 'Valor Parcelado',
                dataVencimento: addMonths(primeiraParcela, i),
                valor: Math.round((total / vezes) * 100) / 100,
            });
        }
        return linhas;
    }, [forma, primeiraParcela, total]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return disponiveis;
        return disponiveis.filter((d) => `${d.nome ?? ''} ${d.descricao ?? ''}`.toLowerCase().includes(termo));
    }, [disponiveis, busca]);

    return (
        <View style={styles.body}>
            <Text style={styles.description}>
                Materiais de {contrato.curso_nome ?? '—'} disponíveis em estoque para comprar junto com a matrícula.
            </Text>
            {erro && <Text style={styles.error}>{erro}</Text>}

            <Pressable style={[styles.btn, styles.btnBlue, {marginBottom: 12}]} onPress={() => setModal(true)}>
                <Text style={styles.btnText}>Adicionar produto</Text>
            </Pressable>

            {materiais.length === 0 ? (
                <Text style={styles.hint}>Nenhum material selecionado.</Text>
            ) : (
                materiais.map((m) => (
                    <View key={m.key} style={styles.card}>
                        <Text style={styles.cardTitle}>{m.nome ?? '—'}</Text>
                        <Text style={styles.cardLine}>
                            {m.descricao ?? '-'} · {money(m.valor)} · Estoque: {m.quantidadeEstoque ?? 0}
                        </Text>
                        <View style={styles.qtyRow}>
                            <Pressable style={styles.btnRedSmall} onPress={() => alterar(m.produtoId, -1)}>
                                <Text style={styles.btnText}>−</Text>
                            </Pressable>
                            <Text style={styles.qtyText}>{m.quantidadeCompra ?? 0}</Text>
                            <Pressable style={styles.btnSmall} onPress={() => alterar(m.produtoId, 1)}>
                                <Text style={styles.btnText}>+</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.btnRedSmall, {marginLeft: 'auto'}]}
                                onPress={() => setMateriais((p) => p.filter((x) => x.produtoId !== m.produtoId))}
                            >
                                <Text style={styles.btnText}>Remover</Text>
                            </Pressable>
                        </View>
                    </View>
                ))
            )}

            <View style={styles.selectedBox}>
                <Text style={styles.selectedTitle}>Total: {money(total)}</Text>
                <Text style={styles.cardLabel}>Forma de pagamento</Text>
                <View style={styles.chipRow}>
                    {formas.map((f) => (
                        <Pressable
                            key={f.id}
                            style={[styles.chip, formaId === f.id && styles.chipActive]}
                            onPress={() => setFormaId(f.id)}
                        >
                            <Text style={[styles.chipText, formaId === f.id && styles.chipTextActive]}>
                                {f.vezes ?? 1}X
                            </Text>
                        </Pressable>
                    ))}
                </View>
                <Text style={styles.cardLine}>Primeira parcela: {brDate(primeiraParcela)}</Text>

                {parcelas.map((p) => (
                    <View key={p.parcela} style={styles.selectedRow}>
                        <Text style={styles.cardLine}>
                            {p.parcela}/{parcelas.length} — {brDate(p.dataVencimento)} — {money(p.valor)}
                        </Text>
                    </View>
                ))}
            </View>

            <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.selectedTitle}>Produtos em estoque</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Buscar produto..."
                            placeholderTextColor="#8a8f98"
                            value={busca}
                            onChangeText={setBusca}
                        />
                        {carregando && <ActivityIndicator color="#2f6fd0"/>}
                        {filtrados.map((d) => (
                            <View key={d.key} style={styles.turmaRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.cardTitle}>{d.nome ?? '—'}</Text>
                                    <Text style={styles.cardLine}>
                                        {money(d.valor)} · disponível: {d.quantidadeCompra ?? 0}
                                    </Text>
                                </View>
                                <Pressable
                                    style={[styles.btnSmall, styles.btnBlue, (d.quantidadeCompra ?? 0) <= 0 && styles.off]}
                                    disabled={(d.quantidadeCompra ?? 0) <= 0}
                                    onPress={() => adicionar(d)}
                                >
                                    <Text style={styles.btnText}>Adicionar</Text>
                                </Pressable>
                            </View>
                        ))}
                        <Pressable style={[styles.btn, styles.btnRed, {marginTop: 12}]} onPress={() => setModal(false)}>
                            <Text style={styles.btnText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}



function ValoresTab({contrato}: {contrato: Contrato}) {
    const [formas, setFormas] = useState<FormaPagamento[]>([]);
    const [formaId, setFormaId] = useState<number | ''>('');
    const [primeiraParcela, setPrimeiraParcela] = useState(todayIso());
    const [segundaParcela, setSegundaParcela] = useState<number | ''>('');
    const [valorCurso, setValorCurso] = useState<Record<string, unknown> | null>(null);
    const [formasDoValor, setFormasDoValor] = useState<number[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;
        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const fp = await api.get('/api/financeiro/forma-pagamento');
                if (cancelado) return;
                setFormas((fp.data ?? []).filter((f: FormaPagamento) => f.ativo !== false));

                if (contrato.curriculo_id && contrato.unidade_id) {
                    const {data: valorId} = await api.get('/api/educacao/matricula/buscar-valor-curso2', {
                        params: {curriculoId: contrato.curriculo_id, unidadeId: contrato.unidade_id},
                    });
                    if (cancelado) return;
                    if (valorId) {
                        const [{data: valor}, {data: vinculadas}] = await Promise.all([
                            api.get(`/api/financeiro/valor-curso/${valorId}`),
                            api.get(`/api/financeiro/valor-curso/${valorId}/formas-pagamento`),
                        ]);
                        if (cancelado) return;
                        setValorCurso(valor);
                        setFormasDoValor(vinculadas ?? []);
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar valores:', e);
                if (!cancelado) setErro('Erro ao carregar as condições de valor do curso.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        carregar();
        return () => {
            cancelado = true;
        };
    }, [contrato.id, contrato.curriculo_id, contrato.unidade_id]);

    const forma = formas.find((f) => f.id === formaId);
    const disponiveis = formasDoValor.length > 0 ? formas.filter((f) => formasDoValor.includes(f.id)) : formas;
    const valorTotal = Number(valorCurso?.valor ?? contrato.valor_parcelas ?? 0);

    const parcelas: Parcela[] = useMemo(() => {
        if (!forma || !primeiraParcela) return [];
        const vezes = forma.vezes && forma.vezes > 0 ? forma.vezes : 1;
        const linhas: Parcela[] = [];
        for (let i = 1; i <= vezes; i++) {
            const base = String(segundaParcela ? addMonths(primeiraParcela, 1) : primeiraParcela);
            const offset = segundaParcela ? i - 1 : i;
            linhas.push({
                parcela: i,
                descricao: 'Matrícula Parcelada',
                dataVencimento: addMonths(base, offset),
                valor: Math.round((valorTotal / vezes) * 100) / 100,
            });
        }
        return linhas;
    }, [forma, primeiraParcela, segundaParcela, valorTotal]);

    return (
        <View style={styles.body}>
            <Text style={styles.description}>
                Regras de valor da rematrícula do contrato #{contrato.id} — {contrato.aluno_nome ?? '—'}.
            </Text>
            {carregando && <ActivityIndicator color="#2f6fd0" style={styles.loader}/>}
            {erro && <Text style={styles.error}>{erro}</Text>}

            {valorCurso && (
                <View style={styles.selectedBox}>
                    <Text style={styles.selectedTitle}>Valor do curso: {money(valorTotal)}</Text>
                    <Text style={styles.cardLine}>Cobra rematrícula: {valorCurso.cobraRematricula ? 'Sim' : 'Não'}</Text>
                </View>
            )}

            <Text style={styles.cardLabel}>Forma de pagamento</Text>
            <View style={styles.chipRow}>
                {disponiveis.map((f) => (
                    <Pressable
                        key={f.id}
                        style={[styles.chip, formaId === f.id && styles.chipActive]}
                        onPress={() => setFormaId(f.id)}
                    >
                        <Text style={[styles.chipText, formaId === f.id && styles.chipTextActive]}>
                            {f.vezes ?? 1}X · j{f.juros ?? 0}% · d{f.desconto ?? 0}%
                        </Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.cardLabel}>Segunda parcela (dias após a primeira)</Text>
            <View style={styles.chipRow}>
                {[7, 10, 14, 15, 21, 30].map((d) => (
                    <Pressable
                        key={d}
                        style={[styles.chip, segundaParcela === d && styles.chipActive]}
                        onPress={() => setSegundaParcela(segundaParcela === d ? '' : d)}
                    >
                        <Text style={[styles.chipText, segundaParcela === d && styles.chipTextActive]}>{d}d</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.cardLine}>Primeira parcela: {brDate(primeiraParcela)}</Text>

            {parcelas.length === 0 ? (
                <Text style={styles.hint}>Selecione a forma de pagamento para calcular as parcelas.</Text>
            ) : (
                parcelas.map((p) => (
                    <View key={p.parcela} style={styles.selectedRow}>
                        <Text style={styles.cardLine}>
                            Parcela {p.parcela} · {brDate(p.dataVencimento)} · {money(p.valor)}
                        </Text>
                    </View>
                ))
            )}

            <Text style={[styles.hint, {marginTop: 16}]}>
                Bolsa de estudos, taxas adicionais e o salvamento da rematrícula dependem de endpoints que ainda não
                existem no backend. Esta aba monta o cálculo das parcelas em memória.
            </Text>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {flex: 1},
    body: {padding: 12},
    tabs: {flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#f2f4f7', gap: 8},
    tab: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d8dce3'},
    tabActive: {backgroundColor: '#2f6fd0', borderColor: '#2f6fd0'},
    tabDisabled: {opacity: 0.5},
    tabNumber: {fontSize: 12, fontWeight: 'bold', color: '#5a6069'},
    tabLabel: {fontSize: 13, fontWeight: '600', color: '#2b3038'},
    tabTextActive: {color: '#ffffff'},
    description: {fontSize: 13, color: '#4a5058', marginBottom: 12, lineHeight: 19},
    hint: {fontSize: 13, color: '#6b7280', marginVertical: 8},
    error: {fontSize: 13, color: '#b42318', marginVertical: 8},
    loader: {marginVertical: 16},
    input: {borderWidth: 1, borderColor: '#c9ced6', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10, color: '#1f2328', backgroundColor: '#ffffff'},
    card: {borderWidth: 1, borderColor: '#d8dce3', borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: '#ffffff'},
    cardActive: {borderColor: '#2f6fd0', backgroundColor: '#f4f8ff'},
    cardTitle: {fontSize: 14, fontWeight: '700', color: '#1f2328', marginBottom: 2},
    cardLine: {fontSize: 12, color: '#4a5058', marginBottom: 2},
    cardLabel: {fontSize: 13, fontWeight: '700', color: '#1f2328', marginTop: 12, marginBottom: 6},
    selectedBox: {borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f8fafc'},
    selectedTitle: {fontSize: 13, fontWeight: '700', color: '#1f2328', marginBottom: 6},
    selectedText: {fontSize: 12, color: '#374151'},
    selectedRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4},
    btn: {alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, marginTop: 8},
    btnSmall: {alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginTop: 6},
    btnRedSmall: {alignItems: 'center', justifyContent: 'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#b42318'},
    btnBlue: {backgroundColor: '#2f6fd0'},
    btnGreen: {backgroundColor: '#1c7c4a'},
    btnRed: {backgroundColor: '#b42318'},
    off: {opacity: 0.4},
    btnText: {color: '#ffffff', fontSize: 12, fontWeight: '700'},
    qtyRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6},
    qtyText: {fontSize: 14, fontWeight: '700', color: '#1f2328', minWidth: 24, textAlign: 'center'},
    accordion: {borderWidth: 1, borderColor: '#d8dce3', borderRadius: 8, marginBottom: 10, overflow: 'hidden', backgroundColor: '#ffffff'},
    accordionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#f8fafc'},
    accordionToggle: {fontSize: 14, color: '#4a5058'},
    accordionTitle: {fontSize: 14, fontWeight: '700', color: '#1f2328'},
    accordionBody: {padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb'},
    turmaRow: {borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8},
    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8},
    chip: {paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: '#c9ced6', backgroundColor: '#ffffff'},
    chipActive: {backgroundColor: '#2f6fd0', borderColor: '#2f6fd0'},
    chipText: {fontSize: 12, fontWeight: '600', color: '#374151'},
    chipTextActive: {color: '#ffffff'},
    modalBackdrop: {flex: 1, backgroundColor: 'rgba(15,20,28,0.55)', justifyContent: 'flex-end'},
    modalCard: {backgroundColor: '#ffffff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 16, maxHeight: '80%'},
});
