import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, Switch, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { MasterDetail, MasterDetailColumn } from '../MasterDetail';
import { AutoComplete, AutoCompleteOption } from '../AutoComplete';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';
import type { ApiItem } from '../types';

const LIST_PATH = '/api/comercial/campanha';
const UNIDADE_COLUMNS: MasterDetailColumn[] = [
    { key: 'id', label: 'Id' },
    { key: 'sucinto', label: 'Sucinto' },
    { key: 'razaoSocial', label: 'Razão Social' },
    { key: 'nomeFantasia', label: 'Nome Fantasia' },
    { key: 'CNPJ', label: 'CNPJ' },
    { key: 'ativo', label: 'Ativo' },
];

interface AcaoItem {
    id: number;
    tipoCanalId: number;
    tipoCanalDescricao: string;
    estrategiaId: number;
    estrategiaDescricao: string;
    dataInicial: string;
    dataFinal: string;
}

export default function ViewCampanhaFormCampanhaListScreen() {
    const navigation: any = useNavigation();
    const route: any = useRoute();
    const editingId: number | null = route.params?.id ?? null;

    const [descricao, setDescricao] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [meta, setMeta] = useState('');
    const [ativo, setAtivo] = useState(true);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [acoes, setAcoes] = useState<AcaoItem[]>([]);

    const [tipoCanalId, setTipoCanalId] = useState<number | null>(null);
    const [tipoCanalDesc, setTipoCanalDesc] = useState('');
    const [estrategiaId, setEstrategiaId] = useState<number | null>(null);
    const [estrategiaDesc, setEstrategiaDesc] = useState('');
    const [acaoDataInicial, setAcaoDataInicial] = useState('');
    const [acaoDataFinal, setAcaoDataFinal] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: tipoCanais = [] } = useQuery({
        queryKey: ['tipoCanais'],
        queryFn: async () => (await api.get<ApiItem[]>('/api/comercial/tipo-canal')).data,
    });

    const fetchEstrategias = async (query: string): Promise<AutoCompleteOption[]> => {
        const res = await api.get<ApiItem[]>(`/api/comercial/estrategia/autocomplete?q=${encodeURIComponent(query)}`);
        return (res.data || []).map((e) => ({ id: Number(e.id), label: String(e.descricao ?? e.nome ?? e.rotulo ?? `#${e.id}`) }));
    };

    useEffect(() => {
        if (editingId == null) return;
        setLoading(true);
        const tryFetch = async () => {
            try {
                const res = await api.get<ApiItem>(`${LIST_PATH}/${editingId}`);
                const c = res.data;
                setDescricao(c.descricao ?? '');
                setMeta(String(c.meta ?? ''));
                setAtivo(c.ativo ?? true);
                const d = c.dataInicial;
                setDataInicial(d ? new Date(d).toISOString().split('T')[0] : '');
                if (c.unidadeIds) {
                    const unidRes = await api.get<ApiItem[]>(`/api/comercial/campanha/${editingId}/unidades`);
                    setUnidades(unidRes.data || []);
                }
                if (c.acoes) {
                    const acoesRes = await api.get<ApiItem[]>(`/api/comercial/campanha/${editingId}/acoes`);
                    setAcoes((acoesRes.data || []).map((a) => ({
                        id: Number(a.id),
                        tipoCanalId: Number(a.tipoCanalId),
                        tipoCanalDescricao: a.tipoCanalDescricao ?? '',
                        estrategiaId: Number(a.estrategiaId),
                        estrategiaDescricao: a.estrategiaDescricao ?? '',
                        dataInicial: a.dataInicial ? new Date(a.dataInicial).toISOString().split('T')[0] : '',
                        dataFinal: a.dataFinal ? new Date(a.dataFinal).toISOString().split('T')[0] : '',
                    })));
                }
            } catch (e: any) {
                setError(e?.response?.data?.error ?? 'Erro ao carregar.');
            } finally {
                setLoading(false);
            }
        };
        tryFetch();
    }, [editingId]);

    const validate = (): string | null => {
        const d = descricao.trim();
        if (!d) return 'Descrição é obrigatória.';
        if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';
        if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';
        if (!meta || isNaN(Number(meta))) return 'Meta é obrigatória.';
        if (!dataInicial) return 'Data inicial é obrigatória.';
        if (unidades.length === 0) return 'Selecione pelo menos uma unidade.';
        if (acoes.length === 0) return 'Adicione pelo menos uma Ação de Campanha.';
        const tipoSet = new Set<number>();
        for (const a of acoes) {
            if (tipoSet.has(a.tipoCanalId)) return 'As Ações não podem ter Tipos de Canais repetidos.';
            tipoSet.add(a.tipoCanalId);
            const campIni = new Date(dataInicial);
            const acIni = new Date(a.dataInicial);
            const acFim = new Date(a.dataFinal);
            if (acIni < campIni) return 'A Ação deve começar após o início da Campanha.';
            if (acFim < acIni) return 'Data final da Ação não pode ser anterior à data inicial.';
        }
        return null;
    };

    const handleSave = async () => {
        const msg = validate();
        if (msg) { setError(msg); return; }
        setSaving(true);
        setError('');
        setSuccess('');
        const payload = {
            descricao: descricao.trim(),
            meta: Number(meta),
            ativo,
            dataInicial,
            unidadeIds: unidades.map((u) => Number(u.id)),
            acoes: acoes.map((a) => ({
                tipoCanalId: a.tipoCanalId,
                estrategiaId: a.estrategiaId,
                dataInicial: a.dataInicial,
                dataFinal: a.dataFinal,
            })),
        };
        try {
            if (editingId != null) await api.put(`${LIST_PATH}/${editingId}`, payload);
            else await api.post(LIST_PATH, payload);
            setSuccess(editingId != null ? 'Atualizado com sucesso.' : 'Criado com sucesso.');
            setTimeout(() => navigation.goBack(), 700);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const addAcao = () => {
        if (tipoCanalId === null || estrategiaId === null || !acaoDataInicial || !acaoDataFinal) {
            Alert.alert('Validação', 'Preencha todos os campos da Ação');
            return;
        }
        const newAcao: AcaoItem = {
            id: Date.now(),
            tipoCanalId,
            tipoCanalDescricao: tipoCanalDesc,
            estrategiaId,
            estrategiaDescricao: estrategiaDesc,
            dataInicial: acaoDataInicial,
            dataFinal: acaoDataFinal,
        };
        setAcoes([...acoes, newAcao]);
        setTipoCanalId(null);
        setTipoCanalDesc('');
        setEstrategiaId(null);
        setEstrategiaDesc('');
        setAcaoDataInicial('');
        setAcaoDataFinal('');
    };

    const removeAcao = (id: number) => {
        setAcoes(acoes.filter((a) => a.id !== id));
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>{editingId != null ? `Editar Campanha #${editingId}` : 'Nova Campanha'}</Text>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}><Text style={styles.backText}>Voltar</Text></Pressable>
            </View>

            <View style={styles.separator} />

            {!!error && <View style={styles.errBox}><Text style={styles.errText}>{error}</Text></View>}
            {!!success && <View style={styles.okBox}><Text style={styles.okText}>{success}</Text></View>}
            {loading && <ActivityIndicator color={Colors.primary} style={styles.spinner} />}

            <View style={styles.divForm}>
                <View style={styles.tableForm}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Id</Text>
                        <TextInput style={[styles.input, styles.inputTiny]} value={editingId != null ? String(editingId) : ''} editable={false} placeholder="(novo)" />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Descrição <Text style={styles.req}>*</Text></Text>
                        <TextInput style={[styles.input, styles.inputLarge]} value={descricao} onChangeText={setDescricao} maxLength={255} placeholder="Descrição da campanha" />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Data Inicial <Text style={styles.req}>*</Text></Text>
                        <TextInput style={styles.input} value={dataInicial} onChangeText={setDataInicial} placeholder="YYYY-MM-DD" />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Meta <Text style={styles.req}>*</Text></Text>
                        <TextInput style={styles.input} value={meta} onChangeText={setMeta} keyboardType="numeric" placeholder="Meta numérica" />
                    </View>

                    {editingId != null && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Ativo</Text>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>{ativo ? 'Sim' : 'Não'}</Text>
                                <Switch value={ativo} onValueChange={setAtivo} />
                            </View>
                        </View>
                    )}

                    <View style={styles.rowFull}>
                        <MasterDetail
                            label="Unidades"
                            source="/api/basico/unidade"
                            valueKey="id"
                            searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                            columns={UNIDADE_COLUMNS}
                            items={unidades}
                            onChange={setUnidades}
                        />
                    </View>

                    <View style={styles.rowFull}>
                        <Text style={styles.sectionTitle}>Ações de Campanha ({acoes.length})</Text>

                        <View style={styles.subSection}>
                            <Text style={styles.subLabel}>Tipo Canal <Text style={styles.req}>*</Text></Text>
                            <View style={styles.chipWrap}>
                                {tipoCanais.map((tc) => (
                                    <Pressable
                                        key={tc.id}
                                        style={[
                                            styles.chip,
                                            tipoCanalId === tc.id && styles.chipSelected,
                                        ]}
                                        onPress={() => {
                                            setTipoCanalId(Number(tc.id));
                                            setTipoCanalDesc(String(tc.descricao ?? tc.nome ?? tc.rotulo ?? ''));
                                        }}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            tipoCanalId === tc.id && styles.chipTextSelected,
                                        ]}>
                                            {tc.descricao ?? tc.nome ?? tc.rotulo ?? `#${tc.id}`}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <AutoComplete
                            label="Estratégia *"
                            placeholder="Digite para buscar estratégia..."
                            value={estrategiaId ? { id: estrategiaId, label: estrategiaDesc } : null}
                            onChange={(opt) => {
                                setEstrategiaId(opt?.id ?? null);
                                setEstrategiaDesc(opt?.label ?? '');
                            }}
                            fetchOptions={fetchEstrategias}
                            minChars={2}
                        />

                        <View style={styles.subSection}>
                            <Text style={styles.subLabel}>Data Inicial <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} value={acaoDataInicial} onChangeText={setAcaoDataInicial} placeholder="YYYY-MM-DD" />
                        </View>

                        <View style={styles.subSection}>
                            <Text style={styles.subLabel}>Data Final <Text style={styles.req}>*</Text></Text>
                            <TextInput style={styles.input} value={acaoDataFinal} onChangeText={setAcaoDataFinal} placeholder="YYYY-MM-DD" />
                        </View>

                        <Pressable style={[styles.btn, styles.btnAdd]} onPress={addAcao} disabled={saving}>
                            <Text style={styles.btnText}>Adicionar Ação</Text>
                        </Pressable>

                        {acoes.length === 0 ? (
                            <Text style={styles.empty}>Nenhuma ação adicionada.</Text>
                        ) : (
                            <View style={styles.list}>
                                {acoes.map((a) => (
                                    <View key={a.id} style={styles.rowAction}>
                                        <View style={styles.rowText}>
                                            <Text>{a.tipoCanalDescricao}</Text>
                                            <Text>{a.estrategiaDescricao}</Text>
                                            <Text>{a.dataInicial} - {a.dataFinal}</Text>
                                        </View>
                                        <Pressable style={styles.removeButton} onPress={() => removeAcao(a.id)}>
                                            <Text style={styles.removeButtonText}>−</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable style={[styles.btn, styles.btnBack]} onPress={() => navigation.goBack()} disabled={saving}>
                    <Text style={styles.btnText}>Voltar</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={saving}>
                    <Text style={styles.btnText}>{saving ? 'Salvando...' : (editingId != null ? 'Atualizar' : 'Salvar')}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.bgPrimary },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    title: { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
    backBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    backText: { color: Colors.primary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    separator: { borderBottomWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.md },
    errBox: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    errText: { color: Colors.error, fontSize: Typography.sizes.base },
    okBox: { backgroundColor: Colors.successBg, borderWidth: 1, borderColor: Colors.success, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
    okText: { color: Colors.success, fontSize: Typography.sizes.base },
    spinner: { marginVertical: Spacing.md },
    divForm: { backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.medium },
    tableForm: { gap: Spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    rowFull: { flexDirection: 'column', gap: Spacing.md },
    label: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, width: 120, flexShrink: 0 },
    req: { color: Colors.error },
    input: { flex: 1, borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.base, color: Colors.textPrimary, backgroundColor: Colors.bgPrimary },
    inputTiny: { width: 60 },
    inputLarge: { flex: 1 },
    sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.xs },
    subSection: { marginTop: Spacing.sm, gap: Spacing.xs },
    subLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, color: Colors.textSecondary },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
    switchLabel: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
    chipWrap: { flexWrap: 'wrap', flexDirection: 'row', gap: Spacing.xs },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.bgPrimary },
    chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
    chipTextSelected: { color: Colors.textWhite },
    list: { marginTop: Spacing.md },
    rowAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, marginBottom: Spacing.xs, backgroundColor: Colors.bgPrimary },
    rowText: { flex: 1 },
    removeButton: { backgroundColor: Colors.error, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    removeButtonText: { color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    empty: { color: Colors.textLight, fontStyle: 'italic', textAlign: 'center', marginTop: Spacing.md },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderColor: Colors.borderLight },
    btn: { borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minWidth: 120 },
    btnBack: { backgroundColor: Colors.bgPrimary, borderWidth: 1, borderColor: Colors.borderMedium },
    btnSave: { backgroundColor: Colors.primary, ...Shadows.gold },
    btnAdd: { backgroundColor: Colors.success, marginTop: Spacing.sm },
    btnText: { color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, textAlign: 'center' },
});