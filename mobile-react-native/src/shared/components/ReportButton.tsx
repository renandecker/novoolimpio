import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {listarRelatoriosDisponiveis, type RelatorioDisponivel} from '../../features/relatorios/relatorios';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from './theme';

const TIPO_ROTA: Record<string, string> = {
    TABELA: 'view/relatorios/viewTabela',
    GRAFICO: 'view/relatorios/viewGraficoBarrasVertical',
    MAPA: 'view/relatorios/viewMapa',
    ORGANOGRAMA: 'view/relatorios/viewOrganograma',
    DASHBOARD: 'view/relatorios/viewDashboard',
    PIZZA: 'view/relatorios/viewGraficoPizza',
    LINHA: 'view/relatorios/viewGraficoLinhas',
    COMBINADO: 'view/relatorios/viewGraficoCombinado',
    CIRCULAR: 'view/relatorios/viewGraficoCircular',
    BARRA_VERTICAL: 'view/relatorios/viewGraficoBarrasVertical',
    BARRA_HORIZONTAL: 'view/relatorios/viewGraficoBarrasHorizontal',
};

const TIPO_LABEL: Record<string, string> = {
    TABELA: 'Tabela',
    GRAFICO: 'Gráfico',
    MAPA: 'Mapa',
    ORGANOGRAMA: 'Organograma',
    DASHBOARD: 'Dashboard',
    PIZZA: 'Gráfico Pizza',
    LINHA: 'Gráfico Linhas',
    COMBINADO: 'Gráfico Combinado',
    CIRCULAR: 'Gráfico Circular',
    BARRA_VERTICAL: 'Gráfico Barras Vertical',
    BARRA_HORIZONTAL: 'Gráfico Barras Horizontal',
};

export function ReportButton({navigateTo}: { navigateTo: (key: string) => void }) {
    const [open, setOpen] = useState(false);

    const list = useQuery({
        queryKey: ['relatorios', 'disponiveis'],
        queryFn: listarRelatoriosDisponiveis,
        enabled: open,
    });

    const items = list.data ?? [];

    const handleItemPress = (item: RelatorioDisponivel) => {
        setOpen(false);
        const tipoKey = (item.tipo || '').toUpperCase();
        const baseRoute = TIPO_ROTA[tipoKey] ?? 'view/relatorios/viewTabela';
        navigateTo(`${baseRoute}?id=${item.id}`);
    };

    return (
        <>
            <Pressable style={styles.iconButton} onPress={() => setOpen(true)}>
                <Text style={styles.icon}>📊</Text>
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownTitle}>Relatórios</Text>
                        {items.length === 0 && (list.isPending || list.isFetching) ? (
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
    dropdownTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dropdownHeaderBorder,
    },
    empty: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        paddingVertical: Spacing.lg,
        textAlign: 'center',
    },
    item: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
    },
    itemTipo: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    itemNome: {
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        marginTop: Spacing.xs,
    },
});