import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {listarRelatoriosDisponiveis, type RelatorioDisponivel} from './relatorios';

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

export function ReportButton({navigateTo}: { navigateTo: (key: string) => void }) {
    const [open, setOpen] = useState(false);

    const list = useQuery({
        queryKey: ['relatorios', 'disponiveis'],
        queryFn: listarRelatoriosDisponiveis,
        enabled: open,
    });

    const items = list.data ? ? [];

    const handleItemPress = (item: RelatorioDisponivel) => {
        setOpen(false);
        navigateTo(TIPO_ROTA[item.tipo] ? ? 'view/relatorios/listTabela');
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
                                <Pressable key={`${item.tipo}-${item.id}`} style={styles.item}
                                           onPress={() => handleItemPress(item)}>
                                    <Text style={styles.itemTipo}>{TIPO_LABEL[item.tipo] ? ? item.tipo}</Text>
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
    iconButton: {marginRight: 8, padding: 6},
    icon: {fontSize: 18},
    overlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.4)', paddingTop: 60, paddingHorizontal: 16},
    dropdown: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 12,
        maxHeight: '70%',
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(194, 170, 60, 0.15)',
    },
    dropdownTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1d2025',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    empty: {color: '#888', fontSize: 13, paddingVertical: 8, textAlign: 'center'},
    item: {paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0'},
    itemTipo: {fontSize: 10, fontWeight: '600', color: '#265a88', textTransform: 'uppercase', letterSpacing: 0.5},
    itemNome: {fontSize: 14, color: '#1d2025', marginTop: 2},
});
