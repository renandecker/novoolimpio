import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { api } from '../../shared/services/api';
import { GaugeChart, GAUGE_COLORS, type GaugeConfig } from './GaugeChart';

const NR_OF_LEVELS_OPTIONS = [2, 3, 4, 5];
const ARC_WIDTH_OPTIONS = [
    { value: 0.1, label: '0.1' },
    { value: 0.2, label: '0.2' },
    { value: 0.3, label: '0.3' },
    { value: 0.4, label: '0.4' },
    { value: 0.5, label: '0.5' },
];
const TIPO_EXIBICAO_OPTIONS: { value: GaugeConfig['tipoExibicao']; label: string }[] = [
    { value: 'valor', label: 'Valor' },
    { value: 'percentual', label: 'Percentual' },
    { value: 'ambos', label: 'Valor + %' },
];

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

const EXAMPLE_SQL = `SELECT
    COALESCE(SUM(valor_total), 0) AS valor_atual,
    0 AS valor_minimo,
    50000 AS valor_maximo -- Meta predefinida
FROM vendas
WHERE DATE_TRUNC('month', data_venda) = DATE_TRUNC('month', CURRENT_DATE);`;

interface GaugeTestResult {
    valorAtual: number;
    valorMinimo: number;
    valorMaximo: number;
}

