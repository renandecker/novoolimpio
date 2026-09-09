import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AutoComplete, type AutoCompleteOption } from '../AutoComplete';
import { MasterDetail } from '../MasterDetail';
import { TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH } from '../masterDetailSources';
import { api } from '../api';
import type { ApiItem } from '../types';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

function parseHora(h: string): number {
    if (!h || typeof h !== 'string') return NaN;
    const parts = h.split(':');
    if (parts.length !== 2) return NaN;
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
    return hh * 60 + mm;
}
function existeConflitoEntreHorarios(inicio1: string, fim1: string, inicio2: string, fim2: string): boolean {
    const s1 = parseHora(inicio1); const e1 = parseHora(fim1); const s2 = parseHora(inicio2); const e2 = parseHora(fim2);
    if ([s1, e1, s2, e2].some((v) => Number.isNaN(v))) return false;
    return (s2 < e1 && e2 > s1) || (s1 < e2 && e1 > s2);
}
function getDiaSemanaId(item: ApiItem): string {
    const r = asRecord(item);
    const v = (r.diaSemanaId ?? r.diaSemana ?? (r as Record<string, unknown>)['id_dia_semana']) as unknown;
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
        const rec = v as Record<string, unknown>;
        if (rec.id !== undefined) return String(rec.id);
        return '';
    }
    return String(v);
}

