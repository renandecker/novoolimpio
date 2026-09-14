import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {Alert} from '../../../shared/components/SweetAlert';
import { useNavigation } from '@react-navigation/native';
import { useModulePaged, PAGE_SIZES } from '../useModulePaged';
import type { ApiItem, SearchFilterRequest } from '../types';
import { ModuleFilter } from '../../shared/components/ModuleFilter';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

export default function ViewTurnoTrabalhoListTurnoTrabalhoListScreen() {
  const navigation = useNavigation<any>();
  const [page, setPage] = useState(0);
  const [size] = useState(PAGE_SIZES[0]);
  const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});

  const COLUMN_FIELDS = ['descricao', 'inicio', 'fim'] as const;

  const q = useModulePaged('/api/view/turnoTrabalho/listTurnoTrabalho', page, size, undefined, filterParams);
  const items = q.data?.content ?? [];
  const totalPages = Math.max(1, q.data?.totalPages ?? 1);

  if (q.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (q.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Erro ao carregar Turno de Trabalho.</Text>
        <Pressable style={styles.btn} onPress={() => q.refetch()}>
          <Text style={styles.btnText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ApiItem }) => {
    const r: any = asRecord(item);
    const dia = r.id_dia_semana_descricao ?? r.diaSemanaNome ?? r.diaSemana_nome ?? (r.id_dia_semana ? `#${r.id_dia_semana}` : '-');
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          #{item.id} — {String(r.descricao ?? '')}
        </Text>
        <Text style={styles.cardSub}>
          {String(r.inicio ?? '')} às {String(r.fim ?? '')} • {String(dia)}
        </Text>
        <View style={styles.cardActions}>
          <Pressable style={[styles.btn, styles.btnGreen]} onPress={() => navigation.navigate('view/turnoTrabalho/formTurnoTrabalho', { id: item.id })}>
            <Text style={styles.btnText}>Editar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnRed]}
            onPress={() =>
              Alert.alert('Excluir', `Deseja excluir #${item.id}?`, [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: () => q.remove.mutate(item.id, { onSuccess: () => q.refetch() }),
                },
              ])
            }
          >
            <Text style={styles.btnText}>Excluir</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Turno Trabalho</Text>
        <ModuleFilter columns={[...COLUMN_FIELDS]} value={filterParams} onChange={setFilterParams} />
        <View style={styles.headerActions}>
          <Pressable style={[styles.btn, styles.btnYellow]} onPress={() => navigation.navigate('view/turnoUsuario/listTurnoUsuario')}>
            <Text style={styles.btnText}>Voltar Turno Usuário</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('view/turnoTrabalho/formTurnoTrabalho')}>
            <Text style={styles.btnText}>Novo</Text>
          </Pressable>
        </View>
      </View>
      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Nenhum registro encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, gap: 10 }}
        />
      )}
      <View style={styles.pager}>
        <Pressable style={[styles.pagerBtn, page === 0 && styles.disabled]} disabled={page === 0} onPress={() => setPage((p) => Math.max(0, p - 1))}>
          <Text style={styles.pagerText}>Anterior</Text>
        </Pressable>
        <Text style={styles.pagerInfo}>
          Página {page + 1} de {totalPages}
        </Text>
        <Pressable
          style={[styles.pagerBtn, page >= totalPages - 1 && styles.disabled]}
          disabled={page >= totalPages - 1}
          onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          <Text style={styles.pagerText}>Próxima</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  error: { color: '#8A1F1F', marginBottom: 12, fontWeight: '700' },
  empty: { color: '#888', fontStyle: 'italic' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerActions: { flexDirection: 'row', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#111' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2a5a88' },
  btnYellow: { backgroundColor: '#f9c74f' },
  btnGreen: { backgroundColor: '#2e7d32' },
  btnRed: { backgroundColor: '#a61b29' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontWeight: '800', color: '#111', marginBottom: 4 },
  cardSub: { color: '#555', marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  pagerBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#2a5a88', borderRadius: 6 },
  pagerText: { color: '#fff', fontWeight: '700' },
  pagerInfo: { color: '#374151', fontWeight: '600' },
  disabled: { opacity: 0.4 },
});