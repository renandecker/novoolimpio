import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import {alunoApi, formatarPercentual} from './aluno';
import {useNavigation} from '@react-navigation/native';

export default function AlunoFrequenciaScreen() {
    const [frequencias, setFrequencias] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        let active = true;
        alunoApi
            .frequencia()
            .then((data) => {
                if (active) setFrequencias(data ?? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a frequência.');
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
                <Text style={styles.title}>Frequência</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Minhas Frequências</Text>
            <Text style={styles.subtitle}>Total de registros: {frequencias.length}</Text>

            {frequencias.length === 0 && (
                <Text style={styles.empty}>Nenhum registro de frequência encontrado.</Text>
            )}

            <FlatList
                data={frequencias}
                keyExtractor={(item) => String(item.id)}
                renderItem={({item}) => (
                    <View style={styles.item}>
                        <Text style={styles.itemTitulo}>{item.componente || item.nome}</Text>
                        <View style={styles.itemConcluido}>
                            <Text style={styles.concluidoText}>Concluído:</Text>
                            <Text style={styles.concluidoValue}>{formatarPercentual(item.frequenciaPerc)}</Text>
                        </View>
                        <Text style={styles.itemMeta}>Turma: {item.turma || 'Não informada'}</Text>
                        <TouchableOpacity style={styles.verMais} onPress={() =>
                            navigation.navigate('aluno/frequencia-detalhe', {frequenciaId: String(item.id)})
                        }>
                            <Text style={styles.verMaisTexto}>Ver mais</Text>
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
    item: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    itemTitulo: {fontSize: 16, fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
    itemConcluido: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
    concluidoText: {fontSize: 12, color: '#888'},
    concluidoValue: {fontSize: 14, fontWeight: '700', color: '#2e7d32'},
    itemMeta: {fontSize: 12, color: '#888', marginTop: 4},
    verMais: {marginTop: 8},
    verMaisTexto: {color: '#2a5a88', fontWeight: '600', fontSize: 13},
    flatListContainer: {},
});