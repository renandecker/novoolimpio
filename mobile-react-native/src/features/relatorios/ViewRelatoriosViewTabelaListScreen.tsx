import React, {useState, useEffect} from 'react';
import {ModuleList} from '../ModuleListScreen';
import {ReportFilters} from '../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../shared/types/types';
import {api} from '../shared/services/api';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

export default function ViewRelatoriosViewTabelaListScreen() {
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                setLoading(true);
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewTabela`);
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, []);

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros da tabela');
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
                <Text style={styles.headerTitle}>View Tabela</Text>
            </View>
            <ReportFilters
                filtros={filtros}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
            />
            <ModuleList path="/api/view/relatorios/viewTabela" hideCreate={true} hideUpdate={true} hideDelete={true} hideView={true}/>
        </View>
    );
}

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
