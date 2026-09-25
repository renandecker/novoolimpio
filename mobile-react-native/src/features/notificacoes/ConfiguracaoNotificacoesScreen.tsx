import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, Typography, Layout, Shadows } from '../../theme';
import {
    listPreferenciasNotificacaoAgrupadas,
    salvarPreferenciaNotificacao,
    type PreferenciaNotificacaoCategoria,
    type PreferenciaNotificacaoCanal,
    type PreferenciaNotificacaoTipo,
} from '../notificacoes';
import type {ParamList} from '../HomeScreen';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

const CANAL_CORES: Record<string, string> = {
    PUSH: Colors.primary,
    TELEGRAM: '#0088cc',
    WHATSAPP: '#25D366',
    EMAIL: '#ea4335',
    SMS: '#34a853',
};

interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    color?: string;
}

function Toggle({value, onChange, disabled = false, color = Colors.primary}: ToggleProps) {
    return (
        <TouchableOpacity
            style={[
                styles.toggleContainer,
                value && styles.toggleOn,
                disabled && styles.toggleDisabled,
            ]}
            onPress={() => !disabled && onChange(!value)}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <View
                style={[
                    styles.toggleThumb,
                    value && styles.toggleThumbOn,
                ]}
            />
        </TouchableOpacity>
    );
}

function CanalItem({canal, onChange}: {canal: PreferenciaNotificacaoCanal; onChange: (ativo: boolean) => void}) {
    const cor = CANAL_CORES[canal.canal] || Colors.primary;
    const bgColor = canal.ativo ? cor : Colors.borderMedium;
    const textColor = canal.ativo ? Colors.textWhite : Colors.textLight;

    return (
        <View style={styles.canalItem}>
            <View style={[styles.canalBadge, {backgroundColor: bgColor}]}>
                <Text style={[styles.canalBadgeText, {color: textColor}]}>
                    {canal.canalLabel}
                </Text>
            </View>
            <Toggle
                value={canal.ativo}
                onChange={onChange}
                color={cor}
            />
        </View>
    );
}

function TipoCard({tipo}: {tipo: PreferenciaNotificacaoTipo}) {
    return (
        <View style={styles.tipoCard}>
            <View style={styles.tipoHeader}>
                <Text style={styles.tipoTitle}>{tipo.tipoLabel}</Text>
            </View>
            <Text style={styles.tipoDesc}>{tipo.descricao}</Text>
            <View style={styles.canalList}>
                {tipo.canais.map((canal) => (
                    <CanalItem
                        key={canal.canal}
                        canal={canal}
                        onChange={(ativo) => canal.ativo = ativo}
                    />
                ))}
            </View>
        </View>
    );
}

function CategoriaSection({categoria, onSave}: {categoria: PreferenciaNotificacaoCategoria; onSave: () => void}) {
    const handleCanalChange = (tipo: PreferenciaNotificacaoTipo, canal: PreferenciaNotificacaoCanal, ativo: boolean) => {
        const updatedTipo = {...tipo, canais: tipo.canais.map(c => c.canal === canal.canal ? {...c, ativo} : c)};
        const updatedCategoria = {...categoria, tipos: categoria.tipos.map(t => t.tipo === tipo.tipo ? updatedTipo : t)};
        return updatedCategoria;
    };

    return (
        <View style={styles.categoriaSection}>
            <View style={styles.categoriaHeader}>
                <View style={styles.categoriaHeaderContent}>
                    <Text style={styles.categoriaTitle}>{categoria.categoriaLabel}</Text>
                    <Text style={styles.categoriaDesc}>{categoria.descricao}</Text>
                </View>
            </View>
            <View style={styles.tiposContainer}>
                {categoria.tipos.map((tipo) => (
                    <TipoCard key={tipo.tipo} tipo={tipo} />
                ))}
            </View>
        </View>
    );
}

