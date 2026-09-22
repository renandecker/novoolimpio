import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ModuleList} from '../../shared/components/ModuleListScreen';
import {Tabs} from '../../Tabs';

export default function ViewTurmaListTurmaFinalizandoListScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const turmaId = route?.params?.turmaId != null ? Number(route.params.turmaId) : null;

    const voltar = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('view/turma/listTurma');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Turma Finalizando{turmaId ? ` - #${turmaId}` : ''}</Text>
            <View style={styles.tabs}>
                <Tabs
                    tabs={[
                        {
                            key: 'matriculas',
                            label: 'Matrículas',
                            content: (
                                <ModuleList
                                    path="/api/view/turma/listTurmaFinalizando"
                                    params={turmaId ? {turmaId} : undefined}
                                />
                            ),
                        },
                        {key: 'notas', label: 'Notas', content: <Text style={styles.empty}>Conteúdo de Notas.</Text>},
                        {key: 'presencas', label: 'Presenças', content: <Text style={styles.empty}>Conteúdo de Presenças.</Text>},
                        {key: 'diasAula', label: 'Dias Aula', content: <Text style={styles.empty}>Conteúdo de Dias Aula.</Text>},
                        {key: 'comparativoAula', label: 'Comparativo Aula', content: <Text style={styles.empty}>Conteúdo de Comparativo Aula.</Text>},
                        {key: 'professor', label: 'Professor', content: <ModuleList path="/api/professor/professor" hideCreate hideUpdate hideDelete hideView />},
                        {key: 'selecionandoAluno', label: 'Selecionando Aluno', content: <Text style={styles.empty}>Conteúdo de Selecionando Aluno.</Text>},
                        {key: 'selecionandoNovaTurma', label: 'Selecionando nova Turma', content: <ModuleList path="/api/educacao/turma" hideCreate hideUpdate hideDelete hideView />},
                        {key: 'informacoes', label: 'Informações', content: <Text style={styles.empty}>Conteúdo de Informações.</Text>},
                        {key: 'disponibilidade', label: 'Disponibilidade', content: <Text style={styles.empty}>Conteúdo de Disponibilidade.</Text>},
                        {key: 'componenteCurricular', label: 'Componente Curricular', content: <ModuleList path="/api/educacao/componente-curricular" hideCreate hideUpdate hideDelete hideView />},
                    ]}
                />
            </View>
            <Pressable style={styles.backBtn} onPress={voltar}>
                <Text style={styles.backBtnText}>Voltar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 12},
    title: {fontSize: 20, fontWeight: '700', color: '#1d2025', marginBottom: 10},
    tabs: {flex: 1},
    empty: {color: '#888', fontStyle: 'italic', fontSize: 14, textAlign: 'center', paddingVertical: 30},
    backBtn: {
        marginTop: 12,
        backgroundColor: '#c2aa3c',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    backBtnText: {color: '#1d2025', fontWeight: '700', fontSize: 15},
});