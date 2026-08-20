import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PAGE_SIZES, useModulePaged } from './useModulePaged';
import { executeAction } from './actions';
import { can } from './permissions';
import { useAuth } from './auth';
import type { ApiItem } from './types';

const PREFERRED_LABELS = ['nome', 'descricao', 'razao_social', 'nome_fantasia', 'username', 'titulo', 'rotulo', 'sigla', 'sobrenome', 'login', 'uf', 'tema'];

const toTitle = (value: string) =>
  value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/^_/, '')
    .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const primaryLabel = (item: ApiItem) => {
  const record = asRecord(item);
  for (const key of PREFERRED_LABELS) {
    const value = record[key];
    if (value !== null && value !== undefined && String(value) !== '') return String(value);
  }
  for (const key of Object.keys(record)) {
    if (key.endsWith('_descricao')) {
      const value = record[key];
      if (value !== null && value !== undefined && String(value) !== '') return String(value);
    }
  }
  for (const key of Object.keys(record)) {
    if (key !== 'id' && key !== 'dadosJson') return String(record[key] ?? '');
  }
  return `#${item.id}`;
};

const editableFields = (item: ApiItem | null) => {
  if (!item) return ['nome'];
  return Object.keys(asRecord(item)).filter((key) => key !== 'id' && key !== 'dadosJson');
};

const apiErrorMessage = (error: unknown) =>
  (error as { response?: { data?: { error?: string } } })?.response?.data?.error
  ?? (error as Error)?.message
  ?? 'erro desconhecido';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: ApiItem }
  | null;

