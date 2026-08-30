import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {ModuleList} from './ModuleListScreen';
import {Wizard} from './Wizard';

interface CancelamentoModalProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Mobile equivalent of <p:dialog widgetVar="cancelamento">…<p:wizard widgetVar="wizardCancelamento">
 * found in olimpio.zip (gestaoAluno.xhtml and listDesistente.xhtml). It is opened by an action
 * button ("Cancelamento de Contrato") — it is not a step embedded in a page-level wizard/tabs.
 */
export function CancelamentoModal({visible, onClose}: CancelamentoModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Cancelamento</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <View style={styles.divider}/>
                    <Wizard
                        completeLabel="Concluir"
                        onComplete={onClose}
                        steps={[
                            {
                                key: 'indivname',
                                label: 'Regra',
                                content: <ModuleList path="/api/educacao/desistente"/>,
                            },
                            {
                                key: 'cancelamento',
                                label: 'Cancelamento',
                                nextLabel: 'Finalizar',
                                content: <ModuleList path="/api/educacao/matricula"/>,
                            },
                        ]}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 32, 37, 0.55)',
        justifyContent: 'center',
        padding: 16
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxHeight: '90%',
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
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
});
