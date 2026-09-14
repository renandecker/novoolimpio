import React, { useMemo, useState } from 'react';
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
import {Alert} from '../../../shared/components/SweetAlert';
import { useQuery } from '@tanstack/react-query';
import { useModulePaged } from '../useModulePaged';
import { api } from '../api';
import { can } from '../permissions';
import { useAuth } from '../auth';
import type { ApiItem, SearchFilterRequest } from '../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../theme';
import { ModuleFilter } from '../../shared/components/ModuleFilter';
import { useNavigation } from '@react-navigation/native';

/**
 * Tela mobile /view/tipoPausa/listTipoPausa
 * Replica po:crud listTipoPausa.xhtml:
 *  - Id | Descrição (60%) | Tempo pausa (segundos) (25%)
 *  - Usa /api/view/tipoPausa/listTipoPausa (ViewService -> cen_tipo_pausa)
 *  - Suporta alias qtde_tempo / tempo
 */

const PATH = '/api/view/tipoPausa/listTipoPausa';
const FORM_ROUTE = 'ViewTipoPausaFormTipoPausa';

const apiErrorMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: string } } })?.response?.data?.error
  ?? (error as Error)?.message
  ?? 'erro desconhecido';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const getTempo = (item: ApiItem): string => {
  const r: any = asRecord(item);
  const v = r.qtde_tempo ?? r.tempo ?? r.qtdeTempo ?? '';
  return v === null || v === undefined ? '' : String(v);
};

