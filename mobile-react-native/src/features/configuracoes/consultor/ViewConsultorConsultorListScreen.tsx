import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Alert} from '../../../shared/components/SweetAlert';
import {ModuleList} from '../../../shared/components/ModuleListScreen';
import {ModuleWizard} from '../../../shared/components/ModuleWizard';
import ViewConsultorMatriculaLayoutScreen from './ViewConsultorMatriculaLayoutScreen';
import ViewConsultorRematriculaScreen from './ViewConsultorRematriculaScreen';

// consultor.xhtml (olimpio.zip) mostra um formulário por opção de menu, com as abas na
// vertical. "menu==2" embute o mesmo <p:wizard id="wizardmatricula"> de formMatricula.xhtml,
// e "menu==4" embute o mesmo <p:wizard id="wizardrematricula"> de formRematricula.xhtml.
// Esses devem permanecer como wizards dentro da aba, não achatados em tabelas simples.
type MenuItem = 'cursos' | 'matricula' | 'indicacao' | 'rematricula' | 'troca' | 'finalizar';

const MATRICULA_FLOW_STEPS = [
    {key: 'tabContrato', label: 'Contrato', path: '/api/educacao/contrato'},
    {key: 'tabMatricula', label: 'Matrícula/Rematrícula', path: '/api/educacao/matricula'},
    {key: 'tabMaterial', label: 'Material', path: '/api/estoque/venda-produto'},
    {key: 'tabValores', label: 'Valores', path: '/api/educacao/valor-curso', nextLabel: 'Salvar'},
];

export default function ViewConsultorConsultorListScreen() {
    const [menu, setMenu] = useState<MenuItem>('cursos');

    return (
        <View style={styles.container}>
            <View style={styles.sidebar}>
                <View style={styles.sidebarHeader}>
                    <Text style={styles.sidebarTitle}>Consultor</Text>
                </View>
                <Pressable style={[styles.sidebarBtn, menu === 'cursos' && styles.sidebarBtnActive]} onPress={() => setMenu('cursos')}>
                    <Text style={[styles.sidebarBtnText, menu === 'cursos' && styles.sidebarBtnTextActive]}>Cursos</Text>
                </Pressable>
                <Pressable style={[styles.sidebarBtn, menu === 'matricula' && styles.sidebarBtnActive]} onPress={() => setMenu('matricula')}>
                    <Text style={[styles.sidebarBtnText, menu === 'matricula' && styles.sidebarBtnTextActive]}>Matrícula</Text>
                </Pressable>
                <Pressable style={[styles.sidebarBtn, menu === 'indicacao' && styles.sidebarBtnActive]} onPress={() => setMenu('indicacao')}>
                    <Text style={[styles.sidebarBtnText, menu === 'indicacao' && styles.sidebarBtnTextActive]}>Indicação</Text>
                </Pressable>
                <Pressable style={[styles.sidebarBtn, menu === 'rematricula' && styles.sidebarBtnActive]} onPress={() => setMenu('rematricula')}>
                    <Text style={[styles.sidebarBtnText, menu === 'rematricula' && styles.sidebarBtnTextActive]}>Rematrícula</Text>
                </Pressable>
                <Pressable style={[styles.sidebarBtn, menu === 'troca' && styles.sidebarBtnActive]} onPress={() => setMenu('troca')}>
                    <Text style={[styles.sidebarBtnText, menu === 'troca' && styles.sidebarBtnTextActive]}>Troca Curso</Text>
                </Pressable>
                <View style={styles.sidebarSpacer} />
                <Pressable style={styles.sidebarBtn} onPress={() => Alert.alert('Finalizar', 'Finalizar atendimento')}>
                    <Text style={[styles.sidebarBtnText, styles.sidebarBtnTextDanger]}>Finalizar</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content}>
                {menu === 'cursos' && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Cursos Disponíveis</Text>
                        <ModuleList path="/api/educacao/curriculo" hideCreate={true} />
                    </View>
                )}
                {menu === 'matricula' && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Matrícula</Text>
                        <ViewConsultorMatriculaLayoutScreen />
                    </View>
                )}
                {menu === 'indicacao' && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Indicação</Text>
                        <Text style={styles.placeholder}>Funcionalidade de indicação</Text>
                    </View>
                )}
                {menu === 'rematricula' && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Rematrícula</Text>
                        <ViewConsultorRematriculaScreen />
                    </View>
                )}
                {menu === 'troca' && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Troca de Curso</Text>
                        <ModuleWizard steps={MATRICULA_FLOW_STEPS} />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, flexDirection: 'row', backgroundColor: '#ffffff'},
    sidebar: {width: 150, backgroundColor: '#1d2025', paddingVertical: 8, paddingHorizontal: 8},
    sidebarHeader: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3a3f4a', marginBottom: 8},
    sidebarTitle: {fontSize: 15, fontWeight: 'bold', color: '#e8d27a', textAlign: 'center', letterSpacing: 0.5},
    sidebarBtn: {paddingVertical: 12, paddingHorizontal: 12, borderRadius: 4, marginBottom: 6},
    sidebarBtnActive: {backgroundColor: '#c2aa3c'},
    sidebarBtnText: {fontSize: 13, fontWeight: '500', color: '#e8d27a'},
    sidebarBtnTextActive: {color: '#1d2025', fontWeight: 'bold'},
    sidebarSpacer: {flex: 1},
    sidebarBtnTextDanger: {color: '#ff6b6b'},
    content: {flex: 1, backgroundColor: '#f1f1f1', padding: 16},
    panel: {backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d3d3d3', borderRadius: 4, padding: 16},
    panelTitle: {fontSize: 17, fontWeight: '600', color: '#1d2025', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#c2aa3c', marginBottom: 16},
    placeholder: {color: '#888', fontStyle: 'italic', fontSize: 14},
});