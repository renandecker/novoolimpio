import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    listMinhasNotificacoes,
    marcarNotificacaoLida,
    subscribeNotificacoesStream,
    type
    Notificacao
} from './notificacoes';
import type {ParamList} from '../../HomeScreen';

const PAGE_SIZES = [10, 20, 50];

const formatTime = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return (
        date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}) +
        ' ' +
        date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
    );
};

export default function ViewNotificacaoListNotificacaoListScreen({
                                                                     navigation,
                                                                 }: NativeStackScreenProps<ParamList, 'view/notificacao/listNotificacao'>) {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        const unsubscribe = subscribeNotificacoesStream(() => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        });
        return unsubscribe;
    }, [queryClient]);

    const query = useQuery({
        queryKey: ['notificacoes', 'minhas', page, size],
        queryFn: () => listMinhasNotificacoes(page, size),
    });

    const markRead = useMutation({
        mutationFn: marcarNotificacaoLida,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'nao-lidas']});
            queryClient.invalidateQueries({queryKey: ['notificacoes', 'minhas']});
        },
    });

    const items = query.data?.content ?? [];
    const totalElements = query.data?.totalElements ?? 0;
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);

    const openNotification = (notification: Notificacao) => {
        if (!notification.lida) markRead.mutate(notification.id);
        if (notification.link) {
            const key = notification.link.replace(/^\/+/, '');
            navigation.navigate(key as never);
        }
    };

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Notificações</Text>
            {query.isLoading && items.length === 0 ? (
                <Text style={styles.empty}>Carregando...</Text>
            ) : items.length === 0 ? (
                <Text style={styles.empty}>Nenhuma notificação no momento.</Text>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    refreshing={query.isFetching}
                    onRefresh={() => query.refetch()}
                    renderItem={({item}) => (
                        <Pressable style={[styles.item, !item.lida && styles.itemUnread]}
                                   onPress={() => openNotification(item)}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemTitle}>{item.titulo}</Text>
                                {!item.lida && <View style={styles.dot}/>}
                            </View>
                            {item.mensagem ? <Text style={styles.itemMessage}>{item.mensagem}</Text> : null}
                            <View style={styles.itemFooter}>
                                <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                                {!item.lida && (
                                    <Pressable onPress={() => markRead.mutate(item.id)}>
                                        <Text style={styles.markRead}>Marcar como lida</Text>
                                    </Pressable>
                                )}
                            </View>
                        </Pressable>
                    )}
                />
            )}

            {!query.isLoading && items.length > 0 && (
                <View style={styles.paginator}>
                    <Pressable
                        style={[styles.pageButton, (page === 0 || query.isFetching) && styles.pageButtonDisabled]}
                        disabled={page === 0 || query.isFetching}
                        onPress={() => setPage((current) => Math.max(0, current - 1))}
                    >
                        <Text style={styles.pageButtonText}>Anterior</Text>
                    </Pressable>
                    <Text style={styles.pageInfo}>
                        Página {page + 1} de {totalPages} · Total: {totalElements}
                    </Text>
                    <Pressable
                        style={[styles.pageButton, (page >= totalPages - 1 || query.isFetching) && styles.pageButtonDisabled]}
                        disabled={page >= totalPages - 1 || query.isFetching}
                        onPress={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                    >
                        <Text style={styles.pageButtonText}>Próxima</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 16},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 12},
    empty: {textAlign: 'center', color: '#888', marginTop: 24},
    item: {backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 8},
    itemUnread: {backgroundColor: '#eef4fb'},
    itemHeader: {flexDirection: 'row', alignItems: 'center'},
    itemTitle: {fontSize: 15, fontWeight: '700', color: '#2b2b2b', flexShrink: 1},
    dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a5a88', marginLeft: 8},
    itemMessage: {fontSize: 13, color: '#555', marginTop: 4},
    itemFooter: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
    itemTime: {fontSize: 11, color: '#999'},
    markRead: {fontSize: 12, color: '#2a5a88', fontWeight: '700'},
    paginator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#eee'
    },
    pageButton: {backgroundColor: '#eef1f5', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8},
    pageButtonDisabled: {opacity: 0.4},
    pageButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '700'},
    pageInfo: {fontSize: 12, color: '#666', flexShrink: 1, textAlign: 'center', marginHorizontal: 6},
});
