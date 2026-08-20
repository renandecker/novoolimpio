import React from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {api} from '../api';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../auth';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const getOferecimentoDesc = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.descricao) return String(oferta.descricao);
    if (oferta.nome) return String(oferta.nome);
    if (oferta.sucinto) return String(oferta.sucinto);
    if (oferta.grupo && oferta.grupo.nome) return String(oferta.grupo.nome);
    return '';
};

export default function ViewChamadaAssinadaListChamadaAssinadaListScreen() {
    const {session} = useAuth();
    const [items, setItems] = useState<ApiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useQuery({
        queryKey: ['chamada-assinada-list'],
        queryFn: async () => {
            setLoading(true);
            try {
                const {data} = await api.get<ApiItem[]>('/api/view/chamadaAssinada/listChamadaAssinada');
                setItems(data);
            } catch (e: any) {
                setError(e?.response?.data?.message ? ? 'Erro ao carregar chamadas assinadas');
            } finally {
                setLoading(false);
            }
        },
        enabled: !!session,
    });

    const renderItem = ({item}: { item: ApiItem }) => {
        const record = asRecord(item);
        const titulo = getOferecimentoDesc(item) || `#${item.id}`;
        return (
            <View style={styles.row} onPress={() => {/* navigate to details */
            }}>
                <View style={styles.rowMain}>
                    <Text style={styles.rowText}>{titulo}</Text>
                    <Text style={styles.rowId}>#{item.id}</Text>
                </View>
                <View style={styles.rowActions}>
                    <Text style={styles.rowButtonText}>Ver detalhes</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Erro: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                renderedItemSize={120}
                horizontal={false}
                showsVerticalScrollIndicator={true}
                refreshing={false}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
    errorText: {color: '#a61b29', fontSize: 15, fontWeight: '700', marginBottom: 6},
    row: {padding: 12, borderBottomWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'},
    rowMain: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    rowText: {fontSize: 16, color: '#2b2b2b', flexShrink: 1},
    rowId: {fontSize: 12, color: '#999'},
    rowActions: {flexDirection: 'row', marginTop: 4},
    rowButton: {
        backgroundColor: '#eef1f5',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 6,
        marginTop: 4
    },
    rowButtonText: {color: '#2a5a88', fontSize: 13, fontWeight: '600'},
});