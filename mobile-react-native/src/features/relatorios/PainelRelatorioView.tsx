import React, {useEffect, useState} from 'react';
import {ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {abrirRelatorio, type RelatorioAberto} from './relatorios';
import {Colors, Typography, Spacing} from '../../shared/styles/theme';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper, ReportFilterSqlValues} from '../../shared/types/types';
import {api} from '../../shared/services/api';

/**
 * Tela de painel/dashboard: reaproveita a listagem de relatórios disponíveis do tipo
 * DASHBOARD, permitindo escolher o painel e aplicar os mesmos filtros da viewTabela.
 */
export default function PainelRelatorioView() {
    const route = useRoute<any>();
    const idParam = route.params?.id;
    const id = idParam != null ? Number(idParam) : NaN;
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [filtrosAplicados, setFiltrosAplicados] = useState<ReportFilterSqlValues | undefined>(undefined);
    const [report, setReport] = useState<RelatorioAberto | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!Number.isInteger(id) || id <= 0) return;
        let ativo = true;
        (async () => {
            try {
                const resp = await api.get<FiltroRelatorioWrapper[]>('/api/relatorios/filtros/viewPainel', {
                    params: {painelId: id},
                });
                if (ativo) setFiltros(resp.data);
            } catch (err) {
                console.error('Erro ao carregar filtros do painel:', err);
            }
        })();
        return () => { ativo = false; };
    }, [id]);

    useEffect(() => {
        if (!Number.isInteger(id) || id <= 0) return;
        let ativo = true;
        setLoading(true);
        setError(null);
        abrirRelatorio('DASHBOARD', id, filtrosAplicados)
            .then((resp) => {
                if (ativo) setReport(resp);
            })
            .catch((err) => {
                console.error('Erro ao carregar painel:', err);
                if (ativo) setError('Você não possui acesso a este painel ou ele não existe.');
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });
        return () => { ativo = false; };
    }, [id, filtrosAplicados]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color={Colors.primary}/>
                    <Text style={styles.carregandoText}>Carregando painel...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centro}>
                    <Text style={styles.erroTitulo}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitulo}>{report?.nome ?? 'Painel'}</Text>
                </View>
                {filtros.length > 0 && (
                    <ReportFilters
                        filtros={filtros}
                        onFiltersChange={setFiltros}
                        onApplyFilters={(valores) => {
                            setFiltrosAplicados(valores && Object.keys(valores).length > 0 ? valores : undefined);
                        }}
                    />
                )}
                <View style={styles.card}>
                    <Text style={styles.cardTitulo}>Composição do painel</Text>
                    {Object.entries(report?.configuracao ?? {})
                        .filter(([key, value]) => key !== 'id' && !key.startsWith('todos') && !Array.isArray(value) && (value === null || typeof value !== 'object'))
                        .map(([key, value]) => (
                            <View key={key} style={styles.linha}>
                                <Text style={styles.linhaLabel}>{key}</Text>
                                <Text style={styles.linhaValor}>{String(value)}</Text>
                            </View>
                        ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    centro: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    carregandoText: {
        marginTop: Spacing.sm,
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
    },
    erroTitulo: {
        color: Colors.error,
        textAlign: 'center',
        fontSize: Typography.sizes.base,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    header: {
        marginBottom: Spacing.md,
    },
    headerTitulo: {
        fontSize: Typography.sizes.title,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    card: {
        backgroundColor: Colors.bgCard,
        borderRadius: 12,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    cardTitulo: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs,
    },
    linhaLabel: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
    },
    linhaValor: {
        color: Colors.textPrimary,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
});
