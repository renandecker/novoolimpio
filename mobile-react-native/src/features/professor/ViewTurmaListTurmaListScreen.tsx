import React, {useState, useCallback} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {ModuleList, type ModuleListExtraAction} from '../../shared/components/ModuleListScreen';
import {MasterDetail} from '../../MasterDetail';
import {Tabs} from '../../Tabs';
import {Wizard} from '../../Wizard';
import type {ApiItem} from '../../types';
import {useAuth} from '../../shared/services/auth';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../../masterDetailSources';
import {can} from '../../shared/services/permissions';

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
                                content: <ModuleList path="/api/view/professor/listProfessor"/>
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

function InformacoesModal({visible, onClose, turmaId}: { visible: boolean; onClose: () => void; turmaId: number | null }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Informações da Turma</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <View style={styles.modalContent}>
                        <EmptyText>Detalhes da turma #{turmaId}</EmptyText>
                    </View>
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
    const [infoAberto, setInfoAberto] = useState(false);
    const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<number | null>(null);
    const outcome = '/view/turma/listTurma';

    const buildExtraActions = useCallback((): ModuleListExtraAction[] => {
        const actions: ModuleListExtraAction[] = [];

        // CREATE permission actions (acessoNovo)
        if (can('CREATE', outcome)) {
            actions.push({
                key: 'trocarComponente',
                title: 'Trocar Componente',
                icon: '⇄',
                permission: 'CREATE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would call API to load students for component swap
                    setTrocarAberto(true);
                },
            });
            actions.push({
                key: 'alterarProfessor',
                title: 'Alterar Professor',
                icon: '👤',
                permission: 'CREATE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would call API to get professors
                    Alert.alert('Alterar Professor', `Abrir seleção de professor para turma #${item.id}`);
                },
            });
        }

        // UPDATE permission actions (acessoEditar)
        if (can('UPDATE', outcome)) {
            actions.push({
                key: 'criarAulaCoringa',
                title: 'Criar Aula Coringa',
                icon: '📅',
                permission: 'UPDATE',
                onPress: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status === 'PENDENTE' || status === 'CANCELADA') {
                        Alert.alert('Aviso', 'Não é possível criar aula coringa para turma com status ' + status);
                        return;
                    }
                    // Would call API to recreate calendar
                    Alert.alert('Sucesso', 'Aula coringa criada com sucesso!');
                },
            });
            actions.push({
                key: 'trocarTurma',
                title: 'Trocar Turma',
                icon: '⇄',
                permission: 'UPDATE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would call API to load students
                    setTrocarAberto(true);
                },
            });
            actions.push({
                key: 'alterarSala',
                title: 'Alterar Sala',
                icon: '🏫',
                permission: 'UPDATE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would call API to get salas
                    Alert.alert('Alterar Sala', `Abrir seleção de sala para turma #${item.id}`);
                },
            });
        }

        // EXECUTE/REPORTS permission actions (acessoRelatorios)
        if (can('EXECUTE', outcome)) {
            actions.push({
                key: 'maisInformacoes',
                title: 'Mais Informações',
                icon: 'ℹ️',
                permission: 'EXECUTE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would call API to load info
                    setInfoAberto(true);
                },
            });
            actions.push({
                key: 'segundaViaTroca',
                title: '2ª Via Troca Turma',
                icon: '📄',
                permission: 'EXECUTE',
                onPress: (item) => {
                    // Would open PDF in browser
                    Alert.alert('Exportar', `Gerar 2ª via de troca para turma #${item.id}`);
                },
            });
            actions.push({
                key: 'diarioClasse',
                title: 'Diário de Classe',
                icon: '📋',
                permission: 'EXECUTE',
                onPress: async (item) => {
                    setTurmaSelecionadaId(item.id);
                    // Would open diario de classe modal
                    Alert.alert('Diário de Classe', `Abrir diário de classe para turma #${item.id}`);
                },
            });
        }

        // DELETE/REMOVE permission actions (acessoRemover)
        if (can('DELETE', outcome)) {
            actions.push({
                key: 'finalizar',
                title: 'Finalizar',
                icon: '✓',
                permission: 'DELETE',
                onPress: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status !== 'EM_ANDAMENTO' && status !== 'CANCELADA') {
                        Alert.alert('Aviso', 'Só é possível finalizar turmas com status EM_ANDAMENTO ou CANCELADA');
                        return;
                    }
                    setTurmaSelecionadaId(item.id);
                    // Would call API to list matriculas
                    setFinalizarAberto(true);
                },
            });
            actions.push({
                key: 'cancelarProrrogar',
                title: 'Cancelar ou Prorrogar',
                icon: '✕',
                permission: 'DELETE',
                onPress: async (item) => {
                    const record = item as unknown as Record<string, unknown>;
                    const status = String(record.status ?? '');
                    if (status === 'CANCELADA') {
                        Alert.alert('Aviso', 'Turma já está cancelada');
                        return;
                    }
                    setTurmaSelecionadaId(item.id);
                    // Would call API to load students
                    setProrrogarAberto(true);
                },
            });
        }

        return actions;
    }, [outcome]);

    const extraActions = buildExtraActions();

    return (
        <View style={styles.container}>
            {/* Cada botão abaixo corresponde a um <p:menuitem>/<p:dialog> independente em
          listTurma.xhtml — não são etapas de um único wizard de página. */}
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

            <ModuleList
                path="/api/educacao/turma"
                title="Turma"
                extraActions={extraActions}
                outcome={outcome}
            />

            <FinalizarTurmaModal visible={finalizarAberto} onClose={() => { setFinalizarAberto(false); setTurmaSelecionadaId(null); }}/>
            <ProrrogarTurmaModal visible={prorrogarAberto} onClose={() => { setProrrogarAberto(false); setTurmaSelecionadaId(null); }}/>
            <TrocarTurmaModal visible={trocarAberto} onClose={() => { setTrocarAberto(false); setTurmaSelecionadaId(null); }}/>
            <InformacoesModal visible={infoAberto} onClose={() => { setInfoAberto(false); setTurmaSelecionadaId(null); }} turmaId={turmaSelecionadaId}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
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
    modalContent: {
        padding: 20,
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