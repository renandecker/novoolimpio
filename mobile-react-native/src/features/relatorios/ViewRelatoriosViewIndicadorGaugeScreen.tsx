import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApi } from '../../shared/services/api';
import Svg, { Path, Circle, Text as SvgText, Defs, Style, G } from 'react-native-svg';

const GAUGE_COLORS = [
    '#22c55e', '#16a34a', '#15803d', '#166534',
    '#84cc16', '#65a30d', '#4d7c0f', '#3f6212',
    '#eab308', '#ca8a04', '#a16207', '#854d0e',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#f43f5e', '#e11d48', '#be123c', '#9f1239',
    '#ec4899', '#db2777', '#be185d', '#9d174d',
    '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
    '#06b6d4', '#0891b2', '#0e7490', '#155e75',
    '#14b8a6', '#0d9488', '#0f766e', '#115e59',
    '#f97316', '#ea580c', '#c2410c', '#9a3412',
];

const DEFAULT_CONFIG = {
    nrOfLevels: 3,
    colors: ['#22c55e', '#eab308', '#ef4444'],
    arcWidth: 0.3,
    percent: 0.7,
    textColor: '#1e293b',
    needleColor: '#475569',
    needleBaseColor: '#475569',
    animate: true,
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function getLevelConfig(config: any, totalAngle: number) {
    const levels = config.nrOfLevels;
    const anglePerLevel = totalAngle / levels;
    return config.colors.map((color: string, i: number) => ({
        color,
        startAngle: -90 + (i * anglePerLevel),
        endAngle: -90 + ((i + 1) * anglePerLevel),
    }));
}

function getNeedleAngle(config: any, percent: number, totalAngle: number) {
    const clampedPercent = Math.max(0, Math.min(1, percent));
    return -90 + (clampedPercent * totalAngle);
}

function getNeedlePath(config: any, percent: number, totalAngle: number, centerX: number, centerY: number, radius: number) {
    const needleAngle = getNeedleAngle(config, percent, totalAngle);
    const needleLength = radius * 0.9;
    const needleBaseRadius = radius * 0.15;
    
    const needleTip = polarToCartesian(centerX, centerY, needleLength, needleAngle);
    const needleBase1 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle - 90);
    const needleBase2 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle + 90);
    
    return `M ${needleBase1.x} ${needleBase1.y} L ${needleTip.x} ${needleTip.y} L ${needleBase2.x} ${needleBase2.y} Z`;
}

interface Props {
    route: {
        params?: {
            id?: number;
        };
    };
}

