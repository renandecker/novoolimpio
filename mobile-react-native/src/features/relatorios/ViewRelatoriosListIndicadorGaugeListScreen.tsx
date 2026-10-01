import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ModuleList} from '../ModuleListScreen';
import type {ModuleListExtraAction} from '../ModuleListScreen';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../shared/types/types';
import {api} from '../../shared/services/api';

export default function ViewRelatoriosListIndicadorGaugeListScreen() {
    const navigation = useNavigation();
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                setLoading(true);
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/listTabela`);
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, []);

    const extraActions: ModuleListExtraAction[] = [
        {
            key: 'ver',
            title: 'Ver',
            icon: '👁',
            permission: 'EXECUTE',
            onPress: (item) => {
                navigation.navigate('view/indicador/viewIndicadorGauge' as never, {id: String(item.id)} as never);
            },
        },
    ];

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros do indicador gauge');
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Indicadores Gauge</Text>
            </View>
            <ReportFilters
                filtros={filtros}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
            />
            <ModuleList
                path="/api/relatorios/indicador-gauge/disponiveis"
                extraActions={extraActions}
                outcome="view/relatorios/indicador-gauge"
            />
        </View>
    );
}

import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
});