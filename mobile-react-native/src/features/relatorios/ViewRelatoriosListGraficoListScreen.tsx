import React, {useState, useEffect} from 'react';
import {ModuleList, type ModuleListExtraAction} from '../ModuleListScreen';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper, ApiItem} from '../../shared/types/types';
import {api} from '../../shared/services/api';
import {useNavigation} from '@react-navigation/native';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

const TIPO_ROTA: Record<string, string> = {
    GRAFICO: 'view/relatorios/viewGraficoBarrasVertical',
    PIZZA: 'view/relatorios/viewGraficoPizza',
    LINHA: 'view/relatorios/viewGraficoLinhas',
    COMBINADO: 'view/relatorios/viewGraficoCombinado',
    CIRCULAR: 'view/relatorios/viewGraficoCircular',
    BARRA_VERTICAL: 'view/relatorios/viewGraficoBarrasVertical',
    BARRA_HORIZONTAL: 'view/relatorios/viewGraficoBarrasHorizontal',
};

export default function ViewRelatoriosListGraficoListScreen() {
    const navigation = useNavigation<any>();
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                setLoading(true);
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/listGrafico`);
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
        console.log('Aplicar filtros do gráfico');
    };

    const extraActions: ModuleListExtraAction[] = [
        {
            key: 'editar',
            title: 'Editar',
            icon: '✏️',
            permission: 'UPDATE',
            onPress: (item: ApiItem) => {
                navigation.navigate('view/relatorios/formGrafico' as never, {id: String(item.id)} as never);
            },
        },
        {
            key: 'acessar',
            title: 'Acessar Relatório',
            icon: '📈',
            permission: 'EXECUTE',
            onPress: (item: ApiItem) => {
                const record = item as unknown as Record<string, unknown>;
                const tipo = String(record.tipo ?? 'GRAFICO').toUpperCase();
                const rota = TIPO_ROTA[tipo] ?? 'view/relatorios/viewGraficoBarrasVertical';
                navigation.navigate(rota as never, {id: String(item.id)} as never);
            },
        },
    ];

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
                <Text style={styles.headerTitle}>Gráfico</Text>
            </View>
            <ReportFilters
                filtros={filtros}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
            />
            <ModuleList path="/api/relatorios/grafico" extraActions={extraActions}/>
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