export default function ViewRelatoriosViewIndicadorGaugeScreen({ route }: Props) {
    const { id } = route.params || {};
    const { get: loadIndicador } = useApi('/api/relatorios/indicador-gauge');

    const [indicador, setIndicador] = useState<any>(null);
    const [gaugeData, setGaugeData] = useState<{ valorAtual: number; valorMinimo: number; valorMaximo: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const resp = await loadIndicador(id);
            setIndicador(resp.data);
        } catch (error) {
            console.error('Erro ao carregar indicador:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGaugeData = async () => {
        if (!indicador?.sql) return;
        setRefreshing(true);
        try {
            const resp = await fetch('/api/relatorios/indicador-gauge/executar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: indicador.sql }),
            });
            if (resp.ok) {
                const result = await resp.json();
                setGaugeData(result);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do gauge:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, loadIndicador]);

    useEffect(() => {
        if (indicador) {
            fetchGaugeData();
        }
    }, [indicador]);

    const config = indicador ? { ...DEFAULT_CONFIG, ...indicador.configuracao } : DEFAULT_CONFIG;
    const percent = gaugeData
        ? (gaugeData.valorAtual - gaugeData.valorMinimo) / (gaugeData.valorMaximo - gaugeData.valorMinimo)
        : config.percent;

    const centerX = 150;
    const centerY = 150;
    const radius = 130;
    const arcRadius = radius;
    const innerRadius = radius * (1 - config.arcWidth);
    const totalAngle = 180;

    const levels = getLevelConfig(config, totalAngle);
    const needlePath = getNeedlePath(config, percent, totalAngle, centerX, centerY, radius);
    const displayValue = gaugeData
        ? gaugeData.valorMinimo + (gaugeData.valorMaximo - gaugeData.valorMinimo) * percent
        : 70;

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3a85bd" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </SafeAreaView>
        );
    }

    if (!indicador) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Indicador não encontrado</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} refreshControl={
                <ActivityIndicator
                    size="small"
                    color="#3a85bd"
                    animating={refreshing}
                    style={styles.refreshIndicator}
                />
            } onRefresh={fetchGaugeData}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {}} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{indicador.nome}</Text>
                </View>

                <View style={styles.gaugeContainer}>
                    <Svg width={300} height={300} viewBox="0 0 300 300">
                        <Defs>
                            {config.animate && (
                                <Style>
                                    {`
                                        .gauge-arc { animation: drawArc 1s ease-out forwards; }
                                        .gauge-needle { animation: rotateNeedle 1s ease-out forwards; transform-origin: ${centerX}px ${centerY}px; }
                                        @keyframes drawArc { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                                        @keyframes rotateNeedle { from { transform: rotate(-90deg); } to { transform: rotate(${getNeedleAngle(config, percent, totalAngle)}deg); } }
                                    `}
                                </Style>
                            )}
                        </Defs>
                        {levels.map((level: any, i: number) => (
                            <Path
                                key={i}
                                d={describeArc(centerX, centerY, arcRadius, level.startAngle, level.endAngle)}
                                stroke={level.color}
                                strokeWidth={config.arcWidth * radius * 2}
                                fill="none"
                                strokeLinecap="round"
                                className={config.animate ? 'gauge-arc' : ''}
                                strokeDasharray={`${(level.endAngle - level.startAngle) / totalAngle * 2 * Math.PI * arcRadius} ${2 * Math.PI * arcRadius}`}
                                strokeDashoffset={config.animate ? `${2 * Math.PI * arcRadius}` : '0'}
                            />
                        ))}
                        <Circle
                            cx={centerX}
                            cy={centerY}
                            r={radius * 0.15}
                            fill={config.needleBaseColor}
                        />
                        <Path
                            d={needlePath}
                            fill={config.needleColor}
                            className={config.animate ? 'gauge-needle' : ''}
                        />
                        <SvgText
                            x={centerX}
                            y={centerY + 10}
                            textAnchor="middle"
                            fill={config.textColor}
                            fontSize={32}
                            fontWeight="bold"
                            fontFamily="system-ui"
                        >
                            {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </SvgText>
                        <SvgText
                            x={centerX}
                            y={centerY + 50}
                            textAnchor="middle"
                            fill={config.textColor}
                            fontSize={14}
                            fontFamily="system-ui"
                        >
                            {indicador.nome}
                        </SvgText>
                    </Svg>
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
                            <Text style={[styles.valueNumber, { color: '#3b82f6', fontSize: 24 }]}>
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
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cores dos Níveis</Text>
                    <View style={styles.colorsRow}>
                        {config.colors.map((color: string, i: number) => (
                            <View key={i} style={styles.colorItem}>
                                <View style={[styles.colorSwatchLarge, { backgroundColor: color }]} />
                                <Text style={styles.colorInfo}>
                                    <Text style={styles.colorHex}>{color}</Text>
                                    <Text style={styles.colorLevel}>Nível {i + 1}</Text>
                                </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        color: '#666',
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    refreshIndicator: {
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#3a85bd',
        fontSize: 14,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginRight: 60,
    },
    gaugeContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
        maxHeight: 200,
    },
    sqlText: {
        fontSize: 12,
        color: '#e2e8f0',
        fontFamily: 'monospace',
        lineHeight: 20,
    },
});