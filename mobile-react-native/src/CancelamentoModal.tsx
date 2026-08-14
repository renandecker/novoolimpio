import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ModuleList } from './ModuleListScreen';
import { Wizard } from './Wizard';

interface CancelamentoModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Mobile equivalent of <p:dialog widgetVar="cancelamento">…<p:wizard widgetVar="wizardCancelamento">
 * found in olimpio.zip (gestaoAluno.xhtml and listDesistente.xhtml). It is opened by an action
 * button ("Cancelamento de Contrato") — it is not a step embedded in a page-level wizard/tabs.
 */
export function CancelamentoModal({ visible, onClose }: CancelamentoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Cancelamento</Text>
          <Wizard
            completeLabel="Concluir"
            onComplete={onClose}
            steps={[
              {
                key: 'indivname',
                label: 'Regra',
                content: <ModuleList path="/api/educacao/desistente" />,
              },
              {
                key: 'cancelamento',
                label: 'Cancelamento',
                nextLabel: 'Finalizar',
                content: <ModuleList path="/api/educacao/matricula" />,
              },
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

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: '#fff', borderRadius: 8, padding: 16, maxHeight: '90%' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  closeBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16 },
  closeBtnText: { color: '#c0392b', fontWeight: '600' },
});
