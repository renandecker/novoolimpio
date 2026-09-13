import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {ModuleList} from '../ModuleListScreen';
import {CancelamentoModal} from '../CancelamentoModal';
import {RowMenu, type RowMenuItem} from '../../shared/components/RowMenu';

// Actions grouped by category - mirrors <p:menuButton> groups in gestaoAluno.xhtml
const ACTION_GROUPS = [
    {
        icon: <Text style={{fontSize: 20}}>💰</Text>,
        className: 'btnblue',
        title: 'Financeiro',
        items: [
            {key: 'situacao', label: '$ Situação Financeira', className: 'btnblue', onSelect: () => setOpenAction('situacao')},
        ] as RowMenuItem[],
    },
    {
        icon: <Text style={{fontSize: 20}}>👤</Text>,
        className: 'btngreen',
        title: 'Dados Pessoais',
        items: [
            {key: 'pessoais', label: 'Dados Pessoais Aluno', className: 'btngreen', onSelect: () => setOpenAction('pessoais')},
            {key: 'contratante', label: 'Dados Pessoais Contratante', className: 'btnstop', onSelect: () => setOpenAction('contratante')},
        ] as RowMenuItem[],
    },
    {
        icon: <Text style={{fontSize: 20}}>📋</Text>,
        className: 'btnyellow',
        title: 'Históricos',
        items: [
            {key: 'historicoNap', label: 'Histórico NAP', className: 'btnsky', onSelect: () => setOpenAction('historicoNap')},
            {key: 'historicoCobranca', label: 'Histórico Cobrança', className: 'btnpurple', onSelect: () => setOpenAction('historicoCobranca')},
        ] as RowMenuItem[],
    },
    {
        icon: <Text style={{fontSize: 20}}>📚</Text>,
        className: 'btnblack',
        title: 'Acadêmico',
        items: [
            {key: 'notas', label: 'Notas', className: 'btnblack', onSelect: () => setOpenAction('notas')},
            {key: 'presencas', label: 'Presenças', className: 'btnbrown', onSelect: () => setOpenAction('presencas')},
            {key: 'historicoAluno', label: 'Histórico aluno', className: 'btnpink', onSelect: () => setOpenAction('historicoAluno')},
        ] as RowMenuItem[],
    },
    {
        icon: <Text style={{fontSize: 20}}>⚠️</Text>,
        className: 'btnred',
        title: 'Outros',
        items: [
            {key: 'desistente', label: 'Desistente', className: 'btnpink', onSelect: () => setOpenAction('desistente')},
            {key: 'cancelamento', label: 'Cancelamento de Contrato', className: 'btnred', onSelect: () => setCancelamentoAberto(true)},
        ] as RowMenuItem[],
    },
];

type ActionKey = 'situacao' | 'pessoais' | 'contratante' | 'historicoNap' | 'historicoCobranca' | 'notas' | 'presencas' | 'historicoAluno' | 'desistente' | null;

const ACTION_EMPTY: Record<Exclude<ActionKey, null>, string> = {
    situacao: 'Situação financeira do aluno.',
    pessoais: 'Dados pessoais do aluno.',
    contratante: 'Dados pessoais do contratante.',
    historicoNap: 'Histórico de atendimentos no NAP.',
    historicoCobranca: 'Histórico de cobranças do aluno.',
    notas: 'Notas do aluno.',
    presencas: 'Presenças do aluno.',
    historicoAluno: 'Histórico completo do aluno.',
    desistente: 'Notificar aluno desistente.',
};

export default function ViewGestaoAlunoGestaoAlunoListScreen() {
    const [openAction, setOpenAction] = useState<ActionKey>(null);
    const [cancelamentoAberto, setCancelamentoAberto] = useState(false);

    return (
        <View style={styles.container}>
            <ModuleList path="/api/view/gestaoAluno/gestaoAluno" title="Gestão do Aluno"/>

            <View style={styles.actionsRow}>
                {ACTION_GROUPS.map((group) => (
                    <RowMenu
                        key={group.className}
                        icon={group.icon}
                        className={group.className}
                        title={group.title}
                        items={group.items}
                        triggerStyle={styles.actionGroupTrigger}
                    />
                ))}
            </View>

            <Modal visible={!!openAction} transparent animationType="fade" onRequestClose={() => setOpenAction(null)}>
                <Pressable style={styles.overlay} onPress={() => setOpenAction(null)}>
                    <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {ACTION_GROUPS.flatMap(g => g.items).find(a => a.key === openAction)?.label ?? ''}
                            </Text>
                            <Pressable style={styles.closeBtn} onPress={() => setOpenAction(null)}
                                       accessibilityLabel="Fechar">
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.empty}>{ACTION_EMPTY[openAction as Exclude<ActionKey, null>] ?? ''}</Text>
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
    actionsRow: {flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8, paddingHorizontal: 8, gap: 8},
    actionGroupTrigger: {marginRight: 4},
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
