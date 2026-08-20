import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {alunoApi, BoletimResumo, formatarNota, formatarPercentual} from '../aluno';
import type {ParamList} from '../HomeScreen';

const STATUS_ROTULO: Record<string, string> = {
    APROVADO: 'Aprovado',
    'EM EXAME': 'Em exame',
    'REPROVADO POR FREQUÊNCIA': 'Reprovado por frequência',
    'SEM NOTAS': 'Sem notas',
};

const STATUS_COLOR: Record<string, string> = {
    APROVADO: '#1e7e34',
    'EM EXAME': '#a06b00',
    'REPROVADO POR FREQUÊNCIA': '#a61b29',
    'SEM NOTAS': '#666',
};

export default function AlunoDashboardScreen({navigation}: NativeStackScreenProps<ParamList, 'aluno/dashboard'>) {
    const [nome, setNome] = useState('');
    const [boletins, setBoletins] = useState<BoletimResumo[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([alunoApi.perfil(), alunoApi.dashboard()])
            .then(([perfil, dashboard]) => {
                if (!active) return;
                setNome(perfil.nome || perfil.username || '');
                setBoletins(dashboard.boletins ? ? []);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar o painel do aluno.');
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
                <Text style={styles.title}>Portal do Aluno</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const aprovadas = boletins.filter((b) => b.status === 'APROVADO').length;

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Portal do Aluno</Text>
            <Text style={styles.greeting}>
                Olá, <Text style={styles.greetingName}>{nome}</Text>! Este é o seu painel acadêmico.
            </Text>

            <View style={styles.cardsRow}>
                <View style={styles.card}>
                    <Text style={styles.cardValue}>{boletins.length}</Text>
                    <Text style={styles.cardLabel}>Matrículas</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardValue}>{aprovadas}</Text>
                    <Text style={styles.cardLabel}>Disciplinas aprovadas</Text>
                </View>
            </View>

            {boletins.length === 0 && <Text style={styles.empty}>Nenhuma matrícula encontrada.</Text>}

            {boletins.map((b) => (
                <View style={styles.item} key={b.matricula.id}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderText}>
                            <Text
                                style={styles.itemTitle}>{b.matricula.componente || b.matricula.curso || 'Disciplina'}</Text>
                            <Text style={styles.itemMeta}>
                                {[b.matricula.curso, b.matricula.turma ? `Turma ${b.matricula.turma}` : null, b.matricula.periodo]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </Text>
                        </View>
                        <View
                            style={[styles.statusBadge, {backgroundColor: (STATUS_COLOR[b.status] ? ? '#666') + '22'}]}>
                            <Text style={[styles.statusText, {color: STATUS_COLOR[b.status] ? ? '#666'}]}>
                                {STATUS_ROTULO[b.status] ? ? b.status}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.itemData}>
                        <Text style={styles.itemDataText}>
                            <Text style={styles.bold}>Média:</Text> {formatarNota(b.media)}
                        </Text>
                        <Text style={styles.itemDataText}>
                            <Text style={styles.bold}>Frequência:</Text> {formatarPercentual(b.frequenciaPerc)}
                        </Text>
                    </View>
                    <View style={styles.itemActions}>
                        <Pressable onPress={() => navigation.navigate('aluno/boletim')}>
                            <Text style={styles.link}>Ver boletim</Text>
                        </Pressable>
                        <Pressable onPress={() => navigation.navigate('aluno/frequencia')}>
                            <Text style={styles.link}>Ver frequência</Text>
                        </Pressable>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1},
    content: {padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 8},
    greeting: {fontSize: 15, color: '#555', marginBottom: 16},
    greetingName: {fontWeight: '700', color: '#2b2b2b'},
    errorText: {color: '#a61b29', fontSize: 14},
    empty: {textAlign: 'center', color: '#888', marginTop: 16},
    cardsRow: {flexDirection: 'row', marginBottom: 20},
    card: {flex: 1, backgroundColor: '#f4f7fa', borderRadius: 8, padding: 16, marginRight: 10, alignItems: 'center'},
    cardValue: {fontSize: 28, fontWeight: 'bold', color: '#2a5a88'},
    cardLabel: {fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center'},
    item: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        padding: 14,
        marginBottom: 12
    },
    itemHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
    itemHeaderText: {flex: 1, marginRight: 8},
    itemTitle: {fontSize: 16, fontWeight: '700', color: '#2b2b2b'},
    itemMeta: {fontSize: 12, color: '#888', marginTop: 2},
    statusBadge: {borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4},
    statusText: {fontSize: 11, fontWeight: '700'},
    itemData: {flexDirection: 'row', marginTop: 10},
    itemDataText: {fontSize: 13, color: '#444', marginRight: 16},
    bold: {fontWeight: '700', color: '#2b2b2b'},
    itemActions: {flexDirection: 'row', marginTop: 10},
    link: {color: '#2a5a88', fontWeight: '600', fontSize: 13, marginRight: 20},
});
