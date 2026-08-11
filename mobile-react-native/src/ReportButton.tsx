import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listarRelatoriosDisponiveis, type RelatorioDisponivel } from './relatorios';

const TIPO_ROTA: Record<string, string> = {
  TABELA: 'view/relatorios/listTabela',
  GRAFICO: 'view/relatorios/listGrafico',
  MAPA: 'view/relatorios/listMapa',
};

const TIPO_LABEL: Record<string, string> = {
  TABELA: 'Tabela',
  GRAFICO: 'Gráfico',
  MAPA: 'Mapa',
};

export function ReportButton({ navigateTo }: { navigateTo: (key: string) => void }) {
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['relatorios', 'disponiveis'],
    queryFn: listarRelatoriosDisponiveis,
    enabled: open,
  });

  const items = list.data ?? [];

  const handleItemPress = (item: RelatorioDisponivel) => {
    setOpen(false);
    navigateTo(TIPO_ROTA[item.tipo] ?? 'view/relatorios/listTabela');
  };

  return (
    <>
      <Pressable style={styles.iconButton} onPress={() => setOpen(true)}>
        <Text style={styles.icon}>📊</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.dropdownTitle}>Relatórios</Text>
            {list.isLoading && items.length === 0 ? (
              <Text style={styles.empty}>Carregando...</Text>
            ) : items.length === 0 ? (
              <Text style={styles.empty}>Nenhum relatório disponível.</Text>
            ) : (
              items.map((item) => (
                <Pressable key={`${item.tipo}-${item.id}`} style={styles.item} onPress={() => handleItemPress(item)}>
                  <Text style={styles.itemTipo}>{TIPO_LABEL[item.tipo] ?? item.tipo}</Text>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                </Pressable>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: { marginRight: 8, padding: 6 },
  icon: { fontSize: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', paddingTop: 70, paddingHorizontal: 16 },
  dropdown: { backgroundColor: '#ffffff', borderRadius: 10, padding: 12, maxHeight: '70%' },
  dropdownTitle: { fontSize: 14, fontWeight: '700', color: '#2b2b2b', marginBottom: 8 },
  empty: { color: '#888', fontSize: 13, paddingVertical: 8 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemTipo: { fontSize: 10, fontWeight: '700', color: '#2a5a88', textTransform: 'uppercase' },
  itemNome: { fontSize: 14, color: '#2b2b2b', marginTop: 2 },
});
