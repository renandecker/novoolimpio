import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View, TouchableWithoutFeedback} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {listarFavoritos} from './favoritos';
import {moduleIcon} from './moduleIcons';
import {api} from './api';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

const normalizeOutcome = (value: string) => value.replace(/(\.xhtml)+$/i, '').replace(/^\/+|\/+$/g, '') || 'default';

/**
 * Ícone de estrela entre o botão de Relatórios e o menu do usuário, listando os atalhos
 * favoritados pelo usuário — equivalente ao bloco <c:forEach var="favoritos"
 * items="#{usuarioLogadoController.listFavoritos}"><po:panel .../></c:forEach> de header.xhtml
 * (olimpio.zip). Não confundir com o ícone "Favoritos" do menu de usuário, que abre a tela de
 * gerenciamento (listFavoritoUsuario) — aqui é a lista de atalhos em si.
 */
export function FavoritosButton({navigateTo}: { navigateTo: (key: string) => void }) {
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
                params: {outcome},
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
                    <View style={styles.dropdown}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Favoritos</Text>
                            <Pressable onPress={() => {
                                setOpen(false);
                                navigateTo('view/favoritoUsuario/listFavoritoUsuario');
                            }}>
                                <Text style={styles.manageLink}>Gerenciar</Text>
                            </Pressable>
                        </View>
                        {list.isLoading && items.length === 0 ? (
                            <Text style={styles.empty}>Carregando...</Text>
                        ) : items.length === 0 ? (
                            <Text style={styles.empty}>Nenhum favorito cadastrado.</Text>
                        ) : (
                            items.map((item, index) => (
                                <TouchableWithoutFeedback key={`${item.outcome}-${index}`} onPress={() => handleItemPress(item.outcome)}>
                                    <View style={styles.item}>
                                        <View style={styles.itemIconContainer}>
                                            <Text style={styles.itemIcon}>{moduleIcon(item.nome, item.icon)}</Text>
                                        </View>
                                        <Text style={styles.itemNome}>{item.nome}</Text>
                                        <Pressable style={styles.removeButton} onPress={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavorite(item.outcome);
                                        }}>
                                            <Text style={styles.removeIcon}>✕</Text>
                                        </Pressable>
                                    </View>
                                </TouchableWithoutFeedback>
                            ))
                        )}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        marginRight: Spacing.sm,
        padding: Spacing.xs,
    },
    icon: {
        fontSize: Typography.sizes.xxxl,
    },
    overlay: {
        flex: 1,
        backgroundColor: Colors.modalOverlay,
        paddingTop: Layout.headerHeight + Spacing.md,
        paddingHorizontal: Spacing.lg,
        justifyContent: 'flex-start',
    },
    dropdown: {
        backgroundColor: Colors.dropdownBg,
        borderRadius: BorderRadius.xxl,
        padding: Spacing.md,
        maxHeight: '70%',
        ...Shadows.large,
        borderWidth: 1,
        borderColor: Colors.dropdownBorder,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dropdownHeaderBorder,
    },
    dropdownTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    manageLink: {
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
        fontWeight: Typography.weights.medium,
    },
    empty: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        paddingVertical: Spacing.lg,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
    },
    itemIconContainer: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.goldBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    itemIcon: {
        fontSize: Typography.sizes.xxxl,
    },
    itemNome: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        flex: 1,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    removeButton: {
        padding: Spacing.xs,
    },
    removeIcon: {
        fontSize: Typography.sizes.sm,
        color: Colors.error,
    },
});