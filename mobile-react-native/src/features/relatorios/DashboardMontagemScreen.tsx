import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {
    DASHBOARD_LAYOUTS,
    TILE_TIPOS,
    carregarMontagem,
    excluirMontagem,
    listarMontagens,
    novaMontagemId,
    salvarMontagem,
    tileTipoLabel,
    tilesForLayout,
    tileViewRoute,
    type DashboardLayoutId,
    type DashboardMontagem,
    type DashboardTile,
    type DashboardTileTipo,
} from './dashboardMontagem';

type OpcaoRelatorio = { id: number; nome: string; tipo: string };

const isGrafico = (tipo: string) =>
    tipo === 'GRAFICO' || tipo === 'PIZZA' || tipo === 'LINHA' || tipo === 'COMBINADO' ||
    tipo === 'CIRCULAR' || tipo === 'BARRA_VERTICAL' || tipo === 'BARRA_HORIZONTAL';

const aceitaTipo = (tileTipo: DashboardTileTipo | null, backendTipo: string): boolean => {
    if (!tileTipo) return false;
    if (tileTipo === 'TABELA') return backendTipo === 'TABELA';
    if (tileTipo === 'MAPA') return backendTipo === 'MAPA';
    if (tileTipo === 'ORGANOGRAMA') return backendTipo === 'ORGANOGRAMA';
    if (tileTipo === 'INDICADOR_GAUGE') return backendTipo === 'INDICADOR_GAUGE';
    return isGrafico(backendTipo);
};

async function buscarOpcoes(tileTipo: DashboardTileTipo | null, busca: string): Promise<OpcaoRelatorio[]> {
    if (!tileTipo) return [];
    if (tileTipo === 'INDICADOR_GAUGE') {
        const resp = await api.get(API_PATHS.relatorios.indicadorGaugeDisponiveis, {
            params: {page: 0, size: 50, ...(busca ? {busca} : {})},
        });
        const data = resp.data;
        const items = Array.isArray(data) ? data : (data?.content ?? []);
        return items.map((g: any) => ({id: g.id, nome: g.nome, tipo: 'INDICADOR_GAUGE'}));
    }
    const resp = await api.get(API_PATHS.relatorios.relatorioDisponiveis);
    const data = resp.data;
    const items: any[] = Array.isArray(data) ? data : (data?.content ?? []);
    const termo = busca.trim().toLowerCase();
    return items
        .filter((r) => aceitaTipo(tileTipo, String(r.tipo ?? '')))
        .filter((r) => (!termo || String(r.nome ?? '').toLowerCase().includes(termo)))
        .map((r) => ({id: r.id, nome: r.nome, tipo: String(r.tipo)}));
}