export default function ViewTurnoUsuarioListTurnoUsuarioListScreen() {
    const navigation = useNavigation() as unknown as { navigate: (s: string) => void; goBack: () => void };
    const [operador, setOperador] = useState<AutoCompleteOption | null>(null);
    const [listaTurnos, setListaTurnos] = useState<ApiItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [notice, setNotice] = useState<{ type: 'info' | 'warn' | 'error' | 'success'; detail: string } | null>(null);

    const fetchUsuarioOptions = async (query: string): Promise<AutoCompleteOption[]> => {
        const q = query.trim().toLowerCase();
        const tryPaths = ['/api/basico/usuario', '/api/view/usuario/listUsuario'];
        for (const p of tryPaths) {
            try {
                const res = await api.get<unknown>(p);
                const raw: unknown[] = Array.isArray(res.data) ? (res.data as unknown[]) : ((res.data as { content?: unknown[] })?.content ?? []);
                const opts: AutoCompleteOption[] = raw
                    .map((u) => {
                        const r = u as Record<string, unknown>;
                        const id = Number(r.id ?? 0);
                        const login = String(r.login ?? r.nome ?? '');
                        const nome = String(r.nome ?? '');
                        const label = login ? (nome && nome !== login ? `${login} - ${nome}` : login) : `#${id}`;
                        return { id, label };
                    })
                    .filter((o) => o.id > 0)
                    .filter((o) => !q || o.label.toLowerCase().includes(q));
                if (opts.length > 0 || q.length === 0) return opts.slice(0, 300);
            } catch { /* next */ }
        }
        return [];
    };

    const carregarTurnosDoUsuario = async (usuarioId: number) => {
        setLoadingTurnos(true);
        setNotice(null);
        try {
            let turnoIds: number[] = [];
            try {
                const res = await api.get<unknown[]>(`/api/central/turno-usuario/por-usuario?usuarioId=${usuarioId}`);
                const arr = Array.isArray(res.data) ? res.data : [];
                turnoIds = arr.map((x: unknown) => {
                    const r = x as Record<string, unknown>;
                    const v = r.turnoTrabalhoId ?? r.id_turno ?? r;
                    return Number(v as number);
                }).filter((n) => !Number.isNaN(n));
            } catch {
                const res2 = await api.get<unknown[]>(`/api/central/turno-usuario/buscar-turno-usuario?operadorId=${usuarioId}`);
                const arr2 = Array.isArray(res2.data) ? res2.data : [];
                turnoIds = arr2.map((x) => Number(x as number)).filter((n) => !Number.isNaN(n));
            }
            if (turnoIds.length === 0) { setListaTurnos([]); return; }
            let allTurnos: ApiItem[] = [];
            try {
                const resT = await api.get<ApiItem[]>('/api/central/turno-trabalho');
                allTurnos = Array.isArray(resT.data) ? resT.data : ((resT.data as unknown as { content?: ApiItem[] })?.content ?? []);
            } catch { allTurnos = []; }
            const idSet = new Set(turnoIds.map((n) => String(n)));
            const filtrados = allTurnos.filter((t) => idSet.has(String((t as unknown as Record<string, unknown>).id)));
            if (filtrados.length === 0) {
                const fetched: ApiItem[] = [];
                for (const tid of turnoIds) {
                    try { const r = await api.get<ApiItem>(`/api/central/turno-trabalho/${tid}`); fetched.push(r.data as ApiItem); }
                    catch { fetched.push({ id: tid, nome: `#${tid}` } as unknown as ApiItem); }
                }
                setListaTurnos(fetched);
            } else setListaTurnos(filtrados);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error)?.message ?? 'Erro ao carregar turnos';
            setNotice({ type: 'error', detail: msg });
        } finally { setLoadingTurnos(false); }
    };

    const handleSelectOperador = async (opt: AutoCompleteOption | null) => {
        setOperador(opt);
        setNotice(null);
        if (!opt) { setListaTurnos([]); return; }
        await carregarTurnosDoUsuario(opt.id);
    };

    const handleTurnosChange = (next: ApiItem[]) => {
        if (next.length > listaTurnos.length) {
            const added = next.find((n) => !listaTurnos.some((o) => String(asRecord(o).id) === String(asRecord(n).id)));
            if (added) {
                const rAdded = asRecord(added);
                const diaAdded = getDiaSemanaId(added);
                const inicioAdded = String(rAdded.inicio ?? '');
                const fimAdded = String(rAdded.fim ?? '');
                let num = 0; let conflito = false;
                for (const t of listaTurnos) {
                    const dia = getDiaSemanaId(t);
                    if (dia && diaAdded && dia === diaAdded) {
                        num++;
                        const rt = asRecord(t);
                        if (existeConflitoEntreHorarios(String(rt.inicio ?? ''), String(rt.fim ?? ''), inicioAdded, fimAdded)) conflito = true;
                    }
                }
                if (conflito) { setNotice({ type: 'warn', detail: 'Existe Conflito de horário entre os turnos' }); return; }
                if (num >= 2) { setNotice({ type: 'warn', detail: 'Não é possível utilizar mais de dois turnos no mesmo dia para um Operador' }); return; }
                setNotice(null);
            }
        } else if (notice?.type === 'warn') setNotice(null);
        setListaTurnos(next);
    };

    const salvar = async () => {
        if (!operador) { setNotice({ type: 'warn', detail: 'Selecione um Operador' }); return; }
        if (listaTurnos.length === 0) { setNotice({ type: 'warn', detail: 'Antes de salvar preencha os turnos de trabalho' }); return; }
        setSaving(true); setNotice(null);
        try {
            const turnoTrabalhoIds = listaTurnos.map((t) => Number((asRecord(t).id) as number)).filter((n) => !Number.isNaN(n));
            await api.post('/api/central/turno-usuario/salvar', { usuarioId: operador.id, turnoTrabalhoIds });
            setNotice({ type: 'success', detail: 'Turnos salvos com sucesso.' });
            Alert.alert('Sucesso', 'Turnos salvos com sucesso.');
            setOperador(null);
            setListaTurnos([]);
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (e as Error)?.message ?? 'Erro ao salvar';
            setNotice({ type: 'error', detail: msg });
            Alert.alert('Erro', msg);
        } finally { setSaving(false); }
    };

    const voltar = () => {
        try { (navigation as unknown as { navigate: (s: string) => void }).navigate('ViewTurnoTrabalhoListTurnoTrabalhoListScreen'); }
        catch { navigation.goBack(); }
    };

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.cabecario}>Inserir Turno Usuário</Text>
            <View style={styles.separator} />

            {notice && (
                <View style={[styles.growl, notice.type === 'error' ? styles.growlError : notice.type === 'warn' ? styles.growlWarn : notice.type === 'success' ? styles.growlSuccess : styles.growlInfo]}>
                    <Text style={styles.growlText}>{notice.detail}</Text>
                </View>
            )}

            <View style={styles.divForm}>
                <Text style={styles.formTitle}>Turno Usuário</Text>

                <View style={styles.tableForm}>
                    <AutoComplete
                        label="Operador"
                        placeholder="Digite o login do operador..."
                        value={operador}
                        onChange={(opt) => void handleSelectOperador(opt)}
                        fetchOptions={fetchUsuarioOptions}
                        minChars={2}
                    />
                    {loadingTurnos && (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Carregando turnos do operador...</Text>
                        </View>
                    )}

                    <MasterDetail
                        label="Turno de Trabalho"
                        source={TURNO_TRABALHO_SOURCE}
                        valueKey="id"
                        searchKeys={TURNO_TRABALHO_SEARCH}
                        columns={TURNO_TRABALHO_COLUMNS}
                        items={listaTurnos}
                        onChange={handleTurnosChange}
                    />
                </View>

                <View style={styles.footer}>
                    <Pressable style={[styles.btn, styles.btnBlue]} disabled={saving} onPress={() => void salvar()}>
                        <Text style={styles.btnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
                    </Pressable>
                    <Pressable style={[styles.btn, styles.btnYellow]} onPress={voltar}>
                        <Text style={[styles.btnText, styles.btnYellowText]}>Turno Trabalho</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.bgPrimary },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
    cabecario: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
    separator: { height: 1, backgroundColor: Colors.borderLight, width: '99%', alignSelf: 'center', marginBottom: Spacing.md },
    growl: { padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.md },
    growlInfo: { backgroundColor: '#d1ecf1', borderColor: '#bee5eb' },
    growlWarn: { backgroundColor: '#fff3cd', borderColor: '#ffeeba' },
    growlError: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' },
    growlSuccess: { backgroundColor: '#d4edda', borderColor: '#c3e6cb' },
    growlText: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
    divForm: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#e0e0e0', padding: Spacing.lg },
    formTitle: { fontWeight: Typography.weights.bold, fontSize: Typography.sizes.lg, color: Colors.textPrimary, marginBottom: Spacing.md },
    tableForm: { gap: Spacing.md as unknown as number, flexDirection: 'column' as const },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm as unknown as number },
    loadingText: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginLeft: Spacing.sm },
    footer: { flexDirection: 'row', gap: Spacing.md as unknown as number, marginTop: Spacing.lg },
    btn: { borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center', flex: 1 },
    btnBlue: { backgroundColor: '#2a5a88' },
    btnYellow: { backgroundColor: '#f0c040' },
    btnText: { color: '#fff', fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.base },
    btnYellowText: { color: '#4a3a00' },
});