export default function ConfiguracaoNotificacoesScreen({
    route,
}: NativeStackScreenProps<ParamList, 'config/notificacoes'>) {
    const queryClient = useQueryClient();
    const [username] = useState(() => route.params?.username || 'admin');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

    const query = useQuery({
        queryKey: ['preferencias-notificacao', username],
        queryFn: () => listPreferenciasNotificacaoAgrupadas(username),
        staleTime: 5 * 60 * 1000,
    });

    const saveMutation = useMutation({
        mutationFn: async (categorias: PreferenciaNotificacaoCategoria[]) => {
            const requests = categorias.flatMap(cat =>
                cat.tipos.flatMap(tipo =>
                    tipo.canais.map(canal => ({
                        username,
                        categoria: cat.categoria,
                        tipo: tipo.tipo,
                        canal: canal.canal,
                        ativo: canal.ativo,
                    }))
                )
            );
            await Promise.all(requests.map(req => salvarPreferenciaNotificacao(req)));
        },
        onSuccess: () => {
            setSaveMessage({type: 'success', text: 'Configurações salvas com sucesso!'});
            queryClient.invalidateQueries({queryKey: ['preferencias-notificacao', username]});
        },
        onError: (error) => {
            console.error('Erro ao salvar preferências:', error);
            setSaveMessage({type: 'error', text: 'Erro ao salvar configurações'});
        },
        onSettled: () => setSaving(false),
    });

    const handleSave = () => {
        if (query.data) {
            setSaving(true);
            saveMutation.mutate(query.data);
        }
    };

    const onRefresh = () => {
        queryClient.invalidateQueries({queryKey: ['preferencias-notificacao', username]});
    };

    if (query.isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando configurações...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={query.isFetching}
                    onRefresh={onRefresh}
                    colors={[Colors.primary]}
                />
            }
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Configuração de Notificações</Text>
                <Text style={styles.subtitle}>
                    Gerencie como deseja receber notificações para cada tipo de evento.
                </Text>
            </View>

            {saveMessage && (
                <View style={[
                    styles.message,
                    saveMessage.type === 'success' ? styles.messageSuccess : styles.messageError,
                ]}>
                    <Text style={[
                        styles.messageText,
                        saveMessage.type === 'success' ? styles.messageTextSuccess : styles.messageTextError,
                    ]}>
                        {saveMessage.text}
                    </Text>
                </View>
            )}

            {query.data?.map((categoria) => (
                <CategoriaSection
                    key={categoria.categoria}
                    categoria={categoria}
                    onSave={handleSave}
                />
            ))}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    <Text style={[
                        styles.saveButtonText,
                        saving && styles.saveButtonTextDisabled,
                    ]}>
                        {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xxl,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.sizes.md,
        color: Colors.textMuted,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.sizes.md,
        color: Colors.textMuted,
        lineHeight: 20,
    },
    message: {
        margin: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    messageSuccess: {
        backgroundColor: Colors.successBg,
        borderColor: Colors.successLight,
    },
    messageError: {
        backgroundColor: Colors.errorBg,
        borderColor: Colors.errorBorder,
    },
    messageText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
    },
    messageTextSuccess: {
        color: Colors.success,
    },
    messageTextError: {
        color: Colors.error,
    },
    categoriaSection: {
        margin: Spacing.lg,
        marginBottom: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        overflow: 'hidden',
    },
    categoriaHeader: {
        padding: Spacing.lg,
        backgroundColor: Colors.bgPrimary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    categoriaHeaderContent: {
        gap: Spacing.xs,
    },
    categoriaTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
    },
    categoriaDesc: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        lineHeight: 18,
    },
    tiposContainer: {
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    tipoCard: {
        backgroundColor: Colors.bgPrimary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    tipoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tipoTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    tipoDesc: {
        fontSize: Typography.sizes.sm,
        color: Colors.textMuted,
        lineHeight: 18,
    },
    canalList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    canalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        minWidth: 140,
    },
    canalBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.xs,
        minWidth: 70,
        alignItems: 'center',
    },
    canalBadgeText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
    toggleContainer: {
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.toggleOff,
        padding: 2,
        justifyContent: 'center',
    },
    toggleOn: {
        backgroundColor: Colors.toggleOn,
    },
    toggleDisabled: {
        opacity: 0.5,
    },
    toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.toggleThumb,
        shadowColor: Colors.toggleThumbShadow,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleThumbOn: {
        marginLeft: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        backgroundColor: Colors.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        ...Shadows.modal,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        ...Shadows.gold,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    saveButtonTextDisabled: {
        color: Colors.textWhite,
    },
});