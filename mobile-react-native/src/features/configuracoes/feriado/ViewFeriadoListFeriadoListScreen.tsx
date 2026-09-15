import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '../../../shared/services/api';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../../../shared/styles/theme';
import {formatDate} from '../../../shared/utils/dateUtils';

const AJUSTE_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'feriadoNome', label: 'Feriado'},
    {key: 'feriadoData', label: 'Data Feriado'},
    {key: 'usuarioLogin', label: 'Usuário'},
    {key: 'ativo', label: 'Ativo'},
    {key: 'ocorrencia', label: 'Com Ocorrência'},
];

const OCORRENCIA_COLUMNS = [
    {key: 'id', label: 'ID'},
    {key: 'data', label: 'Data'},
    {key: 'oferecimentoDescricao', label: 'Oferecimento'},
    {key: 'grupoNome', label: 'Grupo'},
    {key: 'unidadeSucinto', label: 'Unidade'},
    {key: 'cursoNome', label: 'Curso'},
    {key: 'componenteCurricularDescricao', label: 'Componente Curricular'},
    {key: 'cargaHoraria', label: 'C.H.'},
    {key: 'status', label: 'Status'},
    {key: 'inscritos', label: 'Inscritos'},
    {key: 'vagas', label: 'Vagas'},
];

