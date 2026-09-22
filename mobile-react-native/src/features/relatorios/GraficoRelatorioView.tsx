import React, {useState, useEffect} from 'react';
import {ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useRoute} from '@react-navigation/native';
import {abrirRelatorio, type GraficoDados, type LinhaGrafico} from './relatorios';
import GraficoChart from './GraficoChart';
import {Colors, Typography, Spacing} from '../../shared/styles/theme';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../shared/types/types';
import {api} from '../../shared/services/api';

const TIPO_LABEL: Record<string, string> = {
    GRAFICO: 'Gráfico',
    PIZZA: 'Gráfico Pizza',
    LINHA: 'Gráfico Linhas',
    COMBINADO: 'Gráfico Combinado',
    CIRCULAR: 'Gráfico Circular',
    BARRA_VERTICAL: 'Gráfico Barras Vertical',
    BARRA_HORIZONTAL: 'Gráfico Barras Horizontal',
};

function tipoLabel(tipo: string): string {
    const chave = (tipo || '').toUpperCase();
    return TIPO_LABEL[chave] ?? 'Gráfico';
}

function dadosGrafico(dados: GraficoDados | null) {
    if (!dados) {
        return {
            linhas: [] as LinhaGrafico[],
            linhasCombinado: [] as LinhaGrafico[],
            exibirPercentual: false,
            exibirLegenda: true,
            exibirValor: false,
            valorAcumulado: false,
            posicao: '',
        };
    }
    return {
        linhas: dados.linhas ?? [],
        linhasCombinado: dados.linhasCombinado ?? [],
        exibirPercentual: dados.exibirPercentual,
        exibirLegenda: dados.exibirLegenda,
        exibirValor: dados.exibirValor,
        valorAcumulado: dados.valorAcumulado,
        posicao: dados.posicao ?? '',
    };
}

export default function GraficoRelatorioView({tipo}: { tipo: string }) {
    const route = useRoute();
    const id = (route.params as { id?: string } | undefined)?.id;
    const idNumero = id ? Number(id) : NaN;
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [filtrosLoading, setFiltrosLoading] = useState(true);

    useEffect(() => {
        const fetchFiltros = async () => {
            if (!id) return;
            try {
                setFiltrosLoading(true);
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewGrafico/${id}`);
                setFiltros(response.data);
            } catch (err) {
                console.error('Erro ao carregar filtros:', err);
            } finally {
                setFiltrosLoading(false);
            }
        };
        fetchFiltros();
    }, [id]);

    const {data, isPending, isError} = useQuery({
        queryKey: ['relatorio-aberto', tipo, id],
        queryFn: () => abrirRelatorio(tipo, idNumero),
        enabled: Boolean(id && Number.isInteger(idNumero) && idNumero > 0),
    });

    if (!id || !Number.isInteger(idNumero) || idNumero <= 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.erroContainer}>
                    <Text style={styles.erroTitulo}>Relatório inválido</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isPending) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color={Colors.primary}/>
                    <Text style={styles.carregandoText}>Carregando relatório...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !data) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.erroContainer}>
                    <Text style={styles.erroTitulo}>Relatório indisponível</Text>
                    <Text style={styles.erroSubtitulo}>Você não possui acesso a este relatório ou ele não existe.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const grafico = dadosGrafico(data.dados as GraficoDados | null);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTipo}>{tipoLabel(data.tipo)}</Text>
                    <Text style={styles.headerTitulo}>{data.nome}</Text>
                </View>
                {!filtrosLoading && filtros.length > 0 && (
                    <ReportFilters
                        filtros={filtros}
                        onFiltersChange={setFiltros}
                        onApplyFilters={() => {
                            console.log('Aplicar filtros do gráfico');
                        }}
                    />
                )}
                <GraficoChart
                    tipo={data.tipo}
                    linhas={grafico.linhas}
                    linhasCombinado={grafico.linhasCombinado}
                    exibirLegenda={grafico.exibirLegenda}
                    exibirValor={grafico.exibirValor}
                    exibirPercentual={grafico.exibirPercentual}
                    valorAcumulado={grafico.valorAcumulado}
                    posicao={grafico.posicao}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    header: {
        alignItems: 'center',
    },
    headerTipo: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        color: Colors.goldText,
        backgroundColor: Colors.goldBg,
        borderRadius: 999,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
    },
    headerTitulo: {
        fontSize: Typography.sizes.heading,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    carregandoText: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.lg,
    },
    erroContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        gap: Spacing.sm,
    },
    erroTitulo: {
        color: Colors.error,
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
    erroSubtitulo: {
        color: Colors.textMuted,
        fontSize: Typography.sizes.base,
        textAlign: 'center',
    },
});