import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {alunoApi, AulaTurma} from './aluno';
import type {ParamList} from '../../HomeScreen';

export default function AlunoAulasTurmaScreen({navigation, route}: NativeStackScreenProps<ParamList, 'aluno/aulas/turma'>) {
    const oferecimentoId = route.params?.oferecimentoId;

    const [aulas, setAulas] = useState<AulaTurma[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        if (!oferecimentoId) return;
        let active = true;
        alunoApi
            .aulasDaTurma(Number(oferecimentoId))
            .then((data) => {
                if (active) setAulas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as aulas da turma.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [oferecimentoId]);

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
                <Text style={styles.title}>Aulas da Turma</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Aulas da Turma</Text>
            <Text style={styles.subtitle}>Total de aulas: {aulas.length}</Text>

            {aulas.length === 0 && <Text style={styles.empty}>Nenhuma aula encontrada.</Text>}

            <FlatList
                data={aulas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('aluno/aulas/aula', {aulaId: item.id})}
                    >
                        <View style={styles.row}>
                            <Text style={styles.itemTitle}>{item.nome || `Aula ${item.id}`}</Text>
                            <View style={[styles.badge, {backgroundColor: item.assistida ? '#ecfdf5' : '#fffbeb'}]}>
                                <Text style={[styles.badgeText, {color: item.assistida ? '#059669' : '#d97706'}]}>
                                    {item.assistida ? 'Assistida' : 'Pendente'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.itemMeta}>
                            {item.data ? `Data: ${item.data}` : 'Data não informada'}
                            {item.descricao ? ` · ${item.descricao}` : ''}
                        </Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f8f9fa', padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2a5a88', marginBottom: 4},
    subtitle: {fontSize: 14, color: '#666', marginBottom: 16},
    empty: {textAlign: 'center', color: '#888', marginTop: 16, fontSize: 14},
    errorText: {color: '#a61b29', fontSize: 14},
    listContainer: {paddingBottom: 20},
    item: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
    },
    row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4},
    itemTitle: {fontSize: 16, fontWeight: '700', color: '#2b2b2b', flex: 1, marginRight: 8},
    itemMeta: {fontSize: 12, color: '#666'},
    badge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4},
    badgeText: {fontSize: 11, fontWeight: '600'},
});