export default function ViewFeriadoListFeriadoListScreen() {
    const [activeTab, setActiveTab] = useState('tabela');
    const queryClient = useQueryClient();

    const {data: feriadosData, isLoading: feriadosLoading, refetch: refetchFeriados} = useQuery({
        queryKey: ['feriados'],
        queryFn: async () => {
            const response = await api.get('/api/basico/feriado/paged', {params: {page: 0, size: 50}});
            return response.data;
        },
    });

    const {data: ajustesData, isLoading: ajustesLoading, refetch: refetchAjustes} = useQuery({
        queryKey: ['feriadoAjustes'],
        queryFn: async () => {
            const response = await api.get('/api/basico/feriado/ajustes/paged', {params: {page: 0, size: 50}});
            return response.data;
        },
        enabled: activeTab === 'ajusteFeriadoOferecimento',
    });

    const {data: calendarioData, isLoading: calendarioLoading, refetch: refetchCalendario} = useQuery({
        queryKey: ['feriadoCalendario'],
        queryFn: async () => {
            const response = await api.get('/api/basico/feriado/calendario/eventos');
            return response.data;
        },
        enabled: activeTab === 'calendario',
    });

    const [selectedAjusteId, setSelectedAjusteId] = useState<number | null>(null);
    const [ocorrenciasAjustar, setOcorrenciasAjustar] = useState<any[]>([]);
    const [ocorrenciasNaoAjustar, setOcorrenciasNaoAjustar] = useState<any[]>([]);
    const [ocorrenciasLoading, setOcorrenciasLoading] = useState(false);

    const loadOcorrencias = async (ajusteId: number, tipo: 'ajustar' | 'naoAjustar') => {
        setOcorrenciasLoading(true);
        try {
            const endpoint = tipo === 'ajustar' 
                ? `/api/basico/feriado/ajustes/${ajusteId}/ocorrencias-ajustar`
                : `/api/basico/feriado/ajustes/${ajusteId}/ocorrencias-nao-ajustar`;
            const response = await api.get(endpoint);
            if (tipo === 'ajustar') {
                setOcorrenciasAjustar(response.data ?? []);
            } else {
                setOcorrenciasNaoAjustar(response.data ?? []);
            }
        } catch (error) {
            console.error('Erro ao carregar ocorrências:', error);
        } finally {
            setOcorrenciasLoading(false);
        }
    };

    const handleAjustePress = (ajuste: any) => {
        const id = ajuste.id;
        setSelectedAjusteId(id);
        if (activeTab === 'feriadoAjuste') {
            loadOcorrencias(id, 'ajustar');
        } else if (activeTab === 'feriadoNaoAjustar') {
            loadOcorrencias(id, 'naoAjustar');
        }
    };

    const tabs = [
        {key: 'tabela', label: 'Tabela'},
        {key: 'calendario', label: 'Calendário'},
        {key: 'ajusteFeriadoOferecimento', label: 'Ajuste Feriado Oferecimento'},
        {key: 'feriadoAjuste', label: 'Feriado Ajuste'},
        {key: 'feriadoNaoAjustar', label: 'Feriado Não Ajustar'},
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'tabela':
                return (
                    <FlatList
                        data={feriadosData?.content ?? []}
                        keyExtractor={(item) => String(item.id)}
                        refreshControl={
                            <RefreshControl refreshing={feriadosLoading} onRefresh={refetchFeriados} />
                        }
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => console.log('Editar feriado', item.id)}
                            >
                                <View style={styles.rowMain}>
                                    <View style={styles.rowLabelContainer}>
                                        <Text style={styles.rowText}>{item.nome}</Text>
                                    </View>
                                    <Text style={styles.rowId}>#{item.id}</Text>
                                </View>
                                <View style={styles.rowDetails}>
                                    <Text>{formatDate(item.dt_feriado)}</Text>
                                    <Text>{item.fl_feriado_fixo ? 'Sim' : 'Não'}</Text>
                                    <Text>{item.fl_tipo_curso ? 'Sim' : 'Não'}</Text>
                                    <Text>{item.fl_nacional ? 'Sim' : 'Não'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Nenhum feriado encontrado.</Text>
                        }
                    />
                );
            case 'calendario':
                if (calendarioLoading) {
                    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
                }
                if (!calendarioData || calendarioData.length === 0) {
                    return (
                        <View style={styles.center}>
                            <Text style={styles.empty}>Nenhum feriado cadastrado para exibir no calendário.</Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={refetchCalendario}>
                                <Text style={styles.primaryButtonText}>Carregar Calendário</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }
                return (
                    <ScrollView style={styles.calendarioContainer}>
                        <View style={styles.calendarioLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, {backgroundColor: '#27ae60'}]} />
                                <Text>Feriado Fixo</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, {backgroundColor: '#3498db'}]} />
                                <Text>Feriado Variável</Text>
                            </View>
                        </View>
                        <View style={styles.calendarioEvents}>
                            {calendarioData.map((evento: any) => (
                                <View key={evento.id} style={[styles.calendarioEvent, {borderLeftColor: evento.color}]}>
                                    <Text style={styles.eventTitle}>{evento.title}</Text>
                                    <Text style={styles.eventDate}>{formatDate(evento.start)}</Text>
                                    {evento.descricao && <Text style={styles.eventDesc}>{evento.descricao}</Text>}
                                    <View style={styles.eventBadges}>
                                        {evento.feriadoFixo && <Text style={styles.badgeGreen}>Fixo</Text>}
                                        {evento.nacional && <Text style={styles.badgeBlue}>Nacional</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                );
            case 'ajusteFeriadoOferecimento':
                if (ajustesLoading) {
                    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
                }
                return (
                    <FlatList
                        data={ajustesData?.content ?? []}
                        keyExtractor={(item) => String(item.id)}
                        refreshControl={
                            <RefreshControl refreshing={ajustesLoading} onRefresh={refetchAjustes} />
                        }
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => handleAjustePress(item)}
                            >
                                <View style={styles.rowMain}>
                                    <View style={styles.rowLabelContainer}>
                                        <Text style={styles.rowText}>{item.feriadoNome || `Feriado #${item.feriadoId}`}</Text>
                                    </View>
                                    <Text style={styles.rowId}>#{item.id}</Text>
                                </View>
                                <View style={styles.rowDetails}>
                                    <Text>{formatDate(item.feriadoData)}</Text>
                                    <Text>{item.usuarioLogin}</Text>
                                    <Text>{item.ativo ? 'Sim' : 'Não'}</Text>
                                    <Text>{item.ocorrencia ? 'Sim' : 'Não'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Nenhum ajuste encontrado.</Text>
                        }
                    />
                );
            case 'feriadoAjuste':
                if (!selectedAjusteId) {
                    return (
                        <View style={styles.center}>
                            <Text style={styles.empty}>Selecione um ajuste na aba "Ajuste Feriado Oferecimento" para visualizar as ocorrências a ajustar.</Text>
                        </View>
                    );
                }
                if (ocorrenciasLoading) {
                    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
                }
                return (
                    <FlatList
                        data={ocorrenciasAjustar}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.row}>
                                <View style={styles.rowMain}>
                                    <View style={styles.rowLabelContainer}>
                                        <Text style={styles.rowText}>{item.oferecimentoDescricao || `Oferecimento #${item.oferecimentoId}`}</Text>
                                    </View>
                                    <Text style={styles.rowId}>#{item.id}</Text>
                                </View>
                                <View style={styles.rowDetails}>
                                    <Text>{formatDate(item.data)}</Text>
                                    <Text>{item.grupoNome}</Text>
                                    <Text>{item.unidadeSucinto}</Text>
                                    <Text>{item.cursoNome}</Text>
                                    <Text>{item.componenteCurricularDescricao}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Nenhuma ocorrência para ajustar.</Text>
                        }
                    />
                );
            case 'feriadoNaoAjustar':
                if (!selectedAjusteId) {
                    return (
                        <View style={styles.center}>
                            <Text style={styles.empty}>Selecione um ajuste na aba "Ajuste Feriado Oferecimento" para visualizar as ocorrências não ajustar.</Text>
                        </View>
                    );
                }
                if (ocorrenciasLoading) {
                    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
                }
                return (
                    <FlatList
                        data={ocorrenciasNaoAjustar}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.row}>
                                <View style={styles.rowMain}>
                                    <View style={styles.rowLabelContainer}>
                                        <Text style={styles.rowText}>{item.oferecimentoDescricao || `Oferecimento #${item.oferecimentoId}`}</Text>
                                    </View>
                                    <Text style={styles.rowId}>#{item.id}</Text>
                                </View>
                                <View style={styles.rowDetails}>
                                    <Text>{formatDate(item.data)}</Text>
                                    <Text>{item.grupoNome}</Text>
                                    <Text>{item.unidadeSucinto}</Text>
                                    <Text>{item.cursoNome}</Text>
                                    <Text>{item.componenteCurricularDescricao}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>Nenhuma ocorrência não ajustar.</Text>
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Feriado</Text>
            </View>
            <ScrollView horizontal style={styles.tabBar} showsHorizontalScrollIndicator={false}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabButton,
                            activeTab === tab.key && styles.tabButtonActive,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            activeTab === tab.key && styles.tabButtonTextActive,
                        ]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.content}>{renderTabContent()}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
        padding: Spacing.lg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    tabButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgSecondary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    tabButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    tabButtonText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        fontWeight: Typography.weights.medium,
    },
    tabButtonTextActive: {
        color: Colors.textWhite,
        fontWeight: Typography.weights.semibold,
    },
    content: {
        flex: 1,
    },
    row: {
        padding: Spacing.md,
        marginVertical: Spacing.xs,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    rowMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    rowLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    rowText: {
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    rowId: {
        fontSize: Typography.sizes.xs,
        color: Colors.textLight,
    },
    rowDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    empty: {
        textAlign: 'center',
        color: Colors.textLight,
        marginTop: Spacing.xl,
        fontSize: Typography.sizes.lg,
    },
    calendarioContainer: {
        flex: 1,
    },
    calendarioLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    calendarioEvents: {
        gap: Spacing.sm,
    },
    calendarioEvent: {
        padding: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    eventTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    eventDate: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },
    eventDesc: {
        fontSize: Typography.sizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    eventBadges: {
        flexDirection: 'row',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },
    badgeGreen: {
        backgroundColor: '#27ae60',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    badgeBlue: {
        backgroundColor: '#3498db',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginTop: Spacing.md,
    },
    primaryButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
});