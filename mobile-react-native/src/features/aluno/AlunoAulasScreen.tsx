import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {alunoApi, TurmaAula} from './aluno';
import type {ParamList} from '../../HomeScreen';

export default function AlunoAulasScreen({navigation}: NativeStackScreenProps<ParamList, 'aluno/aulas'>) {
    const [turmas, setTurmas] = useState<TurmaAula[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        alunoApi
            .turmas()
            .then((data) => {
                if (active) setTurmas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as turmas.');
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
                <Text style={styles.title}>Aulas</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Aulas</Text>
            <Text style={styles.subtitle}>Selecione a turma para ver as aulas.</Text>

            {turmas.length === 0 && <Text style={styles.empty}>Nenhuma turma encontrada.</Text>}

            <FlatList
                data={turmas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('aluno/aulas/turma', {oferecimentoId: item.id})}
                    >
                        <Text style={styles.itemTitle}>{item.componente}</Text>
                        <Text style={styles.itemMeta}>
                            {[item.curso, item.turma ? `Turma ${item.turma}` : null, item.unidade]
                                .filter(Boolean)
                                .join(' · ')}
                        </Text>
                        <Text style={styles.itemProf}>{item.professor || 'Professor não informado'}</Text>
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
    itemTitle: {fontSize: 16, fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
    itemMeta: {fontSize: 12, color: '#666', marginBottom: 2},
    itemProf: {fontSize: 12, color: '#888'},
});
