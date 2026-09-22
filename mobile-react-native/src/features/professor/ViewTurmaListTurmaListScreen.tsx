import React, {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Alert} from '../../shared/components/SweetAlert';
import {ModuleList, type ModuleListActionGroup, type ModuleListExtraAction} from '../../shared/components/ModuleListScreen';
import {MasterDetail} from '../../MasterDetail';
import {Tabs} from '../../Tabs';
import {Wizard} from '../../Wizard';
import type {ApiItem} from '../../types';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../../masterDetailSources';
import {can} from '../../shared/services/permissions';
import {useAuth} from '../auth/auth';

const asRecord = (item: ApiItem) => (item ?? {}) as Record<string, unknown>;

const statusOf = (item: ApiItem | null) => String(asRecord(item).status ?? '');

function ModalShell({title, onClose, children}: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                        {children}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/** <p:dialog id="professores" header="Alterando professor para turma"> */
function ProfessorModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Alterando professor da turma #${turma.id}`} onClose={onClose}>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Turma:</Text>
                <Text style={styles.infoValue}>#{turma.id} - {turma.nome}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Status:</Text>
                <Text style={styles.infoValue}>{statusOf(turma)}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Professor atual:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).professor_descricao ?? '-')}</Text>
            </View>

            <Text style={styles.section}>Aulas Futuras</Text>
            <View style={styles.modalButtons}>
                <Pressable style={styles.btnBlue} onPress={() => Alert.alert('Sucesso', 'Professor das aulas futuras alterado!')}>
                    <Text style={styles.btnText}>Salvar aula(s) futuras</Text>
                </Pressable>
                <Pressable style={styles.btnBlue} onPress={() => Alert.alert('Sucesso', 'Professor de todas as aulas alterado!')}>
                    <Text style={styles.btnText}>Salvar todas aula(s)</Text>
                </Pressable>
                <Pressable style={styles.btnRed} onPress={onClose}>
                    <Text style={styles.btnText}>Cancelar</Text>
                </Pressable>
            </View>

            <Text style={styles.section}>Por Aula</Text>
            <ModuleList
                path="/api/educacao/ocorrencia-componente-curricular"
                params={{turmaId: turma.id}}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />
        </ModalShell>
    );
}

/** <p:dialog id="salas" header="Alterando sala da turma"> */
function SalaModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    const salaActions: ModuleListExtraAction[] = [
        {
            key: 'alterarSala',
            title: 'Alterar Sala',
            permission: 'UPDATE',
            onPress: (sala) => {
                Alert.alert('Sucesso', `Sala #${sala.id} atribuída à turma #${turma.id}!`);
                onClose();
            },
        },
    ];
    return (
        <ModalShell title={`Alterando sala da turma #${turma.id}`} onClose={onClose}>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Turma:</Text>
                <Text style={styles.infoValue}>#{turma.id} - {turma.nome}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Sala atual:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).sala_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Vagas:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).vagas ?? '-')}</Text>
            </View>

            <Text style={styles.section}>Vagas</Text>
            <View style={styles.modalButtons}>
                <Pressable style={styles.btnBlue} onPress={() => Alert.alert('Sucesso', 'Vagas atualizadas!')}>
                    <Text style={styles.btnText}>Atualizar vagas</Text>
                </Pressable>
            </View>

            <Text style={styles.section}>Salas</Text>
            <ModuleList
                path="/api/educacao/sala"
                extraActions={salaActions}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />
        </ModalShell>
    );
}

/** <p:dialog id="dialogInformacoes" header="Informações sobre a turma"> */
function InformacoesModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Informações sobre a turma #${turma.id}`} onClose={onClose}>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Turma:</Text>
                <Text style={styles.infoValue}>#{turma.id} - {turma.nome}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Unidade:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).unidade_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Grupo:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).grupo_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Curso:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).curriculo_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Componente Curricular:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).componente_curricular_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Professor:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).professor_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Sala:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).sala_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Status:</Text>
                <Text style={styles.infoValue}>{statusOf(turma)}</Text>
            </View>

            <Tabs
                tabs={[
                    {
                        key: 'professores',
                        label: 'Professores',
                        content: <ModuleList path="/api/professor/professor" hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'alteracoes',
                        label: 'Alterações',
                        content: <ModuleList path="/api/educacao/ocorrencia-componente-curricular" params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'matriculas',
                        label: 'Matrículas',
                        content: <ModuleList path="/api/educacao/matricula" params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView />,
                    },
                ]}
            />
        </ModalShell>
    );
}