export default function ViewTipoPausaListTipoPausaListScreen() {
  const { session } = useAuth();
  const navigation: any = useNavigation();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState<null | { mode: 'create' } | { mode: 'edit'; item: ApiItem } | { mode: 'delete'; item: ApiItem }>(null);
  const [descricao, setDescricao] = useState('');
  const [tempo, setTempo] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});

  const COLUMN_FIELDS = ['descricao', 'tempo'] as const;

  const q = useModulePaged(PATH, page, size, undefined, filterParams);
  const items = q.data?.content ?? [];
  const totalPages = Math.max(1, q.data?.totalPages ?? 0);
  const totalElements = q.data?.totalElements ?? 0;

  const openCreate = () => {
    setDescricao('');
    setTempo('');
    setModal({ mode: 'create' });
  };
  const openEdit = (item: ApiItem) => {
    const r: any = asRecord(item);
    setDescricao(String(r.descricao ?? ''));
    setTempo(getTempo(item));
    setModal({ mode: 'edit', item });
  };

  const validate = (): string | null => {
    const d = descricao.trim();
    if (!d) return 'Descrição é obrigatória.';
    if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';
    if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';
    const t = tempo.trim();
    if (!t) return 'Insira o tempo intervalo';
    if (!/^-?\d+$/.test(t)) return 'Tempo pausa deve ser um inteiro';
    return null;
  };

  const handleTempo = (v: string) => {
    // p:keyFilter mask="int"
    const f = v.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '');
    setTempo(f);
  };

  const doCreate = async () => {
    const msg = validate();
    if (msg) { setNotice(msg); return; }
    setSaving(true);
    try {
      await api.post(PATH, { descricao: descricao.trim(), qtde_tempo: Number(tempo.trim()), tempo: Number(tempo.trim()) });
      setNotice('Tipo Pausa criado com sucesso.');
      setModal(null);
      q.refetch();
    } catch (e) { setNotice(`Erro ao criar: ${apiErrorMessage(e)}`); }
    finally { setSaving(false); }
  };

  const doEdit = async () => {
    if (!modal || modal.mode !== 'edit') return;
    const msg = validate();
    if (msg) { setNotice(msg); return; }
    setSaving(true);
    try {
      await api.put(`${PATH}/${modal.item.id}`, { descricao: descricao.trim(), qtde_tempo: Number(tempo.trim()), tempo: Number(tempo.trim()) });
      setNotice('Tipo Pausa atualizado com sucesso.');
      setModal(null);
      q.refetch();
    } catch (e) { setNotice(`Erro ao salvar: ${apiErrorMessage(e)}`); }
    finally { setSaving(false); }
  };

  const doDelete = async (item: ApiItem) => {
    try {
      await api.delete(`${PATH}/${item.id}`);
      setNotice(`Registro #${item.id} excluído.`);
      q.refetch();
    } catch (e) { setNotice(`Erro ao excluir: ${apiErrorMessage(e)}`); }
  };

  if (q.isLoading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }
  if (q.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
        <Text style={styles.errorDetail}>{apiErrorMessage(q.error)}</Text>
      </View>
    );
  }

  const canCreate = can(session, 'CREATE', 'view/tipoPausa/listTipoPausa');
  const canUpdate = can(session, 'UPDATE', 'view/tipoPausa/listTipoPausa');
  const canDelete = can(session, 'DELETE', 'view/tipoPausa/listTipoPausa');

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Tipo Pausa</Text>
        <ModuleFilter columns={[...COLUMN_FIELDS]} value={filterParams} onChange={setFilterParams} />
        {canCreate && (
          <Pressable style={styles.primaryButton} onPress={openCreate}>
            <Text style={styles.primaryButtonText}>Novo</Text>
          </Pressable>
        )}
      </View>

      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      {/* cabeçalho po:crud: Id | Descrição | Tempo */}
      <View style={styles.tableHead}>
        <Text style={[styles.th, { flex: 0.5 }]}>Id</Text>
        <Text style={[styles.th, { flex: 2 }]}>Descrição</Text>
        <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Tempo (s)</Text>
        <Text style={[styles.th, { width: 96, textAlign: 'center' }]}>Ações</Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>Nenhum registro encontrado.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshing={q.isFetching}
          onRefresh={() => q.refetch()}
          renderItem={({ item }) => {
            const r: any = asRecord(item);
            return (
              <View style={styles.row}>
                <Text style={[styles.cell, { flex: 0.5, color: Colors.textLight }]}>#{item.id}</Text>
                <Text style={[styles.cell, { flex: 2 }]} numberOfLines={2}>{String(r.descricao ?? '')}</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'right' }]}>{getTempo(item)}</Text>
                <View style={styles.rowActions}>
                  {canUpdate && (
                    <Pressable style={styles.rowBtn} onPress={() => openEdit(item)}>
                      <Text style={styles.rowBtnText}>Editar</Text>
                    </Pressable>
                  )}
                  {canDelete && (
                    <Pressable
                      style={[styles.rowBtn, styles.dangerBtn]}
                      onPress={() =>
                        Alert.alert('Excluir', `Excluir #${item.id}?`, [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Excluir', style: 'destructive', onPress: () => doDelete(item) },
                        ])
                      }
                    >
                      <Text style={styles.rowBtnText}>Excluir</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.paginator}>
        <Pressable style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]} disabled={page === 0} onPress={() => setPage((p) => Math.max(0, p - 1))}>
          <Text style={styles.pageBtnText}>Anterior</Text>
        </Pressable>
        <Text style={styles.pageInfo}>Pág {page + 1} de {totalPages} · {totalElements} regs</Text>
        <Pressable style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]} disabled={page >= totalPages - 1} onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
          <Text style={styles.pageBtnText}>Próxima</Text>
        </Pressable>
      </View>

      {/* Modal criar/editar: replica formTipoPausa.xhtml inputs com validação 3-255 e int */}
      <Modal visible={modal !== null && (modal as any).mode !== 'delete'} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.overlay} onPress={() => setModal(null)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modal?.mode === 'edit' ? `Editar #${(modal as any).item.id}` : 'Novo Tipo Pausa'}</Text>
              <Pressable style={styles.closeBtn} onPress={() => setModal(null)}><Text style={styles.closeText}>✕</Text></Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {modal?.mode === 'edit' && (
                <View style={styles.field}>
                  <Text style={styles.label}>Id</Text>
                  <TextInput style={[styles.input, { backgroundColor: '#f3f4f6' }]} value={String((modal as any).item.id)} editable={false} />
                </View>
              )}
              <View style={styles.formRow}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Descrição <Text style={{ color: '#C90000' }}>*</Text></Text>
                  <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} maxLength={255} placeholder="Ex.: Almoço" />
                  <Text style={styles.hint}>3 a 255 caracteres (f:validateLength)</Text>
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Tempo pausa (segundos) <Text style={{ color: '#C90000' }}>*</Text></Text>
                  <TextInput style={styles.input} value={tempo} onChangeText={handleTempo} keyboardType="number-pad" placeholder="Ex.: 900" />
                  <Text style={styles.hint}>Inteiro — p:keyFilter mask=&quot;int&quot; · obrigatório &quot;Insira o tempo intervalo&quot;</Text>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModal(null)}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={modal?.mode === 'edit' ? doEdit : doCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bgPrimary, padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  title: { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, ...Shadows.gold },
  primaryButtonText: { color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  notice: { backgroundColor: Colors.warningBg, borderWidth: 1, borderColor: Colors.goldBg, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, color: Colors.goldText },
  tableHead: { flexDirection: 'row', backgroundColor: Colors.headerStart, paddingVertical: 8, paddingHorizontal: 8, borderRadius: BorderRadius.md, marginBottom: 4 },
  th: { color: Colors.textWhite, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.sm },
  empty: { textAlign: 'center', color: Colors.textLight, marginTop: Spacing.xl, fontSize: Typography.sizes.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: Colors.borderLight },
  cell: { fontSize: Typography.sizes.base, color: Colors.textPrimary },
  rowActions: { flexDirection: 'row', width: 96, justifyContent: 'flex-end', gap: 6 },
  rowBtn: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, paddingHorizontal: 8, paddingVertical: 4 },
  dangerBtn: { backgroundColor: Colors.errorBg },
  rowBtnText: { color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  paginator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderColor: Colors.borderLight },
  pageBtn: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: Colors.primary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
  pageInfo: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  errorText: { color: Colors.error, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold, textAlign: 'center' },
  errorDetail: { color: Colors.textLight, fontSize: Typography.sizes.base, marginTop: Spacing.xs, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: Colors.modalOverlay, justifyContent: 'center', padding: Spacing.lg },
  modalBox: { backgroundColor: Colors.bgSecondary, borderRadius: BorderRadius.xxl, maxHeight: '85%', ...Shadows.modal, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderGold },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.headerStart, borderBottomWidth: 3, borderBottomColor: Colors.gold },
  modalTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.semibold, color: Colors.textWhite },
  closeBtn: { width: 36, height: 36, borderRadius: BorderRadius.lg, backgroundColor: Colors.modalCloseBg, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: Colors.modalCloseColor, fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.medium },
  modalScroll: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  field: { marginBottom: Spacing.md },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  fieldHalf: { width: '47%' },
  label: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs },
  hint: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: 4 },
  input: { borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.lg, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  modalBtn: { borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  cancelBtn: { backgroundColor: Colors.bgPrimary, borderWidth: 1, borderColor: Colors.borderMedium },
  cancelText: { color: Colors.textSecondary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  saveBtn: { backgroundColor: Colors.primary, ...Shadows.gold },
  saveText: { color: Colors.textWhite, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
});
