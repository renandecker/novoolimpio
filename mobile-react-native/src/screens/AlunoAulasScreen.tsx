import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import {alunoApi, AulaAluno, formatarData} from '../aluno';
import {useNavigation} from '@react-navigation/native';

export default function AlunoAulasScreen() {
    const [aulas, setAulas] = useState<AulaAluno[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        let active = true;
        alunoApi
            .aulas()
            .then((data) => {
                if (active) setAulas(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as aulas.');
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
                <Text style={styles.title}>Minhas Aulas</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Minhas Aulas</Text>
            <Text style={styles.subtitle}>Total de aulas registradas: {aulas.length}</Text>

            {aulas.length === 0 && (
                <Text style={styles.empty}>Nenhuma aula encontrada.</Text>
            )}

            <FlatList
                data={aulas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => (
                    <View style={styles.aulaItem}>
                        <Text style={styles.aulaTitulo}>{item.nome}</Text>
                        <Text style={styles.aulaMeta}>
                            {item.turma ? `Turma: ${item.turma}` : ''} {item.componente ? `· ${item.componente}` : ''}
                        </Text>
                        <Text style={styles.aulaInfo}>Data: {formatarData(item.data)}</Text>
                        <TouchableOpacity style={styles.verDetalhes} onPress={() =>
                            navigation.navigate('aluno/aula', {aulaId: String(item.id)})
                        }>
                            <Text style={styles.verTexto}>Ver detalhes</Text>
                        </TouchableOpacity>
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
    subtitle: {fontSize: 14, color: '#666', marginBottom: 16},
    empty: {textAlign: 'center', color: '#888', marginTop: 16, fontSize: 14},
    aulaItem: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    aulaTitulo: {fontSize: 16, fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
    aulaMeta: {fontSize: 13, color: '#555', marginBottom: 2},
    aulaInfo: {fontSize: 12, color: '#888'},
    verDetalhes: {marginTop: 8},
    verTexto: {color: '#2a5a88', fontWeight: '600', fontSize: 13},
    flatListContainer: {},
});