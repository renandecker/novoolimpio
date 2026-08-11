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
import { listActions, executeAction } from './actions';
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

export function ModuleList({ path, title }: { path: string; title?: string }) {
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

  const screenTitle = title ?? (resource ? toTitle(resource) : toTitle(feature) || 'Lista');

  const canCreate = can(session, 'CREATE', outcome);
  const canUpdate = can(session, 'UPDATE', outcome);
  const canDelete = can(session, 'DELETE', outcome);
  const canExecute = can(session, 'EXECUTE', outcome);

  const q = useModulePaged(path, page, size);
  const items = q.data?.content ?? [];
  const totalElements = q.data?.totalElements ?? 0;
  const totalPages = Math.max(1, q.data?.totalPages ?? 0);

  const catalogQuery = useQuery({
    queryKey: ['actions-catalog', 'basico'],
    queryFn: async () => (await listActions('basico')).data,
    enabled: canExecute,
  });
  const customActions = useMemo(() => (catalogQuery.data ?? {})[feature] ?? [], [catalogQuery.data, feature]);

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
                {customActions.map((action) => (
                  <Pressable
                    key={action}
                    style={styles.rowButton}
                    disabled={runningAction === action}
                    onPress={() => runAction(action, item)}
                  >
                    <Text style={styles.rowButtonText}>{runningAction === action ? '…' : toTitle(action)}</Text>
                  </Pressable>
                ))}
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
          <View style={styles.sizeOptionsBox}>
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
          </View>
        </Pressable>
      </Modal>

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <RecordModal
          title={modal?.mode === 'edit' ? `Editar ${entityTitle} #${modal.item.id}` : `Novo ${entityTitle}`}
          fields={fields}
          initial={modal?.mode === 'edit' ? asRecord(modal.item) : {}}
          submitLabel="Salvar"
          onCancel={() => setModal(null)}
          onSubmit={(values) => (modal?.mode === 'edit' ? saveEdit(modal.item, values) : saveCreate(values))}
        />
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
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>{title}</Text>
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
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.saveButton]} onPress={() => onSubmit(values)}>
            <Text style={styles.modalButtonText}>{submitLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2b2b2b' },
  primaryButton: { backgroundColor: '#2a5a88', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  notice: { backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0e0a0', borderRadius: 4, padding: 8, marginBottom: 8, color: '#7a5c00' },
  empty: { textAlign: 'center', color: '#888', marginTop: 24 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { fontSize: 16, color: '#2b2b2b', flexShrink: 1, marginRight: 8 },
  rowId: { fontSize: 12, color: '#999' },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  rowButton: { backgroundColor: '#eef1f5', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, marginTop: 4 },
  dangerButton: { backgroundColor: '#fdecea' },
  rowButtonText: { color: '#2a5a88', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#a61b29', fontSize: 15, fontWeight: '700' },
  errorDetail: { color: '#888', fontSize: 13, marginTop: 6, textAlign: 'center' },
  paginator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  pageButton: { backgroundColor: '#eef1f5', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8 },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: '#2a5a88', fontSize: 13, fontWeight: '700' },
  pageInfo: { fontSize: 12, color: '#666', flexShrink: 1, textAlign: 'center', marginHorizontal: 6 },
  sizeSelector: { alignSelf: 'flex-end', marginTop: 8 },
  sizeSelectorText: { color: '#2a5a88', fontSize: 13, fontWeight: '600' },
  sizeOptionsBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 8, marginHorizontal: 40 },
  sizeOption: { paddingVertical: 10, paddingHorizontal: 12 },
  sizeOptionText: { fontSize: 15, color: '#2b2b2b' },
  sizeOptionTextActive: { color: '#2a5a88', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: 16, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2b2b2b', marginBottom: 10 },
  modalScroll: { flexGrow: 0 },
  modalEmpty: { color: '#888', marginBottom: 12 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#616161', marginBottom: 3 },
  fieldInput: { borderWidth: 1, borderColor: '#c9c9c9', borderRadius: 4, padding: 8, fontSize: 15, color: '#2b2b2b', backgroundColor: '#ffffff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  modalButton: { borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: '#e0e0e0' },
  saveButton: { backgroundColor: '#2a5a88' },
  modalButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