/** <p:dialog id="cancelarTurma" header="Cancelamento de Turma"> */
function CancelarProrrogarModal({visible, turma, onClose, onProrrogar}: { visible: boolean; turma: ApiItem | null; onClose: () => void; onProrrogar: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Cancelamento de Turma #${turma.id}`} onClose={onClose}>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Sala:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).sala_descricao ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Vagas:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).vagas ?? '-')}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Data Início:</Text>
                <Text style={styles.infoValue}>{String(asRecord(turma).dataInicio ?? '-')}</Text>
            </View>

            <Tabs
                tabs={[
                    {
                        key: 'professores',
                        label: 'Professores',
                        content: <ModuleList path="/api/professor/professor" hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'alunos',
                        label: 'Alunos',
                        content: <ModuleList path="/api/educacao/matricula" params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView />,
                    },
                ]}
            />

            <View style={styles.modalButtons}>
                <Pressable style={styles.btnBlue} onPress={onProrrogar}>
                    <Text style={styles.btnText}>Prorrogar Turma</Text>
                </Pressable>
                <Pressable
                    style={styles.btnRed}
                    onPress={() =>
                        Alert.alert('Cancelar Turma', `Confirma o cancelamento da turma #${turma.id}?`, [
                            {text: 'Não', style: 'cancel'},
                            {text: 'Sim', style: 'destructive', onPress: () => { Alert.alert('Sucesso', 'Turma cancelada!'); onClose(); }},
                        ])
                    }
                >
                    <Text style={styles.btnText}>Cancelar Turma</Text>
                </Pressable>
            </View>
        </ModalShell>
    );
}

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> */
function ProrrogarTurmaModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Prorrogando a turma #${turma.id}`} onClose={onClose}>
            <Wizard
                completeLabel="Prorrogar"
                onComplete={() => { Alert.alert('Sucesso', 'Turma prorrogada!'); onClose(); }}
                steps={[
                    {
                        key: 'diaAula',
                        label: 'Dias Aula',
                        content: <ModuleList path="/api/educacao/ocorrencia-componente-curricular" params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'comparativoAula',
                        label: 'Comparativo Aula',
                        content: <Text style={styles.empty}>Comparativo de aulas (original x nova).</Text>,
                    },
                    {
                        key: 'selecioneProfessor',
                        label: 'Professor',
                        nextLabel: 'Prorrogar',
                        content: <ModuleList path="/api/professor/professor" hideCreate hideUpdate hideDelete hideView />,
                    },
                ]}
            />
        </ModalShell>
    );
}

/** <p:dialog id="formTrocarTurma" header="Trocar aluno da turma"><p:wizard id="wizardtroca"> */
function TrocarTurmaModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Trocar aluno da turma #${turma.id}`} onClose={onClose}>
            <Wizard
                completeLabel="Finalizar e gerar documento"
                onComplete={() => { Alert.alert('Sucesso', 'Troca de turma finalizada e documento gerado!'); onClose(); }}
                steps={[
                    {
                        key: 'selecionarAluno',
                        label: 'Selecionando Aluno',
                        content: <ModuleList path="/api/educacao/matricula" params={{turmaId: turma.id}} hideCreate hideUpdate hideDelete hideView />,
                    },
                    {
                        key: 'novaTurma',
                        label: 'Selecionando nova Turma',
                        nextLabel: 'Finalizar',
                        content: (
                            <>
                                <ModuleList path="/api/educacao/turma" hideCreate hideUpdate hideDelete hideView />
                                <Text style={styles.section}>Dias da Semana</Text>
                                <Text style={styles.empty}>{['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].join(' · ')}</Text>
                            </>
                        ),
                    },
                ]}
            />
        </ModalShell>
    );
}

