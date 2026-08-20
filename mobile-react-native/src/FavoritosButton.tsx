import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listarFavoritos } from './favoritos';
import { moduleIcon } from './moduleIcons';
import { api } from './api';

const normalizeOutcome = (value: string) => value.replace(/(\.xhtml)+$/i, '').replace(/^\/+|\/+$/g, '') || 'default';

/**
 * Ícone de estrela entre o botão de Relatórios e o menu do usuário, listando os atalhos
 * favoritados pelo usuário — equivalente ao bloco <c:forEach var="favoritos"
 * items="#{usuarioLogadoController.listFavoritos}"><po:panel .../></c:forEach> de header.xhtml
 * (olimpio.zip). Não confundir com o ícone "Favoritos" do menu de usuário, que abre a tela de
 * gerenciamento (listFavoritoUsuario) — aqui é a lista de atalhos em si.
 */
export function FavoritosButton({ navigateTo }: { navigateTo: (key: string) => void }) {
  const [open, setOpen] = useState(false);

  const list = useQuery({
    queryKey: ['favoritos', 'usuarioLogado'],
    queryFn: listarFavoritos,
    enabled: open,
  });

  const items = list.data ?? [];

  const handleItemPress = (outcome: string) => {
    setOpen(false);
    navigateTo(normalizeOutcome(outcome));
  };

  const handleRemoveFavorite = async (outcome: string) => {
    setOpen(false);
    try {
      await api.delete(`/api/basico/favorito-usuario`, {
        params: { outcome },
      });
      await listarFavoritos();
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };

  return (
    <>
      <Pressable style={styles.iconButton} onPress={() => setOpen(true)}>
        <Text style={styles.icon}>⭐</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Favoritos</Text>
              <Pressable onPress={() => { setOpen(false); navigateTo('view/favoritoUsuario/listFavoritoUsuario'); }}>
                <Text style={styles.manageLink}>Gerenciar</Text>
              </Pressable>
            </View>
            {list.isLoading && items.length === 0 ? (
              <Text style={styles.empty}>Carregando...</Text>
            ) : items.length === 0 ? (
              <Text style={styles.empty}>Nenhum favorito cadastrado.</Text>
            ) : (
              items.map((item, index) => (
                <TouchableWithoutFeedback key={`${item.outcome}-${index}`} style={styles.item} onPress={() => handleItemPress(item.outcome)}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemIcon}>{moduleIcon(item.nome, item.icon)}</Text>
                    <Text style={styles.itemNome}>{item.nome}</Text>
                  </View>
                  <Pressable style={styles.removeButton} onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(item.outcome);
                  }}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </Pressable>
                </TouchableWithoutFeedback>
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
  overlay: { flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.4)', paddingTop: 60, paddingHorizontal: 16 },
  dropdown: { 
    backgroundColor: '#ffffff', 
    borderRadius: 14, 
    padding: 12, 
    maxHeight: '70%',
    shadowColor: '#1d2025',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(194, 170, 60, 0.15)',
  },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownTitle: { fontSize: 15, fontWeight: '600', color: '#1d2025' },
  manageLink: { fontSize: 12, color: '#265a88', fontWeight: '500' },
  empty: { color: '#888', fontSize: 13, paddingVertical: 8, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  itemNome: { fontSize: 14, color: '#1d2025' },
  itemContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  removeButton: { position: 'absolute', right: 8, top: 8 },
  removeIcon: { fontSize: 12, color: '#e74c3c' },
});
