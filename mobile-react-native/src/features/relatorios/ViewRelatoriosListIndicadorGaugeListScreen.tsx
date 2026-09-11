import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { ModuleList } from '../ModuleListScreen';
import { useApi } from '../../shared/services/api';

export default function ViewRelatoriosListIndicadorGaugeListScreen() {
    const { get: listIndicadores } = useApi('/api/relatorios/indicador-gauge/disponiveis');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await listIndicadores({ page: 0, size: 50 });
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3a85bd" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <ModuleList
            path="/api/relatorios/indicador-gauge/disponiveis"
            refreshControl={
                <View style={styles.refreshControl}>
                    <ActivityIndicator size="small" color="#3a85bd" animating={refreshing} />
                </View>
            }
            onRefresh={onRefresh}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                        // Navigate to view screen
                    }}
                >
                    <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.nome}</Text>
                        <View style={styles.itemMeta}>
                            <Text style={styles.itemMetaText}>
                                {item.configuracao?.nrOfLevels ?? 3} níveis
                            </Text>
                            <Text style={styles.itemMetaText}>
                                Arco: {item.configuracao?.arcWidth ?? 0.3}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.itemColors}>
                        {item.configuracao?.colors?.map((color: string, idx: number) => (
                            <View
                                key={idx}
                                style={[
                                    styles.colorDot,
                                    { backgroundColor: color }
                                ]}
                            />
                        ))}
                    </View>
                </TouchableOpacity>
            )}
            columns={[
                { key: 'nome', label: 'Nome', width: '60%' },
                { key: 'configuracao.nrOfLevels', label: 'Níveis', width: '20%' },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
    refreshControl: {
        paddingVertical: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    itemMetaText: {
        fontSize: 12,
        color: '#888',
    },
    itemColors: {
        flexDirection: 'row',
        gap: 4,
        marginLeft: 12,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
});