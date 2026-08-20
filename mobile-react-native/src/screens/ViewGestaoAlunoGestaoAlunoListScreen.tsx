import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ModuleList} from '../ModuleListScreen';
import {CancelamentoModal} from '../CancelamentoModal';

// Each of these corresponds to an independent <p:commandButton ... onsuccess="PF('xxx').show()"/>
// in gestaoAluno.xhtml (olimpio.zip): every action opens its own modal dialog, they are NOT
// sequential steps of a wizard.
const ACTIONS = [
    {key: 'situacao', label: '$ Situação Financeira', empty: 'Situação financeira do aluno.'},
    {key: 'pessoais', label: 'Dados Pessoais Aluno', empty: 'Dados pessoais do aluno.'},
    {key: 'contratante', label: 'Dados Pessoais Contratante', empty: 'Dados pessoais do contratante.'},
    {key: 'historicoNap', label: 'Histórico NAP', empty: 'Histórico de atendimentos no NAP.'},
    {key: 'historicoCobranca', label: 'Histórico Cobrança', empty: 'Histórico de cobranças do aluno.'},
    {key: 'notas', label: 'Notas', empty: 'Notas do aluno.'},
    {key: 'presencas', label: 'Presenças', empty: 'Presenças do aluno.'},
    {key: 'historicoAluno', label: 'Histórico aluno', empty: 'Histórico completo do aluno.'},
] as
const ;

type ActionKey = (typeof ACTIONS)[number]['key'];

export default function ViewGestaoAlunoGestaoAlunoListScreen() {
    const [openAction, setOpenAction] = useState<ActionKey | null>(null);
    const [cancelamentoAberto, setCancelamentoAberto] = useState(false);
    const activeAction = ACTIONS.find((action) => action.key === openAction) ?? null;

    return (
        <View style={styles.container}>
            <ModuleList path="/api/view/gestaoAluno/gestaoAluno" title="Gestão do Aluno"/>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow}>
                {ACTIONS.map((action) => (
                    <Pressable key={action.key} style={styles.actionBtn} onPress={() => setOpenAction(action.key)}>
                        <Text style={styles.actionBtnText}>{action.label}</Text>
                    </Pressable>
                ))}
                <Pressable style={[styles.actionBtn, styles.dangerBtn]} onPress={() => setCancelamentoAberto(true)}>
                    <Text style={styles.actionBtnText}>Cancelamento de Contrato</Text>
                </Pressable>
            </ScrollView>

            <Modal visible={!!activeAction} transparent animationType="fade" onRequestClose={() => setOpenAction(null)}>
                <Pressable style={styles.overlay} onPress={() => setOpenAction(null)}>
                    <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{activeAction?.label}</Text>
                            <Pressable style={styles.closeBtn} onPress={() => setOpenAction(null)}
                                       accessibilityLabel="Fechar">
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.empty}>{activeAction?.empty}</Text>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <CancelamentoModal visible={cancelamentoAberto} onClose={() => setCancelamentoAberto(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    actionsRow: {flexGrow: 0, paddingVertical: 8, paddingHorizontal: 8},
    actionBtn: {
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginRight: 8,
        shadowColor: '#2a5a88',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    dangerBtn: {backgroundColor: '#b93f2a'},
    actionBtnText: {color: '#fff', fontWeight: '600', fontSize: 14},
    overlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.55)', justifyContent: 'center', padding: 16},
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(194, 170, 60, 0.15)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#2f333b',
        borderBottomWidth: 3,
        borderBottomColor: '#c2aa3c',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    modalContent: {padding: 20},
    empty: {color: '#888', fontStyle: 'italic', fontSize: 14},
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: '#e8d27a',
        fontSize: 18,
        fontWeight: '500',
    },
});
