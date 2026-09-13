import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import {alunoApi, formatarMoeda, formatarPercentual} from './aluno';
import {useNavigation} from '@react-navigation/native';

export default function AlunoFinanceiroScreen() {
    const [lancamentos, setLancamentos] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        let active = true;
        alunoApi
            .financeiro()
            .then((data) => {
                if (active) setLancamentos(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as finanças.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    if (busy) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Financeiro</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Resumo Financeiro</Text>
            <Text style={styles.subtotal}>Total de lançamentos: {lancamentos.length}</Text>

            {lancamentos.length === 0 && (
                <Text style={styles.empty}>Nenhum lançamento financeiro encontrado.</Text>
            )}

            <FlatList
                data={lancamentos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => (
                    <View style={styles.lancamentoItem}>
                        <Text style={styles.descricao}>{item.descricao}</Text>
                        <Text style={styles.valor}>{formatarMoeda(item.valor)}</Text>
                        <Text style={styles.tipo} style={{color: item.tipo === 'receita' ? '#2e7d32' : '#c62828'}}>
                            {item.tipo}
                        </Text>
                        <Text style={styles.data}>Data: {formatarData(item.data)}</Text>
                    </View>
                )}
                contentContainerStyle={styles.flatListContainer}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f8f9fa'},
    content: {padding: 20},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2a5a88', marginBottom: 8},
    subtotal: {fontSize: 14, color: '#666', marginBottom: 16},
    empty: {textAlign: 'center', color: '#888', marginTop: 16, fontSize: 14},
    lancamentoItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    descricao: {fontSize: 15, fontWeight: '500', color: '#2b2b2b'},
    valor: {fontSize: 15, fontWeight: '700', color: '#2a5a88'},
    tipo: {fontSize: 12, fontWeight: '600'},
    data: {fontSize: 12, color: '#888'},
    flatListContainer: {},
});