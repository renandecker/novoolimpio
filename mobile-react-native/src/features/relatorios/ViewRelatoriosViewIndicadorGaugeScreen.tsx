import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { api } from '../../shared/services/api';
import { GaugeChart, type GaugeConfig } from './GaugeChart';

const DEFAULT_CONFIG: GaugeConfig = {
    nrOfLevels: 3,
    colors: ['#22c55e', '#eab308', '#ef4444'],
    arcWidth: 0.3,
    percent: 0.7,
    textColor: '#1e293b',
    needleColor: '#475569',
    needleBaseColor: '#475569',
    animate: true,
    tipoExibicao: 'valor',
};

function parseConfiguracao(raw: unknown): GaugeConfig {
    if (!raw) return { ...DEFAULT_CONFIG };
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

interface Indicador {
    id: number;
    nome: string;
    sql: string;
    configuracao: unknown;
    createdAt?: string;
    updatedAt?: string;
}

interface GaugeData {
    valorAtual: number;
    valorMinimo: number;
    valorMaximo: number;
}

export default function ViewRelatoriosViewIndicadorGaugeScreen({
    route,
    navigation,
}: {
    route: { params?: { id?: number | string } };
    navigation: any;
}) {
    const { id } = route.params ?? {};
    const [indicador, setIndicador] = useState<Indicador | null>(null);
    const [config, setConfig] = useState<GaugeConfig>({ ...DEFAULT_CONFIG });
    const [gaugeData, setGaugeData] = useState<GaugeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGaugeData = useCallback(async (sql: string) => {
        setRefreshing(true);
        try {
            const resp = await api.post<GaugeData>('/api/relatorios/indicador-gauge/executar', { sql });
            setGaugeData(resp.data);
        } catch (err) {
            console.error('Erro ao buscar dados do gauge:', err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (id == null) {
            setLoading(false);
            setError('Indicador não encontrado.');
            return;
        }
        api.get<Indicador>(`/api/relatorios/indicador-gauge/${id}`)
            .then((resp) => {
                const data = resp.data;
                setIndicador(data);
                setConfig(parseConfiguracao(data.configuracao));
                if (data.sql) {
                    fetchGaugeData(data.sql);
                }
            })
            .catch((err) => {
                console.error('Erro ao carregar indicador:', err);
                setError('Erro ao carregar o indicador.');
            })
            .finally(() => setLoading(false));
    }, [id, fetchGaugeData]);

    const handleRefresh = () => {
        if (indicador?.sql) fetchGaugeData(indicador.sql);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#3a85bd" />
                <Text style={styles.centerText}>Carregando...</Text>
            </SafeAreaView>
        );
    }

    if (error || !indicador) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorText}>{error ?? 'Indicador não encontrado'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const percent = gaugeData
        ? (gaugeData.valorAtual - gaugeData.valorMinimo) / (gaugeData.valorMaximo - gaugeData.valorMinimo)
        : config.percent;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
                    <Text style={styles.headerBackText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{indicador.nome}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3a85bd" />
                }
                contentContainerStyle={styles.content}
            >
                <View style={styles.gaugeBox}>
                    <GaugeChart
                        config={config}
                        value={gaugeData?.valorAtual ?? config.percent}
                        minValue={gaugeData?.valorMinimo ?? 0}
                        maxValue={gaugeData?.valorMaximo ?? 100}
                        label={indicador.nome}
                        size={280}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Valores Atuais</Text>
                    <View style={styles.valuesGrid}>
                        <View style={styles.valueItem}>
                            <Text style={styles.valueLabel}>Valor Atual</Text>
                            <Text style={styles.valueNumber}>
                                {gaugeData?.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                            </Text>
                        </View>
                        <View style={styles.valueItem}>
                            <Text style={styles.valueLabel}>Valor Mínimo</Text>
                            <Text style={styles.valueNumber}>
                                {gaugeData?.valorMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                            </Text>
                        </View>
                        <View style={styles.valueItem}>
                            <Text style={styles.valueLabel}>Valor Máximo</Text>
                            <Text style={styles.valueNumber}>
                                {gaugeData?.valorMaximo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                            </Text>
                        </View>
                        <View style={styles.valueItem}>
                            <Text style={styles.valueLabel}>Percentual</Text>
                            <Text style={[styles.valueNumber, { color: '#2563eb' }]}>
                                {(percent * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configuração</Text>
                    <View style={styles.configList}>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Níveis</Text>
                            <Text style={styles.configValue}>{config.nrOfLevels}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Largura do Arco</Text>
                            <Text style={styles.configValue}>{config.arcWidth}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Tipo de Exibição</Text>
                            <Text style={styles.configValue}>
                                {config.tipoExibicao === 'percentual' ? 'Percentual' : config.tipoExibicao === 'ambos' ? 'Valor + %' : 'Valor'}
                            </Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Animado</Text>
                            <Text style={styles.configValue}>{config.animate ? 'Sim' : 'Não'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Cor do Texto</Text>
                            <View style={styles.configColorRow}>
                                <View style={[styles.colorSwatch, { backgroundColor: config.textColor }]} />
                                <Text style={styles.configValue}>{config.textColor}</Text>
                            </View>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Cor do Ponteiro</Text>
                            <View style={styles.configColorRow}>
                                <View style={[styles.colorSwatch, { backgroundColor: config.needleColor }]} />
                                <Text style={styles.configValue}>{config.needleColor}</Text>
                            </View>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Base do Ponteiro</Text>
                            <View style={styles.configColorRow}>
                                <View style={[styles.colorSwatch, { backgroundColor: config.needleBaseColor }]} />
                                <Text style={styles.configValue}>{config.needleBaseColor}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cores dos Níveis</Text>
                    <View style={styles.colorsRow}>
                        {config.colors.map((color, i) => (
                            <View key={i} style={styles.colorItem}>
                                <View style={[styles.colorSwatchLarge, { backgroundColor: color }]} />
                                <View style={styles.colorInfo}>
                                    <Text style={styles.colorHex}>{color}</Text>
                                    <Text style={styles.colorLevel}>Nível {i + 1}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Consulta SQL</Text>
                    <View style={styles.sqlContainer}>
                        <Text style={styles.sqlText}>{indicador.sql}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    centerText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 16,
        textAlign: 'center',
    },
    backButton: {
        marginTop: 16,
        backgroundColor: '#3a85bd',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerBack: {
        paddingRight: 12,
    },
    headerBackText: {
        color: '#3a85bd',
        fontSize: 15,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 24,
    },
    gaugeBox: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    valuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    valueItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    valueLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    valueNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: 'monospace',
    },
    configList: {
        gap: 8,
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    configLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    configValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    configColorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    colorsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    colorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    colorSwatchLarge: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    colorInfo: {
        flexDirection: 'column',
    },
    colorHex: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'monospace',
    },
    colorLevel: {
        fontSize: 11,
        color: '#64748b',
    },
    sqlContainer: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 12,
    },
    sqlText: {
        fontSize: 12,
        color: '#e2e8f0',
        fontFamily: 'monospace',
        lineHeight: 20,
    },
});