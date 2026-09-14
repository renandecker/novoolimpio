import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {listarFavoritos} from './favoritos';
import {moduleIcon} from '../../moduleIcons';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../../shared/styles/theme';

const normalizeOutcome = (value: string) => value.replace(/(\.xhtml)+$/i, '').replace(/^\/+|\/+$/g, '') || 'default';

/**
 * Ícone de estrela no topo, listando os atalhos favoritados do usuário logado —
 * equivalente ao bloco <c:forEach var="favoritos"
 * items="#{usuarioLogadoController.listFavoritos}"><po:panel .../></c:forEach> de header.xhtml
 * (olimpio.zip). Apenas listagem, sem botões extras dentro do popup.
 */
export function FavoritosButton({navigateTo}: { navigateTo?: (key: string) => void }) {
    const [open, setOpen] = useState(false);
    const navigation = useNavigation<any>();

    const list = useQuery({
        queryKey: ['favoritos', 'usuarioLogado'],
        queryFn: listarFavoritos,
        enabled: open,
    });

    const items = list.data ?? [];

    const go = (key: string) => {
        if (navigateTo) {
            navigateTo(key);
        } else {
            navigation.navigate(key as never);
        }
    };

    const handleItemPress = (outcome: string) => {
        setOpen(false);
        go(normalizeOutcome(outcome));
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
                        </View>
                        {list.isLoading && items.length === 0 ? (
                            <Text style={styles.empty}>Carregando...</Text>
                        ) : items.length === 0 ? (
                            <Text style={styles.empty}>Nenhum favorito cadastrado.</Text>
                        ) : (
                            items.map((item, index) => (
                                <Pressable
                                    key={`${item.outcome}-${index}`}
                                    style={styles.item}
                                    onPress={() => handleItemPress(item.outcome)}
                                >
                                    <View style={styles.itemIconContainer}>
                                        <Text style={styles.itemIcon}>{moduleIcon(item.nome, item.icon)}</Text>
                                    </View>
                                    <Text style={styles.itemNome}>{item.nome}</Text>
                                </Pressable>
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
        justifyContent: 'flex-start',
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
    empty: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        paddingVertical: Spacing.lg,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
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
});
