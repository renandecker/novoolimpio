import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../theme';

/**
 * Tela mobile /view/tipoPausa/formTipoPausa
 * Replica formTipoPausa.xhtml panelGrid:
 *  p:panelGrid 26% div_form + table_form 2 cols
 *  Id disabled | Descrição * 3-255 | Tempo pausa (segundos) * int
 * Usa /api/view/tipoPausa/formTipoPausa (mesma tabela cen_tipo_pausa via ViewService)
 * mas também compatível com /api/view/tipoPausa/listTipoPausa
 */
const PATH = '/api/view/tipoPausa/formTipoPausa';
const LIST_PATH = '/api/view/tipoPausa/listTipoPausa';

export default function ViewTipoPausaFormTipoPausaListScreen() {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const editingId: number | null = route.params?.id ?? null;

  const [descricao, setDescricao] = useState('');
  const [tempo, setTempo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingId == null) return;
    setLoading(true);
    // tenta form e fallback list
    const tryFetch = async () => {
      try {
        const res: any = await api.get(`${LIST_PATH}/${editingId}`);
        const row = res.data ?? {};
        setDescricao(String(row.descricao ?? ''));
        setTempo(String(row.qtde_tempo ?? row.tempo ?? row.qtdeTempo ?? ''));
      } catch (e: any) {
        setError(e?.response?.data?.error ?? 'Erro ao carregar.');
      } finally { setLoading(false); }
    };
    tryFetch();
  }, [editingId]);

  const handleTempo = (v: string) => setTempo(v.replace(/[^\d-]/g, '').replace(/(?!^)-/g, ''));

  const validate = (): string | null => {
    const d = descricao.trim();
    if (!d) return 'Descrição é obrigatória.';
    if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';
    if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';
    const t = tempo.trim();
    if (!t) return 'Insira o tempo intervalo';
    if (!/^-?\d+$/.test(t)) return 'Tempo pausa deve ser um inteiro';
    if (Number(t) < 0) return 'Tempo pausa deve ser positivo';
    return null;
  };

  const handleSave = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    const body = { descricao: descricao.trim(), qtde_tempo: Number(tempo.trim()), tempo: Number(tempo.trim()) };
    try {
      if (editingId != null) await api.put(`${LIST_PATH}/${editingId}`, body);
      else await api.post(LIST_PATH, body);
      setSuccess(editingId != null ? 'Atualizado com sucesso.' : 'Criado com sucesso.');
      setTimeout(() => navigation.goBack(), 700);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{editingId != null ? `Editar Tipo Pausa #${editingId}` : 'Novo Tipo Pausa'}</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}><Text style={styles.backText}>Voltar</Text></Pressable>
      </View>

      <View style={styles.separator} />

      {!!error && <View style={styles.errBox}><Text style={styles.errText}>{error}</Text></View>}
      {!!success && <View style={styles.okBox}><Text style={styles.okText}>{success}</Text></View>}
      {loading && <ActivityIndicator color={Colors.primary} />}

      <View style={styles.divForm}>
        <View style={styles.tableForm}>
          <View style={styles.formRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Id</Text>
              <TextInput style={[styles.input, styles.inputTiny]} value={editingId != null ? String(editingId) : ''} editable={false} placeholder="(novo)" />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Descrição <Text style={styles.req}>*</Text></Text>
              <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} maxLength={255} placeholder="Ex.: Almoço" />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Tempo pausa (segundos) <Text style={styles.req}>*</Text></Text>
              <TextInput style={styles.input} value={tempo} onChangeText={handleTempo} keyboardType="number-pad" placeholder="900" />
            </View>
          </View>
          <Text style={styles.hint}>Descrição 3-255 caracteres · Tempo inteiro obrigatório (Insira o tempo intervalo)</Text>
        </View>

        <View style={styles.footer}>
          <Pressable style={[styles.btn, styles.btnBack]} onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.btnBackText}>Cancelar</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={saving || loading}>
            <Text style={styles.btnSaveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary, flex: 1, marginRight: 8 },
  backBtn: { backgroundColor: Colors.bgPrimary, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: Colors.textSecondary, fontWeight: Typography.weights.semibold },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
  errBox: { backgroundColor: '#FDE8E8', borderWidth: 1, borderColor: '#F5C2C2', borderRadius: 8, padding: 10, marginBottom: 12 },
  errText: { color: '#8A1F1F' },
  okBox: { backgroundColor: '#E6F4EA', borderWidth: 1, borderColor: '#B7E1C6', borderRadius: 8, padding: 10, marginBottom: 12 },
  okText: { color: '#1E4620' },
  divForm: { backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: 12, padding: 16, ...Shadows.medium },
  tableForm: { gap: 12 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.sm },
  fieldHalf: { width: '47%' },
  label: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs },
  req: { color: '#C90000' },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.lg, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary },
  inputTiny: { flex: 0, width: 90, backgroundColor: '#f3f4f6' },
  inputLarge: {},
  hint: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  btn: { borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  btnBack: { backgroundColor: Colors.bgPrimary, borderWidth: 1, borderColor: Colors.borderMedium },
  btnBackText: { color: Colors.textSecondary, fontWeight: Typography.weights.semibold },
  btnSave: { backgroundColor: Colors.primary, ...Shadows.gold },
  btnSaveText: { color: Colors.textWhite, fontWeight: Typography.weights.semibold },
});
