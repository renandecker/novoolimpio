import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ModuleList } from '../ModuleListScreen';
import { MasterDetail } from '../MasterDetail';
import { Tabs } from '../Tabs';
import { Wizard } from '../Wizard';
import type { ApiItem } from '../types';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
  COMPONENTE_SOURCE,
  COMPONENTE_COLUMNS,
  COMPONENTE_SEARCH,
} from '../masterDetailSources';

function EmptyText({ children }: { children: string }) {
  return <Text style={styles.empty}>{children}</Text>;
}

/** <p:dialog id="dialogo" header="Finalizando Turma"><p:tabView> — plain tabs, not a wizard. */
function FinalizarTurmaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Finalizando Turma</Text>
          <Tabs
            tabs={[
              { key: 'matriculas', label: 'Matrículas', content: <ModuleList path="/api/educacao/matricula" /> },
              { key: 'notas', label: 'Notas', content: <EmptyText>Notas da turma.</EmptyText> },
              { key: 'presencas', label: 'Presenças', content: <EmptyText>Presenças da turma.</EmptyText> },
            ]}
          />
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> — Dias Aula / Comparativo Aula / Professor. */
function ProrrogarTurmaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Prorrogando Turma</Text>
          <Wizard
            completeLabel="Concluir"
            onComplete={onClose}
            steps={[
              { key: 'diaAula', label: 'Dias Aula', content: <ModuleList path="/api/educacao/ocorrencia-componente-curricular" /> },
              { key: 'comparativoAula', label: 'Comparativo Aula', content: <EmptyText>Comparativo de aulas.</EmptyText> },
              { key: 'selecioneProfessor', label: 'Professor', nextLabel: 'Salvar', content: <ModuleList path="/api/professor/professor" /> },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
}

/** <p:dialog header="Trocar aluno da turma"><p:wizard id="wizardtroca" showNavBar="false"> — Selecionando Aluno / Nova Turma. */
function TrocarTurmaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Trocar aluno da turma</Text>
          <Wizard
            completeLabel="Concluir"
            onComplete={onClose}
            steps={[
              { key: 'selecionarAluno', label: 'Selecionando Aluno', content: <EmptyText>Seleção de aluno.</EmptyText> },
              { key: 'novaTurma', label: 'Selecionando nova Turma', nextLabel: 'Finalizar', content: <EmptyText>Seleção de nova turma.</EmptyText> },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function ViewTurmaListTurmaListScreen() {
  const [unidades, setUnidades] = useState<ApiItem[]>([]);
  const [componentes, setComponentes] = useState<ApiItem[]>([]);
  const [finalizarAberto, setFinalizarAberto] = useState(false);
  const [prorrogarAberto, setProrrogarAberto] = useState(false);
  const [trocarAberto, setTrocarAberto] = useState(false);

  return (
    <View style={styles.container}>
      {/* Cada botão abaixo corresponde a um <p:menuitem>/<p:dialog> independente em
          listTurma.xhtml — não são etapas de um único wizard de página. */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={() => setFinalizarAberto(true)}>
          <Text style={styles.actionBtnText}>Finalizar Turma</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setProrrogarAberto(true)}>
          <Text style={styles.actionBtnText}>Cancelar ou Prorrogar</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setTrocarAberto(true)}>
          <Text style={styles.actionBtnText}>Trocar Turma</Text>
        </Pressable>
      </View>

      <ModuleList path="/api/educacao/turma" title="Turma" />

      <View style={styles.filters}>
        <MasterDetail
          label="Unidade"
          source={UNIDADE_SOURCE}
          valueKey="id"
          searchKeys={UNIDADE_SEARCH}
          columns={UNIDADE_COLUMNS}
          items={unidades}
          onChange={setUnidades}
        />
        <MasterDetail
          label="Componente Curricular"
          source={COMPONENTE_SOURCE}
          valueKey="id"
          searchKeys={COMPONENTE_SEARCH}
          columns={COMPONENTE_COLUMNS}
          items={componentes}
          onChange={setComponentes}
        />
      </View>

      <FinalizarTurmaModal visible={finalizarAberto} onClose={() => setFinalizarAberto(false)} />
      <ProrrogarTurmaModal visible={prorrogarAberto} onClose={() => setProrrogarAberto(false)} />
      <TrocarTurmaModal visible={trocarAberto} onClose={() => setTrocarAberto(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8, paddingHorizontal: 8 },
  actionBtn: { backgroundColor: '#2e7dd7', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  actionBtnText: { color: '#fff', fontWeight: '600' },
  filters: { padding: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#fff', borderRadius: 8, padding: 16, maxHeight: '90%' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  empty: { color: '#888', fontStyle: 'italic' },
  closeBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  closeBtnText: { color: '#c0392b', fontWeight: '600' },
});
