import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {useAuth} from '../auth/auth';
import {Colors, Spacing, BorderRadius, Typography} from '../../shared/styles/theme';

interface CompromissoBasico {
    id: number;
    descricao: string;
    data: string;
    horarioId?: number | null;
    agendaId?: number | null;
    pessoaId?: number | null;
    observacao?: string;
    ativo?: boolean;
}

interface AgendaBasica {
    id: number;
    descricao: string;
    unidadeId?: number | null;
}

interface HorarioBasico {
    id: number;
    hora: string;
}

interface UnidadeView {
    id: number;
    sucinto?: string;
    nomeFantasia?: string;
}

const PALETTE = [
    '#3366CC', '#3C854D', '#E76600', '#C90000', '#553D7A',
    '#4AB1CF', '#EFB70B', '#C71585', '#2EB82E', '#1a1a1a',
    '#8A4513', '#0000CD', '#008080', '#B22222', '#556B2F', '#6A5ACD',
];

const PESSOA_FILTRO_VERDE = '#2EB82E';

function hashKey(key: string): number {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
    return Math.abs(h);
}

function comboColor(key: string): string {
    return PALETTE[hashKey(key) % PALETTE.length];
}

function toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function mondayOf(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    const dow = (r.getDay() + 6) % 7;
    r.setDate(r.getDate() - dow);
    return r;
}

function addDays(d: Date, days: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
}

function parseIso(s: string): Date {
    const [y, m, dd] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, dd || 1);
}

function formatBR(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    if (!m) return iso;
    return `${m[3]}/${m[2]}/${m[1]}`;
}

function compromissoDay(c: CompromissoBasico): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(c.data ?? ''));
    return m ? `${m[1]}-${m[2]}-${m[3]}` : String(c.data ?? '');
}

type Option = {id: number; label: string};