function parseConfiguracao(raw: unknown): GaugeConfig {
    if (!raw) return { ...DEFAULT_CONFIG };
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export default function ViewRelatoriosFormIndicadorGaugeListScreen({
    route,
    navigation,
}: {
    route: { params?: { id?: number | string } };
    navigation: any;
}) {
    const idParam = route.params?.id != null ? Number(route.params.id) : null;
    const isEditing = idParam != null;

    const [nome, setNome] = useState('');
    const [sql, setSql] = useState(EXAMPLE_SQL);
    const [config, setConfig] = useState<GaugeConfig>({ ...DEFAULT_CONFIG });
    const [loading, setLoading] = useState(isEditing);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<GaugeTestResult | null>(null);

    useEffect(() => {
        if (!isEditing || idParam == null) return;
        setLoading(true);
        api.get<{ nome: string; sql: string; configuracao: unknown }>(`/api/relatorios/indicador-gauge/${idParam}`)
            .then((resp) => {
                const data = resp.data;
                setNome(data.nome ?? '');
                setSql(data.sql ?? '');
                setConfig(parseConfiguracao(data.configuracao));
            })
            .catch((err) => {
                console.error('Erro ao carregar indicador:', err);
                Alert.alert('Erro', 'Não foi possível carregar o indicador.');
            })
            .finally(() => setLoading(false));
    }, [idParam, isEditing]);

    const setConfigField = <K extends keyof GaugeConfig>(key: K, value: GaugeConfig[K]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const setColor = (index: number, color: string) => {
        const colors = [...config.colors];
        colors[index] = color;
        setConfigField('colors', colors);
    };

    const handleTestSql = async () => {
        if (!sql.trim()) {
            Alert.alert('Atenção', 'Informe a consulta SQL.');
            return;
        }
        setTesting(true);
        try {
            const resp = await api.post<GaugeTestResult>('/api/relatorios/indicador-gauge/executar', { sql });
            setTestResult(resp.data);
        } catch (error) {
            console.error('Erro ao testar SQL:', error);
            Alert.alert('Erro', 'SQL inválido. Confira a sintaxe e os comandos permitidos.');
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async () => {
        if (nome.trim().length < 3) {
            Alert.alert('Atenção', 'Nome deve ter pelo menos 3 caracteres.');
            return;
        }
        if (!sql.trim()) {
            Alert.alert('Atenção', 'Informe a consulta SQL.');
            return;
        }
        if (!config.colors.length || config.colors.length < 2) {
            Alert.alert('Atenção', 'Configure pelo menos 2 cores.');
            return;
        }

        const payload = {
            nome: nome.trim(),
            sql: sql.trim(),
            configuracao: JSON.stringify(config),
        };

        setSaving(true);
        try {
            if (isEditing && idParam != null) {
                await api.put(`/api/relatorios/indicador-gauge/${idParam}`, payload);
                Alert.alert('Sucesso', 'Indicador atualizado com sucesso!');
            } else {
                await api.post('/api/relatorios/indicador-gauge', payload);
                Alert.alert('Sucesso', 'Indicador criado com sucesso!');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao salvar indicador:', error);
            Alert.alert('Erro', 'Não foi possível salvar o indicador.');
        } finally {
            setSaving(false);
        }
    };

    const addNivel = () => {
        if (config.nrOfLevels >= 5) return;
        const newColors = [...config.colors, GAUGE_COLORS[(config.nrOfLevels) % GAUGE_COLORS.length]];
        setConfig({ ...config, nrOfLevels: config.nrOfLevels + 1, colors: newColors });
    };

    const removeNivel = () => {
        if (config.nrOfLevels <= 2) return;
        setConfig({ ...config, nrOfLevels: config.nrOfLevels - 1, colors: config.colors.slice(0, -1) });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3a85bd" />
                <Text style={styles.centerText}>Carregando...</Text>
            </View>
        );
    }

    const previewValue = testResult
        ? testResult.valorAtual
        : config.percent;
    const previewMin = testResult?.valorMinimo ?? 0;
    const previewMax = testResult?.valorMaximo ?? 100;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{isEditing ? 'Editar Indicador Gauge' : 'Novo Indicador Gauge'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Definição</Text>

                <Text style={styles.label}>Nome do Indicador *</Text>
                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Ex: Meta de Vendas Mensal"
                />

                <Text style={styles.label}>Consulta SQL *</Text>
                <TextInput
                    style={[styles.input, styles.sqlInput]}
                    value={sql}
                    onChangeText={setSql}
                    multiline
                    textAlignVertical="top"
                    placeholder="SELECT ..."
                />
                <Text style={styles.help}>
                    O SQL deve retornar 3 colunas: valor_atual, valor_minimo, valor_maximo (apenas SELECT/WITH, sem INSERT/UPDATE/DELETE).
                </Text>

                <View style={styles.rowButtons}>
                    <Pressable
                        style={[styles.actionButton, styles.testButton, testing && { opacity: 0.5 }]}
                        disabled={testing}
                        onPress={handleTestSql}
                    >
                        <Text style={styles.testButtonText}>{testing ? 'Testando...' : 'Testar SQL'}</Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, styles.exampleButton]} onPress={() => setSql(EXAMPLE_SQL)}>
                        <Text style={styles.exampleButtonText}>Usar Exemplo</Text>
                    </Pressable>
                </View>

                {testResult && (
                    <View style={styles.testResult}>
                        <Text style={styles.testResultTitle}>Resultado do Teste</Text>
                        <View style={styles.testResultGrid}>
                            <View style={styles.testResultItem}>
                                <Text style={styles.testResultLabel}>Valor Atual</Text>
                                <Text style={styles.testResultValue}>{testResult.valorAtual.toLocaleString('pt-BR')}</Text>
                            </View>
                            <View style={styles.testResultItem}>
                                <Text style={styles.testResultLabel}>Valor Mínimo</Text>
                                <Text style={styles.testResultValue}>{testResult.valorMinimo.toLocaleString('pt-BR')}</Text>
                            </View>
                            <View style={styles.testResultItem}>
                                <Text style={styles.testResultLabel}>Valor Máximo</Text>
                                <Text style={styles.testResultValue}>{testResult.valorMaximo.toLocaleString('pt-BR')}</Text>
                            </View>
                            <View style={styles.testResultItem}>
                                <Text style={styles.testResultLabel}>Percentual</Text>
                                <Text style={[styles.testResultValue, { color: '#2563eb' }]}>
                                    {(((testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo)) * 100).toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Aparência</Text>

                <Text style={styles.label}>Tipo de Exibição *</Text>
                <View style={styles.segmentRow}>
                    {TIPO_EXIBICAO_OPTIONS.map((opt) => {
                        const active = (config.tipoExibicao ?? 'valor') === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                style={[styles.segment, active && styles.segmentActive]}
                                onPress={() => setConfigField('tipoExibicao', opt.value)}
                            >
                                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Text style={styles.label}>Níveis de Cor *</Text>
                <View style={styles.segmentRow}>
                    {NR_OF_LEVELS_OPTIONS.map((n) => {
                        const active = config.nrOfLevels === n;
                        return (
                            <Pressable
                                key={n}
                                style={[styles.segment, active && styles.segmentActive]}
                                onPress={() => setConfigField('nrOfLevels', n)}
                            >
                                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{n} níveis</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Text style={styles.label}>Largura do Arco *</Text>
                <View style={styles.segmentRow}>
                    {ARC_WIDTH_OPTIONS.map((opt) => {
                        const active = config.arcWidth === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                style={[styles.segment, active && styles.segmentActive]}
                                onPress={() => setConfigField('arcWidth', opt.value)}
                            >
                                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Text style={styles.label}>Animar</Text>
                <View style={styles.segmentRow}>
                    <Pressable
                        style={[styles.segment, config.animate && styles.segmentActive]}
                        onPress={() => setConfigField('animate', true)}
                    >
                        <Text style={[styles.segmentText, config.animate && styles.segmentTextActive]}>Sim</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.segment, !config.animate && styles.segmentActive]}
                        onPress={() => setConfigField('animate', false)}
                    >
                        <Text style={[styles.segmentText, !config.animate && styles.segmentTextActive]}>Não</Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Cores dos Níveis</Text>
                {Array.from({ length: config.nrOfLevels }, (_, i) => i).map((levelIndex) => (
                    <View key={levelIndex} style={styles.colorRow}>
                        <View
                            style={[styles.colorSwatch, { backgroundColor: config.colors[levelIndex] ?? DEFAULT_CONFIG.colors[levelIndex] }]}
                        />
                        <Text style={styles.colorLabel}>Nível {levelIndex + 1}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorOptions}>
                            {GAUGE_COLORS.map((color) => (
                                <Pressable
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        (config.colors[levelIndex] ?? DEFAULT_CONFIG.colors[levelIndex]) === color && styles.colorOptionActive,
                                    ]}
                                    onPress={() => setColor(levelIndex, color)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                ))}
                <View style={styles.rowButtons}>
                    <Pressable style={[styles.actionButton, styles.addButton]} onPress={addNivel}>
                        <Text style={styles.addButtonText}>+ Adicionar Nível</Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, styles.removeButton]} onPress={removeNivel}>
                        <Text style={styles.removeButtonText}>- Remover Nível</Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>Cores Avançadas</Text>
                <Text style={styles.label}>Cor do Texto</Text>
                <TextInput
                    style={styles.input}
                    value={config.textColor}
                    onChangeText={(value) => setConfigField('textColor', value)}
                />
                <Text style={styles.label}>Cor do Ponteiro</Text>
                <TextInput
                    style={styles.input}
                    value={config.needleColor}
                    onChangeText={(value) => setConfigField('needleColor', value)}
                />
                <Text style={styles.label}>Cor da Base do Ponteiro</Text>
                <TextInput
                    style={styles.input}
                    value={config.needleBaseColor}
                    onChangeText={(value) => setConfigField('needleBaseColor', value)}
                />

                <Text style={styles.sectionTitle}>Pré-visualização</Text>
                <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>{nome || 'Indicador Gauge'}</Text>
                    <GaugeChart
                        config={config}
                        value={previewValue}
                        minValue={previewMin}
                        maxValue={previewMax}
                        label={nome}
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()} disabled={saving}>
                    <Text style={styles.cancelButtonText}>Voltar</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={saving}>
                    <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    centerText: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 8,
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        padding: 16,
        paddingBottom: 110,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginTop: 20,
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#1e293b',
    },
    sqlInput: {
        minHeight: 140,
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    },
    help: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 6,
    },
    rowButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    actionButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    testButton: {
        backgroundColor: '#16a34a',
    },
    testButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    exampleButton: {
        backgroundColor: '#e2e8f0',
    },
    exampleButtonText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 13,
    },
    addButton: {
        backgroundColor: '#2563eb',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    removeButton: {
        backgroundColor: '#fee2e2',
    },
    removeButtonText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 13,
    },
    testResult: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
    },
    testResultTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#166534',
        marginBottom: 8,
    },
    testResultGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    testResultItem: {
        minWidth: '45%',
    },
    testResultLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#166534',
    },
    testResultValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#15803d',
        fontFamily: 'monospace',
        marginTop: 2,
    },
    segmentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    segment: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    segmentActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    segmentTextActive: {
        color: '#fff',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 10,
        marginBottom: 8,
    },
    colorSwatch: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    colorLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        width: 70,
    },
    colorOptions: {
        gap: 6,
        alignItems: 'center',
    },
    colorOption: {
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorOptionActive: {
        borderColor: '#1e293b',
    },
    previewBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        padding: 14,
        marginTop: 8,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        padding: 14,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    button: {
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e2e8f0',
    },
    cancelButtonText: {
        color: '#475569',
        fontWeight: '600',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#2563eb',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});