export function ModuleList({
  path,
  title,
  params,
}: {
  path: string;
  title?: string;
  params?: Record<string, string | number | boolean | undefined>;
}) {
  const { session } = useAuth();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZES[0]);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState('');
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const segments = path.split('/').filter(Boolean);
  const feature = segments[2] ?? '';
  const resource = segments[3] ?? '';
  const outcome = feature && resource ? `view/${feature}/${resource}` : '';
  const entityTitle = toTitle(resource.replace(/^(form|list|colunas)/i, '') || resource);

  // Espelha o pedido de remover o prefixo "List " dos títulos das telas: o nome do recurso
  // (ex.: "listAcao") não deve aparecer como "List Acao" para o usuário.
  const screenTitle = title ?? (resource ? entityTitle : toTitle(feature) || 'Lista');

  const canCreate = can(session, 'CREATE', outcome);
  const canUpdate = can(session, 'UPDATE', outcome);
  const canDelete = can(session, 'DELETE', outcome);
  const canExecute = can(session, 'EXECUTE', outcome);

  const q = useModulePaged(path, page, size, params);
  const items = q.data?.content ?? [];
  const totalElements = q.data?.totalElements ?? 0;
  const totalPages = Math.max(1, q.data?.totalPages ?? 0);

  

  const runAction = (action: string, item: ApiItem) => {
    setRunningAction(action);
    setNotice('');
    executeAction(feature, action, outcome, JSON.stringify({ id: item.id }))
      .then(() => {
        setNotice(`Ação "${toTitle(action)}" executada no registro ${item.id}.`);
        q.refetch();
      })
      .catch((error) => setNotice(`Falha ao executar "${toTitle(action)}": ${apiErrorMessage(error)}`))
      .finally(() => setRunningAction(null));
  };

  const fields = useMemo(
    () => (modal?.mode === 'edit' ? editableFields(modal.item) : editableFields(items[0] ?? null)),
    [modal, items],
  );

  const saveCreate = (values: Record<string, unknown>) => {
    q.create.mutate({ nome: 'Novo registro', ...values } as unknown as ApiItem, {
      onError: (error) => setNotice(`Erro ao criar: ${apiErrorMessage(error)}`),
    });
    setModal(null);
  };

  const saveEdit = (item: ApiItem, values: Record<string, unknown>) => {
    q.update.mutate({ id: item.id, body: { nome: asRecord(item).nome ?? primaryLabel(item), ...values } as unknown as ApiItem }, {
      onError: (error) => setNotice(`Erro ao salvar: ${apiErrorMessage(error)}`),
    });
    setModal(null);
  };

  const confirmDelete = (item: ApiItem) => {
    q.remove.mutate(item.id, { onError: (error) => setNotice(`Erro ao excluir: ${apiErrorMessage(error)}`) });
  };

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (q.isError) {
    const message = apiErrorMessage(q.error);
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro ao carregar os dados.</Text>
        {message ? <Text style={styles.errorDetail}>{message}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{screenTitle}</Text>
        {canCreate && (
          <Pressable style={styles.primaryButton} onPress={() => setModal({ mode: 'create' })}>
            <Text style={styles.primaryButtonText}>Novo</Text>
          </Pressable>
        )}
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {items.length === 0 ? (
        <Text style={styles.empty}>Nenhum registro encontrado.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshing={q.isFetching}
          onRefresh={() => q.refetch()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowText}>{primaryLabel(item)}</Text>
                <Text style={styles.rowId}>#{item.id}</Text>
              </View>
              <View style={styles.rowActions}>
                {canUpdate && (
                  <Pressable style={styles.rowButton} onPress={() => setModal({ mode: 'edit', item })}>
                    <Text style={styles.rowButtonText}>Editar</Text>
                  </Pressable>
                )}
                {canDelete && (
                  <Pressable
                    style={[styles.rowButton, styles.dangerButton]}
                    onPress={() =>
                      Alert.alert('Excluir registro', `Deseja realmente excluir o registro #${item.id}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Excluir', style: 'destructive', onPress: () => confirmDelete(item) },
                      ])
                    }
                  >
                    <Text style={styles.rowButtonText}>Excluir</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.paginator}>
        <Pressable
          style={[styles.pageButton, (page === 0 || q.isFetching) && styles.pageButtonDisabled]}
          disabled={page === 0 || q.isFetching}
          onPress={() => setPage((current) => Math.max(0, current - 1))}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </Pressable>
        <Text style={styles.pageInfo}>
          Página {page + 1} de {totalPages} · Total: {totalElements}
        </Text>
        <Pressable
          style={[styles.pageButton, (page >= totalPages - 1 || q.isFetching) && styles.pageButtonDisabled]}
          disabled={page >= totalPages - 1 || q.isFetching}
          onPress={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
        >
          <Text style={styles.pageButtonText}>Próxima</Text>
        </Pressable>
      </View>
      <Pressable style={styles.sizeSelector} onPress={() => setSizePickerOpen(true)}>
        <Text style={styles.sizeSelectorText}>{size} por página ▾</Text>
      </Pressable>

      <Modal visible={sizePickerOpen} transparent animationType="fade" onRequestClose={() => setSizePickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSizePickerOpen(false)}>
          <Pressable style={styles.sizeOptionsBox} onPress={(e) => e.stopPropagation()}>
            {PAGE_SIZES.map((option) => (
              <Pressable
                key={option}
                style={styles.sizeOption}
                onPress={() => {
                  setSize(option);
                  setPage(0);
                  setSizePickerOpen(false);
                }}
              >
                <Text style={[styles.sizeOptionText, option === size && styles.sizeOptionTextActive]}>
                  {option} registros por página
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModal(null)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <RecordModal
              title={modal?.mode === 'edit' ? `Editar ${entityTitle} #${modal.item.id}` : `Novo ${entityTitle}`}
              fields={fields}
              initial={modal?.mode === 'edit' ? asRecord(modal.item) : {}}
              submitLabel="Salvar"
              onCancel={() => setModal(null)}
              onSubmit={(values) => (modal?.mode === 'edit' ? saveEdit(modal.item, values) : saveCreate(values))}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function RecordModal({
  title,
  fields,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  title: string;
  fields: string[];
  initial: Record<string, unknown>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const copy: Record<string, string> = {};
    for (const field of fields) {
      const value = initial[field];
      copy[field] = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
    }
    return copy;
  });

  return (
    <View style={styles.recordModalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Pressable style={styles.closeBtn} onPress={onCancel} accessibilityLabel="Fechar">
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.modalScroll}>
        {fields.length === 0 ? (
          <Text style={styles.modalEmpty}>Nenhum campo disponível para edição.</Text>
        ) : (
          fields.map((field) => (
            <View key={field} style={styles.field}>
              <Text style={styles.fieldLabel}>{toTitle(field)}</Text>
              <TextInput
                style={styles.fieldInput}
                value={values[field] ?? ''}
                onChangeText={(text) => setValues((prev) => ({ ...prev, [field]: text }))}
              />
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.modalActions}>
        <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.modalButton, styles.saveButton]} onPress={() => onSubmit(values)}>
          <Text style={styles.modalButtonText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1d2025' },
  primaryButton: { backgroundColor: '#2a5a88', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, shadowColor: '#2a5a88', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  notice: { backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0e0a0', borderRadius: 8, padding: 10, marginBottom: 8, color: '#7a5c00' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24, fontSize: 14 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { fontSize: 16, color: '#1d2025', flexShrink: 1, marginRight: 8 },
  rowId: { fontSize: 12, color: '#999' },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  rowButton: { backgroundColor: 'rgba(51, 122, 183, 0.08)', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginTop: 4 },
  dangerButton: { backgroundColor: '#fff0f0' },
  rowButtonText: { color: '#265a88', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#a61b29', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  errorDetail: { color: '#888', fontSize: 13, marginTop: 6, textAlign: 'center' },
  paginator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#f0f0f0' },
  pageButton: { backgroundColor: 'rgba(51, 122, 183, 0.08)', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#265a88', fontSize: 13, fontWeight: '600' },
  pageInfo: { fontSize: 12, color: '#666', flexShrink: 1, textAlign: 'center', marginHorizontal: 6 },
  sizeSelector: { alignSelf: 'flex-end', marginTop: 8 },
  sizeSelectorText: { color: '#265a88', fontSize: 13, fontWeight: '600' },
  sizeOptionsBox: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 8, 
    marginHorizontal: 40,
    shadowColor: '#1d2025',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sizeOption: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 6 },
  sizeOptionText: { fontSize: 15, color: '#1d2025' },
  sizeOptionTextActive: { color: '#265a88', fontWeight: '600' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(29, 32, 37, 0.55)', 
    justifyContent: 'center', 
    padding: 16 
  },
  modalBox: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    maxHeight: '85%',
    shadowColor: '#1d2025',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194, 170, 60, 0.15)',
  },
  recordModalContainer: { flex: 1, backgroundColor: '#ffffff', borderRadius: 16 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2f333b',
    borderBottomWidth: 3,
    borderBottomColor: '#c2aa3c',
  },
  modalTitle: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { 
    color: '#e8d27a', 
    fontSize: 18,
    fontWeight: '500',
  },
  modalScroll: { flexGrow: 0, paddingHorizontal: 20, paddingVertical: 16 },
  modalEmpty: { color: '#888', marginBottom: 12, fontSize: 14, textAlign: 'center' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#4a4a4a', marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: '#d3d3d3', borderRadius: 8, padding: 12, fontSize: 15, color: '#1d2025', backgroundColor: '#ffffff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingHorizontal: 16, paddingBottom: 16 },
  modalButton: { borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10 },
  cancelButton: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
  cancelButtonText: { color: '#4a4a4a', fontSize: 15, fontWeight: '600' },
  saveButton: { backgroundColor: '#2a5a88', shadowColor: '#2a5a88', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