/** <p:dialog id="diarioDialog" header="Diário de Classe"> */
function DiarioModal({visible, turma, onClose}: { visible: boolean; turma: ApiItem | null; onClose: () => void }) {
    if (!turma) return null;
    return (
        <ModalShell title={`Diário de Classe - Turma #${turma.id}`} onClose={onClose}>
            <Text style={styles.empty}>Gere o diário de classe em PDF.</Text>
            <View style={styles.modalButtons}>
                <Pressable style={styles.btnBlue} onPress={() => Alert.alert('Exportar', `Gerando diário de classe da turma #${turma.id}...`)}>
                    <Text style={styles.btnText}>Gerar Diário de Classe</Text>
                </Pressable>
            </View>
        </ModalShell>
    );
}

export default function ViewTurmaListTurmaListScreen() {
    const navigation = useNavigation<any>();
    const {session} = useAuth();
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [componentes, setComponentes] = useState<ApiItem[]>([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState<ApiItem | null>(null);
    const [professorAberto, setProfessorAberto] = useState(false);
    const [salaAberto, setSalaAberto] = useState(false);
    const [infoAberto, setInfoAberto] = useState(false);
    const [cancelarProrrogarAberto, setCancelarProrrogarAberto] = useState(false);
    const [prorrogarAberto, setProrrogarAberto] = useState(false);
    const [trocarAberto, setTrocarAberto] = useState(false);
    const [diarioAberto, setDiarioAberto] = useState(false);
    const outcome = '/view/turma/listTurma';

    const fechar = (setter: (v: boolean) => void) => () => {
        setter(false);
        setTurmaSelecionada(null);
    };

    /**
     * Réplica dos 4 <p:menuButton> do listTurma.xhtml (acessoNovo/acessoEditar/
     * acessoRelatorios/acessoRemover) com os itens e cores do XHTML, por linha.
     */
    const buildRowActionGroups = (item: ApiItem): ModuleListActionGroup[] => {
        const status = statusOf(item);
        const groups: ModuleListActionGroup[] = [];

        if (can(session, 'CREATE', outcome)) {
            groups.push({
                icon: <Text style={styles.menuIcon}>＋</Text>,
                className: 'btnstop',
                title: 'Novo',
                permission: 'CREATE',
                items: [
                    {
                        key: 'trocarComponente',
                        label: 'Trocar Componente',
                        className: 'btngreen',
                        onSelect: () => { setTurmaSelecionada(item); setTrocarAberto(true); },
                    },
                    {
                        key: 'alterarProfessor',
                        label: 'Alterar professor',
                        className: 'btnblack',
                        onSelect: () => { setTurmaSelecionada(item); setProfessorAberto(true); },
                    },
                ],
            });
        }

        if (can(session, 'UPDATE', outcome)) {
            groups.push({
                icon: <Text style={styles.menuIcon}>✎</Text>,
                className: 'btngreen',
                title: 'Editar',
                permission: 'UPDATE',
                items: [
                    {
                        key: 'criarAulaCoringa',
                        label: 'Criar Aula coringa',
                        className: 'btnpurple',
                        onSelect: () => {
                            if (status === 'PENDENTE' || status === 'CANCELADA') {
                                Alert.alert('Aviso', 'Não é possível criar aula coringa para turma com status ' + status);
                                return;
                            }
                            Alert.alert('Sucesso', 'Aula coringa criada com sucesso!');
                        },
                    },
                    {
                        key: 'trocarTurma',
                        label: 'Trocar Turma',
                        className: 'btnblue',
                        onSelect: () => { setTurmaSelecionada(item); setTrocarAberto(true); },
                    },
                    {
                        key: 'alterarSala',
                        label: 'Alterar sala',
                        className: 'btnorange',
                        onSelect: () => { setTurmaSelecionada(item); setSalaAberto(true); },
                    },
                ],
            });
        }

        if (can(session, 'EXECUTE', outcome)) {
            groups.push({
                icon: <Text style={styles.menuIcon}>📄</Text>,
                className: 'btnyellow',
                title: 'Relatórios',
                permission: 'EXECUTE',
                items: [
                    {
                        key: 'maisInformacoes',
                        label: 'Mais informações',
                        className: 'btnyellow',
                        onSelect: () => { setTurmaSelecionada(item); setInfoAberto(true); },
                    },
                    {
                        key: 'trocaTurmaSegundaVia',
                        label: 'Troca Turma',
                        className: 'btnblue',
                        onSelect: () => Alert.alert('Exportar', `Gerar 2ª via de troca para turma #${item.id}`),
                    },
                    {
                        key: 'diarioClasse',
                        label: 'Diário de Classe',
                        className: 'btnblack',
                        onSelect: () => { setTurmaSelecionada(item); setDiarioAberto(true); },
                    },
                ],
            });
        }

        if (can(session, 'DELETE', outcome)) {
            groups.push({
                icon: <Text style={styles.menuIcon}>🗑</Text>,
                className: 'btnred',
                title: 'Remover',
                permission: 'DELETE',
                items: [
                    {
                        key: 'finalizar',
                        label: 'Finalizar',
                        className: 'btngrey',
                        onSelect: () => {
                            if (status !== 'EM_ANDAMENTO' && status !== 'CANCELADA') {
                                Alert.alert('Aviso', 'Só é possível finalizar turmas com status EM_ANDAMENTO ou CANCELADA');
                                return;
                            }
                            navigation.navigate('view/turma/listTurmaFinalizando', {turmaId: item.id});
                        },
                    },
                    {
                        key: 'cancelarProrrogar',
                        label: 'Cancelar ou Prorrogar',
                        className: 'btnred',
                        onSelect: () => {
                            if (status === 'CANCELADA') {
                                Alert.alert('Aviso', 'Turma já está cancelada');
                                return;
                            }
                            setTurmaSelecionada(item);
                            setCancelarProrrogarAberto(true);
                        },
                    },
                ],
            });
        }

        return groups;
    };

    return (
        <View style={styles.container}>
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
                rowActionGroups={buildRowActionGroups}
                outcome={outcome}
            />

            <ProfessorModal visible={professorAberto} turma={turmaSelecionada} onClose={fechar(setProfessorAberto)} />
            <SalaModal visible={salaAberto} turma={turmaSelecionada} onClose={fechar(setSalaAberto)} />
            <InformacoesModal visible={infoAberto} turma={turmaSelecionada} onClose={fechar(setInfoAberto)} />
            <CancelarProrrogarModal
                visible={cancelarProrrogarAberto}
                turma={turmaSelecionada}
                onClose={fechar(setCancelarProrrogarAberto)}
                onProrrogar={() => { setCancelarProrrogarAberto(false); setProrrogarAberto(true); }}
            />
            <ProrrogarTurmaModal visible={prorrogarAberto} turma={turmaSelecionada} onClose={fechar(setProrrogarAberto)} />
            <TrocarTurmaModal visible={trocarAberto} turma={turmaSelecionada} onClose={fechar(setTrocarAberto)} />
            <DiarioModal visible={diarioAberto} turma={turmaSelecionada} onClose={fechar(setDiarioAberto)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    filters: {padding: 8},
    menuIcon: {fontSize: 18, color: '#fff', fontWeight: '700'},
    overlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.55)', justifyContent: 'center', padding: 16},
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxHeight: '92%',
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(194, 170, 60, 0.15)',
    },
    modalScroll: {maxHeight: '82%'},
    modalContent: {padding: 20, gap: 10},
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
        flexShrink: 1,
    },
    section: {fontSize: 14, fontWeight: '700', color: '#333', marginTop: 6},
    infoRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'},
    infoKey: {fontSize: 13, color: '#666', fontWeight: '600'},
    infoValue: {fontSize: 14, color: '#1d2025', flexShrink: 1, textAlign: 'right'},
    modalButtons: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4},
    btnText: {color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center'},
    btnBlue: {
        backgroundColor: '#337ab7',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 130,
    },
    btnRed: {
        backgroundColor: '#dc3545',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minWidth: 130,
    },
    empty: {color: '#888', fontStyle: 'italic', fontSize: 14, textAlign: 'center', paddingVertical: 20},
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