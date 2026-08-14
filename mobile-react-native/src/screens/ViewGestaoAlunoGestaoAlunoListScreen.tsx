import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ModuleList } from '../ModuleListScreen';
import { CancelamentoModal } from '../CancelamentoModal';

// Each of these corresponds to an independent <p:commandButton ... onsuccess="PF('xxx').show()"/>
// in gestaoAluno.xhtml (olimpio.zip): every action opens its own modal dialog, they are NOT
// sequential steps of a wizard.
const ACTIONS = [
  { key: 'situacao', label: '$ Situação Financeira', empty: 'Situação financeira do aluno.' },
  { key: 'pessoais', label: 'Dados Pessoais Aluno', empty: 'Dados pessoais do aluno.' },
  { key: 'contratante', label: 'Dados Pessoais Contratante', empty: 'Dados pessoais do contratante.' },
  { key: 'historicoNap', label: 'Histórico NAP', empty: 'Histórico de atendimentos no NAP.' },
  { key: 'historicoCobranca', label: 'Histórico Cobrança', empty: 'Histórico de cobranças do aluno.' },
  { key: 'notas', label: 'Notas', empty: 'Notas do aluno.' },
  { key: 'presencas', label: 'Presenças', empty: 'Presenças do aluno.' },
  { key: 'historicoAluno', label: 'Histórico aluno', empty: 'Histórico completo do aluno.' },
] as const;

type ActionKey = (typeof ACTIONS)[number]['key'];

export default function ViewGestaoAlunoGestaoAlunoListScreen() {
  const [openAction, setOpenAction] = useState<ActionKey | null>(null);
  const [cancelamentoAberto, setCancelamentoAberto] = useState(false);
  const activeAction = ACTIONS.find((action) => action.key === openAction) ?? null;

  return (
    <View style={styles.container}>
      <ModuleList path="/api/view/gestaoAluno/gestaoAluno" title="Gestão do Aluno" />

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
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>{activeAction?.label}</Text>
            <Text style={styles.empty}>{activeAction?.empty}</Text>
            <Pressable style={styles.closeBtn} onPress={() => setOpenAction(null)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <CancelamentoModal visible={cancelamentoAberto} onClose={() => setCancelamentoAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actionsRow: { flexGrow: 0, paddingVertical: 8, paddingHorizontal: 8 },
  actionBtn: { backgroundColor: '#2e7dd7', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  dangerBtn: { backgroundColor: '#c0392b' },
  actionBtnText: { color: '#fff', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  empty: { color: '#888', fontStyle: 'italic' },
  closeBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  closeBtnText: { color: '#c0392b', fontWeight: '600' },
});