export default function DashboardMontagemScreen({route, navigation}: any) {
    const editId: string | undefined = route?.params?.id;
    const [nome, setNome] = useState('');
    const [layoutId, setLayoutId] = useState<DashboardLayoutId>('grade-2x2');
    const [tiles, setTiles] = useState<DashboardTile[]>(() => tilesForLayout('grade-2x2'));
    const [montagens, setMontagens] = useState<DashboardMontagem[]>([]);
    const [pickerSlot, setPickerSlot] = useState<number | null>(null);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        listarMontagens().then(setMontagens);
        if (editId) {
            carregarMontagem(editId).then((atual) => {
                if (atual) {
                    setNome(atual.nome);
                    setLayoutId(atual.layoutId);
                    setTiles(tilesForLayout(atual.layoutId, atual.tiles));
                }
            });
        }
    }, [editId]);

    const layout = useMemo(
        () => DASHBOARD_LAYOUTS.find((l) => l.id === layoutId) ?? DASHBOARD_LAYOUTS[0],
        [layoutId],
    );

    const trocarLayout = (next: DashboardLayoutId) => {
        setLayoutId(next);
        setTiles((prev) => tilesForLayout(next, prev));
    };

    const atualizarTile = (index: number, patch: Partial<DashboardTile>) =>
        setTiles((prev) => prev.map((t, i) => (i === index ? {...t, ...patch} : t)));

    const limparTile = (index: number) =>
        setTiles((prev) => prev.map((t, i) =>
            (i === index ? {...t, tipo: null, relatorioId: null, relatorioNome: null, titulo: ''} : t),
        ));

    const handleSalvar = async () => {
        if (nome.trim().length < 3) {
            alert('Informe o nome do dashboard (mínimo 3 caracteres).');
            return;
        }
        if (!tiles.some((t) => t.tipo && t.relatorioId)) {
            alert('Preencha pelo menos um quadrinho com tipo de relatório e indicador.');
            return;
        }
        setSalvando(true);
        try {
            await salvarMontagem({
                id: editId ?? novaMontagemId(),
                nome: nome.trim(),
                layoutId,
                tiles,
                updatedAt: new Date().toISOString(),
            });
            const lista = await listarMontagens();
            setMontagens(lista);
            alert('Dashboard salvo com sucesso!');
            navigation?.navigate?.('view/relatorios/listDashboard');
        } finally {
            setSalvando(false);
        }
    };

    const handleExcluir = async () => {
        if (!editId) return;
        await excluirMontagem(editId);
        navigation?.navigate?.('view/relatorios/listDashboard');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbLink}>Relatórios</Text>
                <Text style={styles.breadcrumbSep}> › </Text>
                <Text style={styles.breadcrumbLink}>Painéis</Text>
                <Text style={styles.breadcrumbSep}> › </Text>
                <Text style={styles.breadcrumbCurrent}>Dashboard — {editId ? 'Edição' : 'Cadastro'}</Text>
            </View>
            <View style={styles.header}>
                <Text style={styles.title}>{editId ? 'Editar dashboard' : 'Novo dashboard'}</Text>
                <Text style={styles.subtitle}>
                    Defina o nome, escolha um template de layout e preencha cada quadrinho com tabelas,
                    gráficos, mapas, organogramas ou indicadores gauge.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1 · Nome do dashboard</Text>
                <TextInput
                    style={styles.input}
                    value={nome}
                    maxLength={120}
                    placeholder="Ex: Comercial — Visão executiva"
                    onChangeText={setNome}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>2 · Template de layout</Text>
                <View style={styles.templates}>
                    {DASHBOARD_LAYOUTS.map((l) => {
                        const active = l.id === layoutId;
                        return (
                            <Pressable
                                key={l.id}
                                style={[styles.template, active && styles.templateActive]}
                                onPress={() => trocarLayout(l.id)}
                            >
                                <View style={styles.miniGrid}>
                                    {Array.from({length: l.slots}).map((_, i) => (
                                        <View key={i} style={[styles.miniBox, active && styles.miniBoxActive]} />
                                    ))}
                                </View>
                                <Text style={styles.templateName}>{l.nome}</Text>
                                <Text style={styles.templateDesc}>{l.descricao}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>3 · Quadrinhos — {layout.nome}</Text>
                {tiles.map((tile, index) => {
                    const rota = tileViewRoute(tile);
                    return (
                        <View key={tile.id} style={styles.tile}>
                            <View style={styles.tileHead}>
                                <Text style={styles.slot}>#{index + 1}</Text>
                                <Text style={styles.tileTipo}>{tileTipoLabel(tile.tipo)}</Text>
                            </View>
                            <Text style={styles.label}>Tipo de relatório</Text>
                            <View style={styles.tipoRow}>
                                {TILE_TIPOS.map((t) => {
                                    const selected = tile.tipo === t.value;
                                    return (
                                        <Pressable
                                            key={t.value}
                                            style={[styles.tipoChip, selected && styles.tipoChipActive]}
                                            onPress={() => atualizarTile(index, {
                                                tipo: t.value,
                                                relatorioId: null,
                                                relatorioNome: null,
                                            })}
                                        >
                                            <Text style={[styles.tipoChipText, selected && styles.tipoChipTextActive]}>
                                                {t.icone} {t.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                            <Text style={styles.label}>Indicador do quadrinho</Text>
                            <Text style={styles.reportName}>
                                {tile.relatorioNome ?? 'Nenhum indicador escolhido'}
                            </Text>
                            <View style={styles.tileActions}>
                                <Pressable
                                    style={[styles.button, !tile.tipo && styles.buttonDisabled]}
                                    disabled={!tile.tipo}
                                    onPress={() => setPickerSlot(index)}
                                >
                                    <Text style={styles.buttonText}>{tile.relatorioId ? 'Trocar' : 'Escolher'}</Text>
                                </Pressable>
                                {tile.relatorioId && (
                                    <Pressable style={[styles.button, styles.danger]} onPress={() => limparTile(index)}>
                                        <Text style={styles.buttonText}>Limpar</Text>
                                    </Pressable>
                                )}
                                {rota && (
                                    <Pressable
                                        style={[styles.button, styles.secondary]}
                                        onPress={() => navigation?.navigate?.(rota.name as never, (rota.params ?? {}) as never)}
                                    >
                                        <Text style={styles.secondaryText}>Ver ↗</Text>
                                    </Pressable>
                                )}
                            </View>
                            <Text style={styles.label}>Título do quadrinho (opcional)</Text>
                            <TextInput
                                style={styles.input}
                                value={tile.titulo}
                                maxLength={80}
                                placeholder="Ex: Receita do mês"
                                onChangeText={(v) => atualizarTile(index, {titulo: v})}
                            />
                        </View>
                    );
                })}
            </View>

            <View style={styles.actions}>
                <Pressable style={[styles.button, styles.primary]} disabled={salvando} onPress={handleSalvar}>
                    <Text style={styles.buttonText}>{salvando ? 'Salvando...' : 'Salvar dashboard'}</Text>
                </Pressable>
                {editId && (
                    <Pressable style={[styles.button, styles.danger]} onPress={handleExcluir}>
                        <Text style={styles.buttonText}>Excluir</Text>
                    </Pressable>
                )}
                <Pressable
                    style={[styles.button, styles.warning]}
                    onPress={() => navigation?.navigate?.('view/relatorios/listDashboard')}
                >
                    <Text style={styles.warningText}>Voltar</Text>
                </Pressable>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Montagens salvas neste aparelho</Text>
                {montagens.length === 0 ? (
                    <Text style={styles.subtitle}>Nenhuma montagem salva ainda.</Text>
                ) : (
                    montagens.map((m) => (
                        <View key={m.id} style={styles.savedRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.savedName}>{m.nome}</Text>
                                <Text style={styles.savedMeta}>
                                    {m.tiles.filter((t) => t.relatorioId).length}/{m.tiles.length} quadrinhos
                                </Text>
                            </View>
                            <Pressable
                                style={[styles.button, styles.secondary]}
                                onPress={() => navigation?.navigate?.(
                                    'view/relatorios/dashboardMontagem' as never,
                                    {id: m.id} as never,
                                )}
                            >
                                <Text style={styles.secondaryText}>Editar</Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </View>

            <RelatorioPickerModal
                visible={pickerSlot !== null}
                tipo={pickerSlot !== null ? tiles[pickerSlot]?.tipo ?? null : null}
                onClose={() => setPickerSlot(null)}
                onSelect={(opcao) => {
                    if (pickerSlot !== null) {
                        atualizarTile(pickerSlot, {relatorioId: opcao.id, relatorioNome: opcao.nome});
                    }
                    setPickerSlot(null);
                }}
            />
        </ScrollView>
    );
}

function RelatorioPickerModal({visible, tipo, onClose, onSelect}: {
    visible: boolean;
    tipo: DashboardTileTipo | null;
    onClose: () => void;
    onSelect: (opcao: OpcaoRelatorio) => void;
}) {
    const [busca, setBusca] = useState('');
    const [opcoes, setOpcoes] = useState<OpcaoRelatorio[]>([]);
    const [loading, setLoading] = useState(false);

    const carregar = useCallback(async (termo: string) => {
        setLoading(true);
        try {
            setOpcoes(await buscarOpcoes(tipo, termo));
        } catch {
            setOpcoes([]);
        } finally {
            setLoading(false);
        }
    }, [tipo]);

    useEffect(() => {
        if (visible) {
            setBusca('');
            carregar('');
        }
    }, [visible, tipo, carregar]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <View style={styles.modalHead}>
                        <Text style={styles.sectionTitle}>Escolher {tileTipoLabel(tipo)}</Text>
                        <Pressable style={[styles.button, styles.danger]} onPress={onClose}>
                            <Text style={styles.buttonText}>Fechar</Text>
                        </Pressable>
                    </View>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={[styles.input, {flex: 1}]}
                            value={busca}
                            placeholder="Buscar por nome..."
                            onChangeText={setBusca}
                        />
                        <Pressable style={[styles.button, styles.secondary]} onPress={() => carregar(busca.trim())}>
                            <Text style={styles.secondaryText}>Buscar</Text>
                        </Pressable>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <FlatList
                            data={opcoes}
                            keyExtractor={(item) => `${item.tipo}-${item.id}`}
                            ListEmptyComponent={<Text style={styles.subtitle}>Nenhum relatório encontrado.</Text>}
                            renderItem={({item}) => (
                                <Pressable style={styles.option} onPress={() => onSelect(item)}>
                                    <Text style={styles.savedName}>{item.nome}</Text>
                                    <Text style={styles.savedMeta}>#{item.id} · {item.tipo}</Text>
                                </Pressable>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8fafc', padding: 16},
    breadcrumb: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 8},
    breadcrumbLink: {fontSize: 12, color: '#265a88'},
    breadcrumbSep: {fontSize: 12, color: '#999999'},
    breadcrumbCurrent: {fontSize: 12, fontWeight: '700', color: '#333333'},
    header: {marginBottom: 12},
    title: {fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 4},
    subtitle: {fontSize: 13, color: '#64748b', marginTop: 4},
    card: {backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, marginBottom: 12},
    sectionTitle: {fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 10},
    label: {fontSize: 12, fontWeight: '600', color: '#475569', marginTop: 8, marginBottom: 4},
    input: {borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#fff'},
    templates: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    template: {width: '48%', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, backgroundColor: '#f8fafc'},
    templateActive: {borderColor: '#2563eb', backgroundColor: '#eff6ff'},
    miniGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6},
    miniBox: {width: 22, height: 16, backgroundColor: '#cbd5e1', borderRadius: 3},
    miniBoxActive: {backgroundColor: '#93c5fd'},
    templateName: {fontSize: 13, fontWeight: '700', color: '#0f172a'},
    templateDesc: {fontSize: 11, color: '#64748b'},
    tile: {borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, backgroundColor: '#f8fafc', padding: 12, marginBottom: 10},
    tileHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
    slot: {fontSize: 12, fontWeight: '800', color: '#fff', backgroundColor: '#0f172a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2},
    tileTipo: {fontSize: 12, fontWeight: '700', color: '#334155'},
    tipoRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
    tipoChip: {borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff'},
    tipoChipActive: {backgroundColor: '#2563eb', borderColor: '#2563eb'},
    tipoChipText: {fontSize: 12, color: '#334155'},
    tipoChipTextActive: {color: '#fff', fontWeight: '700'},
    reportName: {fontSize: 13, fontWeight: '600', color: '#0f172a', marginVertical: 4},
    tileActions: {flexDirection: 'row', gap: 8, marginVertical: 6, flexWrap: 'wrap'},
    button: {backgroundColor: '#0f172a', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10},
    buttonDisabled: {opacity: 0.4},
    primary: {backgroundColor: '#2563eb'},
    danger: {backgroundColor: '#dc2626'},
    secondary: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1'},
    warning: {backgroundColor: '#eab308'},
    buttonText: {color: '#fff', fontSize: 13, fontWeight: '700'},
    secondaryText: {color: '#0f172a', fontSize: 13, fontWeight: '700'},
    warningText: {color: '#1c1917', fontSize: 13, fontWeight: '700'},
    actions: {flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12},
    savedRow: {flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 8},
    savedName: {fontSize: 14, fontWeight: '700', color: '#0f172a'},
    savedMeta: {fontSize: 12, color: '#64748b'},
    modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
    modalBox: {backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '85%'},
    modalHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
    searchRow: {flexDirection: 'row', gap: 8, marginBottom: 10},
    option: {borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 6, backgroundColor: '#f8fafc'},
});