export default function ViewAgendaCalendarioAgendaListScreen() {
    const {session} = useAuth();
    const isAdmin = (session as {hierarquia?: string} | null)?.hierarquia === 'ADMIN';
    const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())));
    const [agendaText, setAgendaText] = useState('');
    const [agendaSel, setAgendaSel] = useState<Option | null>(null);
    const [agendaOpen, setAgendaOpen] = useState(false);
    const [pessoaText, setPessoaText] = useState('');
    const [pessoaSel, setPessoaSel] = useState<Option | null>(null);
    const [pessoaOpen, setPessoaOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    const rangeInicio = useMemo(() => {
        const s = parseIso(weekStart);
        return toIsoDate(new Date(s.getFullYear(), s.getMonth(), 1));
    }, [weekStart]);
    const rangeFim = useMemo(() => {
        const s = parseIso(weekStart);
        const e = addDays(s, 6);
        return toIsoDate(new Date(e.getFullYear(), e.getMonth() + 1, 0));
    }, [weekStart]);

    const usuarioAtualQuery = useQuery({
        queryKey: ['calAgendaM-usuario-atual'],
        queryFn: async () => (await api.get<{id: number}>('/api/basico/usuario/atual')).data,
        retry: false,
    });
    const usuarioId = usuarioAtualQuery.data?.id;

    const agendasPermitidasQuery = useQuery({
        queryKey: ['calAgendaM-agendas-permitidas', usuarioId],
        queryFn: async () => {
            if (!usuarioId) return [] as number[];
            try {
                const {data} = await api.get<number[]>(`/api/basico/usuario/${usuarioId}/agendas`);
                return Array.isArray(data) ? data.map(Number) : [];
            } catch {
                try {
                    const {data} = await api.get<number[]>('/api/basico/usuario/buscar-agendas-disponiveis', {params: {usuarioId}});
                    return Array.isArray(data) ? data.map(Number) : [];
                } catch {
                    return [] as number[];
                }
            }
        },
        enabled: !isAdmin && !!usuarioId,
    });

    const agendasQuery = useQuery({
        queryKey: ['calAgendaM-agendas'],
        queryFn: async () => (await api.get<AgendaBasica[]>('/api/basico/agenda')).data ?? [],
    });

    const unidadesQuery = useQuery({
        queryKey: ['calAgendaM-unidades'],
        queryFn: async () => (await api.get<UnidadeView[]>('/api/view/unidade/listUnidade')).data ?? [],
    });

    const horariosQuery = useQuery({
        queryKey: ['calAgendaM-horarios'],
        queryFn: async () => (await api.get<HorarioBasico[]>('/api/basico/horario')).data ?? [],
    });

    const pessoasOptionsQuery = useQuery({
        queryKey: ['calAgendaM-pessoas'],
        queryFn: async () => (await api.get<Array<{id: number; nome?: string; pessoaFisica?: {nome?: string; cpf?: string}; pessoaJuridica?: {nomeFantasia?: string; cnpj?: string}}>>('/api/view/pessoa/listPessoa')).data ?? [],
    });

    const pessoaNomeMap = useMemo(() => {
        const map = new Map<number, string>();
        for (const p of pessoasOptionsQuery.data ?? []) {
            const pid = Number(p.id);
            const nome = p.nome || p.pessoaFisica?.nome || p.pessoaJuridica?.nomeFantasia || '';
            const doc = p.pessoaFisica?.cpf ? ` (${p.pessoaFisica.cpf})` : p.pessoaJuridica?.cnpj ? ` (${p.pessoaJuridica.cnpj})` : '';
            if (pid && nome) map.set(pid, `${nome}${doc}`);
        }
        return map;
    }, [pessoasOptionsQuery.data]);

    const pessoaOptions: Option[] = useMemo(
        () => Array.from(pessoaNomeMap.entries()).map(([id, label]) => ({id, label})),
        [pessoaNomeMap],
    );

    const agendaSugestoes = useMemo(() => {
        const q = agendaText.trim().toLowerCase();
        const list = agendasPermitidas.map(a => ({id: Number(a.id), label: `${a.descricao} (#${a.id})`}));
        return (q ? list.filter(o => o.label.toLowerCase().includes(q)) : list).slice(0, 30);
    }, [agendaText, agendasPermitidas]);

    const pessoaSugestoes = useMemo(() => {
        const q = pessoaText.trim().toLowerCase();
        const list = pessoaOptions;
        return (q ? list.filter(o => o.label.toLowerCase().includes(q)) : list).slice(0, 30);
    }, [pessoaText, pessoaOptions]);

    const compromissosQuery = useQuery({
        queryKey: ['calAgendaM-compromissos', rangeInicio, rangeFim, agendaSel?.id ?? ''],
        queryFn: async () => {
            const params: Record<string, string | number> = {inicio: rangeInicio, fim: rangeFim};
            if (agendaSel?.id) params.agendaId = agendaSel.id;
            const {data} = await api.get<CompromissoBasico[]>('/api/basico/compromisso/list-compromisso', {params});
            return Array.isArray(data) ? data : [];
        },
    });

    const filtrados = useMemo(() => {
        let list = compromissosQuery.data ?? [];
        if (!agendaSel?.id && !isAdmin && agendaMap.size > 0) {
            list = list.filter(c => c.agendaId == null || agendaMap.has(Number(c.agendaId)));
        }
        if (pessoaSel?.id) list = list.filter(c => Number(c.pessoaId) === Number(pessoaSel.id));
        return list;
    }, [compromissosQuery.data, agendaSel, pessoaSel, isAdmin, agendaMap]);

    const grupos = useMemo(() => {
        const days = Array.from({length: 7}, (_, i) => toIsoDate(addDays(parseIso(weekStart), i)));
        return days.map(day => ({
            day,
            items: filtrados
                .filter(c => compromissoDay(c) === day)
                .sort((a, b) => {
                    const ha = a.horarioId != null ? (horarioMap.get(Number(a.horarioId)) ?? '') : '';
                    const hb = b.horarioId != null ? (horarioMap.get(Number(b.horarioId)) ?? '') : '';
                    return ha.localeCompare(hb);
                }),
        }));
    }, [filtrados, weekStart, horarioMap]);

    const legenda = useMemo(() => {
        if (pessoaSel?.id) {
            return [{agenda: 'Filtro pessoa', pessoa: pessoaSel.label, unidade: 'destaque verde', color: PESSOA_FILTRO_VERDE}];
        }
        const seen = new Map<string, {agenda: string; pessoa: string; unidade: string; color: string}>();
        for (const c of filtrados) {
            const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
            const unidadeId = agenda?.unidadeId != null ? Number(agenda.unidadeId) : 0;
            const key = `${c.agendaId ?? 0}|${c.pessoaId ?? 0}|${unidadeId}`;
            if (seen.has(key)) continue;
            const unidade = unidadeId ? unidadeMap.get(unidadeId) : undefined;
            seen.set(key, {
                agenda: agenda?.descricao ?? (c.agendaId != null ? `Agenda #${c.agendaId}` : '—'),
                pessoa: c.pessoaId != null ? (pessoaNomeMap.get(Number(c.pessoaId)) ?? `Pessoa #${c.pessoaId}`) : '—',
                unidade: unidade ? (unidade.sucinto || unidade.nomeFantasia || `Unidade #${unidadeId}`) : '—',
                color: comboColor(key),
            });
        }
        return Array.from(seen.values()).slice(0, 40);
    }, [filtrados, agendaMap, unidadeMap, pessoaNomeMap, pessoaSel]);

    const detalhe = useMemo(() => {
        if (detailId == null) return null;
        const c = filtrados.find(x => Number(x.id) === Number(detailId));
        if (!c) return null;
        const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
        const unidade = agenda?.unidadeId != null ? unidadeMap.get(Number(agenda.unidadeId)) : undefined;
        return {c, agenda, unidade};
    }, [detailId, filtrados, agendaMap, unidadeMap]);

    const limpar = useCallback(() => {
        setAgendaSel(null);
        setAgendaText('');
        setPessoaSel(null);
        setPessoaText('');
    }, []);

    const loading = compromissosQuery.isLoading || agendasQuery.isLoading;

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Calendário Agenda</Text>

            <View style={styles.filterBox}>
                <Text style={styles.filterLabel}>Agenda (permitidas no cadastro do usuário)</Text>
                <View style={styles.comboRow}>
                    <TextInput
                        style={styles.input}
                        value={agendaSel ? agendaSel.label : agendaText}
                        onChangeText={(t) => {
                            setAgendaSel(null);
                            setAgendaText(t);
                            setAgendaOpen(true);
                        }}
                        onFocus={() => setAgendaOpen(true)}
                        placeholder="Todas as agendas permitidas"
                    />
                    <Pressable style={styles.comboBtn} onPress={() => setAgendaOpen(v => !v)}>
                        <Text style={styles.comboBtnText}>▾</Text>
                    </Pressable>
                    {(agendaSel || agendaText !== '') && (
                        <Pressable style={styles.clearBtn} onPress={() => {
                            setAgendaSel(null);
                            setAgendaText('');
                        }}>
                            <Text style={styles.clearBtnText}>✕</Text>
                        </Pressable>
                    )}
                </View>
                {agendaOpen && (
                    <View style={styles.sugBox}>
                        {agendaSugestoes.map(o => (
                            <Pressable key={o.id} style={styles.sugItem} onPress={() => {
                                setAgendaSel(o);
                                setAgendaText('');
                                setAgendaOpen(false);
                            }}>
                                <Text style={styles.sugText}>{o.label}</Text>
                            </Pressable>
                        ))}
                        {agendaSugestoes.length === 0 && <Text style={styles.empty}>Nenhuma agenda encontrada.</Text>}
                    </View>
                )}

                <Text style={[styles.filterLabel, {marginTop: Spacing.md}]}>Pessoa</Text>
                <View style={styles.comboRow}>
                    <TextInput
                        style={styles.input}
                        value={pessoaSel ? pessoaSel.label : pessoaText}
                        onChangeText={(t) => {
                            setPessoaSel(null);
                            setPessoaText(t);
                            setPessoaOpen(true);
                        }}
                        onFocus={() => setPessoaOpen(true)}
                        placeholder="Todas as pessoas"
                    />
                    <Pressable style={styles.comboBtn} onPress={() => setPessoaOpen(v => !v)}>
                        <Text style={styles.comboBtnText}>▾</Text>
                    </Pressable>
                    {(pessoaSel || pessoaText !== '') && (
                        <Pressable style={styles.clearBtn} onPress={() => {
                            setPessoaSel(null);
                            setPessoaText('');
                        }}>
                            <Text style={styles.clearBtnText}>✕</Text>
                        </Pressable>
                    )}
                </View>
                {pessoaOpen && (
                    <View style={styles.sugBox}>
                        {pessoaSugestoes.map(o => (
                            <Pressable key={o.id} style={styles.sugItem} onPress={() => {
                                setPessoaSel(o);
                                setPessoaText('');
                                setPessoaOpen(false);
                            }}>
                                <Text style={styles.sugText}>{o.label}</Text>
                            </Pressable>
                        ))}
                        {pessoaSugestoes.length === 0 && <Text style={styles.empty}>Nenhuma pessoa encontrada.</Text>}
                    </View>
                )}

                <View style={styles.weekRow}>
                    <Pressable style={styles.navBtn} onPress={() => setWeekStart(toIsoDate(addDays(parseIso(weekStart), -7)))}>
                        <Text style={styles.navBtnText}>‹ Ant</Text>
                    </Pressable>
                    <Text style={styles.weekLabel}>{formatBR(weekStart)} – {formatBR(toIsoDate(addDays(parseIso(weekStart), 6)))}</Text>
                    <Pressable style={styles.navBtn} onPress={() => setWeekStart(toIsoDate(addDays(parseIso(weekStart), 7)))}>
                        <Text style={styles.navBtnText}>Próx ›</Text>
                    </Pressable>
                    <Pressable style={[styles.navBtn, styles.todayBtn]} onPress={() => setWeekStart(toIsoDate(mondayOf(new Date())))}>
                        <Text style={styles.navBtnText}>Hoje</Text>
                    </Pressable>
                    <Pressable style={[styles.navBtn, styles.limparBtn]} onPress={limpar}>
                        <Text style={styles.navBtnText}>Limpar</Text>
                    </Pressable>
                </View>
                {(agendaSel || pessoaSel) && (
                    <Text style={styles.countText}>{filtrados.length} compromisso(s) no período.</Text>
                )}
                {pessoaSel?.id && (
                    <Text style={styles.filtroVerdeText}>Filtrando por pessoa: {pessoaSel.label} — campos em verde.</Text>
                )}
            </View>

            {legenda.length > 0 && (
                <View style={styles.legendBox}>
                    {legenda.map((l, i) => (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.dot, {backgroundColor: l.color}]} />
                            <Text style={styles.legendText}>{l.agenda} • {l.pessoa} • {l.unidade}</Text>
                        </View>
                    ))}
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : compromissosQuery.isError ? (
                <Text style={styles.empty}>Erro ao carregar a agenda.</Text>
            ) : (
                <FlatList
                    data={grupos}
                    keyExtractor={(g) => g.day}
                    refreshing={compromissosQuery.isFetching}
                    onRefresh={() => compromissosQuery.refetch()}
                    renderItem={({item: grupo}) => (
                        <View style={styles.dayBox}>
                            <Text style={styles.dayTitle}>{formatBR(grupo.day)}</Text>
                            {grupo.items.length === 0 ? (
                                <Text style={styles.empty}>Sem compromissos.</Text>
                            ) : (
                                grupo.items.map(c => {
                                    const agenda = c.agendaId != null ? agendaMap.get(Number(c.agendaId)) : undefined;
                                    const unidadeId = agenda?.unidadeId != null ? Number(agenda.unidadeId) : 0;
                                    const key = `${c.agendaId ?? 0}|${c.pessoaId ?? 0}|${unidadeId}`;
                                    // Ao filtrar por pessoa, os campos do calendário ficam verdes
                                    const color = pessoaSel?.id ? PESSOA_FILTRO_VERDE : comboColor(key);
                                    const hora = c.horarioId != null ? horarioMap.get(Number(c.horarioId)) : undefined;
                                    const pessoa = c.pessoaId != null ? (pessoaNomeMap.get(Number(c.pessoaId)) ?? `Pessoa #${c.pessoaId}`) : '—';
                                    return (
                                        <Pressable key={c.id} style={[styles.eventBox, {borderLeftColor: color}, pessoaSel?.id && styles.eventBoxFiltrado]} onPress={() => setDetailId(Number(c.id))}>
                                            <View style={[styles.eventBadge, {backgroundColor: color}]}>
                                                <Text style={styles.eventBadgeText}>{hora ?? 'dia todo'}</Text>
                                            </View>
                                            <Text style={styles.eventTitle}>{agenda?.descricao ?? `Agenda #${c.agendaId ?? '—'}`}</Text>
                                            <Text style={styles.eventSub}>{pessoa}</Text>
                                            {c.descricao ? <Text style={styles.eventSub}>{c.descricao}</Text> : null}
                                        </Pressable>
                                    );
                                })
                            )}
                        </View>
                    )}
                />
            )}

            <Modal visible={detalhe != null} transparent animationType="fade" onRequestClose={() => setDetailId(null)}>
                <Pressable style={styles.modalOverlay} onPress={() => setDetailId(null)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Compromisso #{detalhe?.c.id}</Text>
                            <Text style={styles.modalText}>Data: {detalhe ? formatBR(compromissoDay(detalhe.c)) : ''}</Text>
                            <Text style={styles.modalText}>Descrição: {detalhe?.c.descricao || '—'}</Text>
                            <Text style={styles.modalText}>Agenda: {detalhe?.agenda?.descricao ?? (detalhe?.c.agendaId != null ? `#${detalhe.c.agendaId}` : '—')}</Text>
                            <Text style={styles.modalText}>Pessoa: {detalhe?.c.pessoaId != null ? (pessoaNomeMap.get(Number(detalhe.c.pessoaId)) ?? `#${detalhe.c.pessoaId}`) : '—'}</Text>
                            <Text style={styles.modalText}>Unidade da agenda: {detalhe?.unidade ? (detalhe.unidade.sucinto || detalhe.unidade.nomeFantasia || `#${detalhe.unidade.id}`) : '—'}</Text>
                            {detalhe?.c.observacao ? <Text style={styles.modalText}>Observação: {detalhe.c.observacao}</Text> : null}
                            <Pressable style={styles.closeBtn} onPress={() => setDetailId(null)}>
                                <Text style={styles.closeBtnText}>Fechar</Text>
                            </Pressable>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
        padding: Spacing.lg,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    filterBox: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    filterLabel: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    comboRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgSecondary,
    },
    comboBtn: {
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: Colors.bgPrimary,
    },
    comboBtnText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    clearBtn: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    clearBtnText: {
        fontSize: 16,
        color: Colors.error,
    },
    sugBox: {
        maxHeight: 220,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: BorderRadius.lg,
        marginTop: 4,
        backgroundColor: Colors.bgSecondary,
    },
    sugItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    sugText: {
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
    },
    weekRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: Spacing.md,
        flexWrap: 'wrap',
    },
    navBtn: {
        backgroundColor: Colors.primary + '15',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    todayBtn: {
        backgroundColor: '#5cb85c22',
    },
    limparBtn: {
        backgroundColor: Colors.warningBg,
    },
    navBtnText: {
        color: Colors.primary,
        fontWeight: Typography.weights.semibold,
    },
    weekLabel: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        flexShrink: 1,
    },
    countText: {
        marginTop: 6,
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
    },
    filtroVerdeText: {
        marginTop: 6,
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: '#155724',
        backgroundColor: '#d4edda',
        borderWidth: 1,
        borderColor: PESSOA_FILTRO_VERDE,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    legendBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: Spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.bgSecondary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 8,
        paddingVertical: 4,
        maxWidth: '100%',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    legendText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        flexShrink: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    empty: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        padding: Spacing.sm,
    },
    dayBox: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    dayTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    eventBox: {
        borderLeftWidth: 4,
        backgroundColor: Colors.bgPrimary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    eventBoxFiltrado: {
        backgroundColor: '#d4edda',
        borderColor: PESSOA_FILTRO_VERDE,
    },
    eventBadge: {
        alignSelf: 'flex-start',
        borderRadius: BorderRadius.md,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 4,
    },
    eventBadgeText: {
        color: '#fff',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
    eventTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    eventSub: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.modalOverlay,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalBox: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xxl,
        padding: Spacing.xl,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    modalText: {
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    closeBtn: {
        marginTop: Spacing.md,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
    },
    closeBtnText: {
        color: Colors.textWhite,
        fontWeight: Typography.weights.semibold,
    },
});
