import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {ModuleList} from '../ModuleListScreen';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import {Wizard} from '../Wizard';
import type {ApiItem} from '../types';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../masterDetailSources';

function EmptyText({children}: { children: string }) {
    return <Text style={styles.empty}>{children}</Text>;
}

/** <p:dialog id="dialogo" header="Finalizando Turma"><p:tabView> — plain tabs, not a wizard. */
function FinalizarTurmaModal({visible, onClose}: { visible: boolean; onClose: () => void }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Finalizando Turma</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <Tabs
                        tabs={[
                            {
                                key: 'matriculas',
                                label: 'Matrículas',
                                content: <ModuleList path="/api/educacao/matricula"/>
                            },
                            {key: 'notas', label: 'Notas', content: <EmptyText>Notas da turma.</EmptyText>},
                            {key: 'presencas', label: 'Presenças', content: <EmptyText>Presenças da turma.</EmptyText>},
                        ]}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> — Dias Aula / Comparativo Aula / Professor. */
function ProrrogarTurmaModal({visible, onClose}: { visible: boolean; onClose: () => void }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Prorrogando Turma</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <Wizard
                        completeLabel="Concluir"
                        onComplete={onClose}
                        steps={[
                            {
                                key: 'diaAula',
                                label: 'Dias Aula',
                                content: <ModuleList path="/api/educacao/ocorrencia-componente-curricular"/>
                            },
                            {
                                key: 'comparativoAula',
                                label: 'Comparativo Aula',
                                content: <EmptyText>Comparativo de aulas.</EmptyText>
                            },
                            {
                                key: 'selecioneProfessor',
                                label: 'Professor',
                                nextLabel: 'Salvar',
                                content: <ModuleList path="/api/professor/professor"/>
                            },
                        ]}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/** <p:dialog header="Trocar aluno da turma"><p:wizard id="wizardtroca" showNavBar="false"> — Selecionando Aluno / Nova Turma. */
function TrocarTurmaModal({visible, onClose}: { visible: boolean; onClose: () => void }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Trocar aluno da turma</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <Wizard
                        completeLabel="Concluir"
                        onComplete={onClose}
                        steps={[
                            {
                                key: 'selecionarAluno',
                                label: 'Selecionando Aluno',
                                content: <EmptyText>Seleção de aluno.</EmptyText>
                            },
                            {
                                key: 'novaTurma',
                                label: 'Selecionando nova Turma',
                                nextLabel: 'Finalizar',
                                content: <EmptyText>Seleção de nova turma.</EmptyText>
                            },
                        ]}
                    />
                </Pressable>
            </Pressable>
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

            <ModuleList path="/api/educacao/turma" title="Turma"/>

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

            <FinalizarTurmaModal visible={finalizarAberto} onClose={() => setFinalizarAberto(false)}/>
            <ProrrogarTurmaModal visible={prorrogarAberto} onClose={() => setProrrogarAberto(false)}/>
            <TrocarTurmaModal visible={trocarAberto} onClose={() => setTrocarAberto(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    actionsRow: {flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8, paddingHorizontal: 8},
    actionBtn: {
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginRight: 8,
        marginBottom: 8,
        shadowColor: '#2a5a88',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    actionBtnText: {color: '#fff', fontWeight: '600', fontSize: 14},
    filters: {padding: 8},
    overlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.55)', justifyContent: 'center', padding: 16},
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
