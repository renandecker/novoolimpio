import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {MasterDetail} from '../../MasterDetail';
import {Tabs} from '../../Tabs';
import {Wizard} from '../../shared/components/Wizard';
import {
    ModuleList,
    type ModuleListExtraAction,
} from '../../shared/components/ModuleListScreen';
import {Alert} from '../../shared/components/SweetAlert';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../shared/styles/theme';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
    TURMA_SOURCE,
    TURMA_COLUMNS,
    TURMA_SEARCH,
} from '../../masterDetailSources';

const asRecord = (item: ApiItem | null) => (item ?? {}) as unknown as Record<string, unknown>;
const val = (v: unknown): string => (v === null || v === undefined ? '-' : String(v));

/* Formatação de data dd/MM/yyyy (espelha formatDate das telas de referência). */
const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const statusOf = (item: ApiItem): string => String(asRecord(item).status ?? '');

const apiErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
    ?? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    ?? (error as Error)?.message
    ?? 'erro desconhecido';

/* ============================== Componentes de apoio ============================== */

function ModalShell({
    title,
    onClose,
    children,
    footer,
    full,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
    full?: boolean;
}) {
    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modalCard, full && styles.modalCardFull]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {children}
                    {footer ? <View style={styles.modalFooter}>{footer}</View> : null}
                </View>
            </View>
        </Modal>
    );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {children}
        </View>
    );
}

function InfoRow({label, value}: {label: string; value: string}) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

function Btn({
    label,
    color,
    onPress,
    disabled,
    flex,
}: {
    label: string;
    color: string;
    onPress: () => void;
    disabled?: boolean;
    flex?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: color}, disabled && styles.btnDisabled, flex && {flex: 1}]}
            disabled={disabled}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.actionBtnText}>{label}</Text>
        </TouchableOpacity>
    );
}

function SearchBox({
    placeholder,
    value,
    onChange,
}: {
    placeholder: string;
    value: string;
    onChange: (text: string) => void;
}) {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.textPlaceholder}
            value={value}
            onChangeText={onChange}
        />
    );
}

function BuscaLista({
    items,
    searchKeys,
    renderItem,
    emptyText = 'Nenhum registro encontrado.',
}: {
    items: ApiItem[];
    searchKeys: string[];
    renderItem: (item: ApiItem) => React.ReactNode;
    emptyText?: string;
}) {
    const [query, setQuery] = useState('');
    const filtered = items.filter((item) => {
        if (!query.trim()) return true;
        const record = asRecord(item);
        const haystack = searchKeys.map((key) => String(record[key] ?? '')).join(' ').toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
    });

    return (
        <View style={styles.listaBox}>
            <SearchBox placeholder="Buscar..." value={query} onChange={setQuery} />
            <ScrollView style={styles.listaScroll}>
                {filtered.length === 0 ? <Text style={styles.emptyText}>{emptyText}</Text> : filtered.map((item) => renderItem(item))}
            </ScrollView>
        </View>
    );
}

function Spinner({label = 'Carregando...'}: {label?: string}) {
    return (
        <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>{label}</Text>
        </View>
    );
}

/* ============================== Modais (acessos do listTurma.xhtml) ============================== */

function ProfessorModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [professores, setProfessores] = useState<ApiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecionado, setSelecionado] = useState<string>(String(record.professor_id ?? ''));

    useEffect(() => {
        let active = true;
        api.get('/api/view/professor/listProfessor')
            .then((res) => res.data as { content?: ApiItem[] })
            .then((body) => {
                if (!active) return;
                setProfessores(Array.isArray(body) ? body : body.content ?? []);
            })
            .catch(() => {})
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const salvar = async () => {
        if (!selecionado) {
            Alert.alert('Alterar professor', 'Selecione um professor.');
            return;
        }
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/salvar-professor`, {professorId: Number(selecionado)});
            Alert.alert('Alterar professor', 'Professor alterado com sucesso!', [{text: 'OK', onPress: onClose}]);
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Alterar Professor"
            onClose={onClose}
            footer={
                <>
                    <Btn label="Cancelar" color={Colors.btnRed} onPress={onClose} />
                    <Btn label="Salvar" color={Colors.btnGreen} onPress={salvar} flex />
                </>
            }
        >
            {loading ? (
                <Spinner label="Carregando professores..." />
            ) : (
                <BuscaLista
                    items={professores}
                    searchKeys={['descricao', 'pessoa_fisica_nome_completo', 'nome']}
                    emptyText="Nenhum professor encontrado."
                    renderItem={(item) => {
                        const r = asRecord(item);
                        const selected = selecionado === String(r.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.selectRow, selected && styles.selectRowActive]}
                                onPress={() => setSelecionado(String(r.id ?? ''))}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.selectRowText, selected && styles.selectRowTextActive]}>
                                    {val(r.descricao ?? r.nome)} {selected ? ' ✓' : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </ModalShell>
    );
}

function SalaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [vagas, setVagas] = useState<string>(String(record.vagas ?? ''));

    const salvar = async () => {
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/alterar-vagas`, {vagas: Number(vagas) || 0});
            Alert.alert('Alterar Sala', 'Salas e vagas atualizadas com sucesso!', [{text: 'OK', onPress: onClose}]);
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Alterar Sala"
            onClose={onClose}
            footer={
                <>
                    <Btn label="Cancelar" color={Colors.btnRed} onPress={onClose} />
                    <Btn label="Salvar" color={Colors.btnGreen} onPress={salvar} flex />
                </>
            }
        >
            <View style={styles.body}>
                <InfoRow label="Sala atual" value={val(record.sala_descricao ?? record.sala)} />
                <Field label="Vagas">
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textPlaceholder}
                        value={vagas}
                        onChangeText={setVagas}
                    />
                </Field>
            </View>
        </ModalShell>
    );
}

function InformacoesModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [alunos, setAlunos] = useState<ApiItem[]>([]);
    const [loadingAlunos, setLoadingAlunos] = useState(true);
    const [ocorrencias, setOcorrencias] = useState<ApiItem[]>(() => {
        const v = record.ocorrencias;
        return Array.isArray(v) ? (v as ApiItem[]) : [];
    });
    const [novaOcorrenciaAberta, setNovaOcorrenciaAberta] = useState(false);
    const [observacao, setObservacao] = useState<string>(String(record.observacao ?? ''));

    useEffect(() => {
        let active = true;
        api.get(`/api/educacao/turma/${turma?.id ?? ''}/alunos`)
            .then((res) => res.data as { content?: ApiItem[] })
            .then((body) => {
                if (!active) return;
                setAlunos(Array.isArray(body) ? body : body.content ?? []);
            })
            .catch(() => {})
            .finally(() => {
                if (active) setLoadingAlunos(false);
            });
        return () => {
            active = false;
        };
    }, [turma]);

    const removerAluno = (aluno: ApiItem) => {
        Alert.alert('Remover aluno', `Deseja realmente remover o aluno #${aluno.id}?`, [
            {text: 'Cancelar', style: 'cancel'},
            {
                text: 'Remover',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post(`/api/educacao/turma/${turma?.id ?? ''}/remove-aluno`, {alunoId: aluno.id});
                        setAlunos((prev) => prev.filter((a) => a.id !== aluno.id));
                        Alert.alert('Aluno removido', 'Aluno removido da turma com sucesso!');
                    } catch (e) {
                        Alert.alert('Erro', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const salvarObservacao = async () => {
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/salvar-observacoes`, {observacao});
            Alert.alert('Observações', 'Observações salvas com sucesso!');
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Mais Informações"
            onClose={onClose}
            full
            footer={<Btn label="Fechar" color={Colors.btnRed} onPress={onClose} />}
        >
            <View style={styles.body}>
                <InfoRow label="Turma" value={val(record.grupo_descricao ?? record.id)} />
                <InfoRow label="Curso" value={val(record.curriculo_descricao)} />
                <InfoRow label="Professor" value={val(record.professor_descricao)} />
                <Tabs
                    initial="alunos"
                    tabs={[
                        {
                            key: 'alunos',
                            label: 'Alunos',
                            content: (
                                <View style={styles.tabContent}>
                                    {loadingAlunos ? (
                                        <Spinner label="Carregando alunos..." />
                                    ) : alunos.length === 0 ? (
                                        <Text style={styles.emptyText}>Nenhum aluno matriculado.</Text>
                                    ) : (
                                        <ScrollView style={styles.listaScroll}>
                                            {alunos.map((aluno) => (
                                                <View key={aluno.id} style={styles.listRow}>
                                                    <Text style={styles.listRowText}>{val(asRecord(aluno).label ?? asRecord(aluno).nome)}</Text>
                                                    <TouchableOpacity
                                                        style={styles.smallDangerBtn}
                                                        onPress={() => removerAluno(aluno)}
                                                        activeOpacity={0.8}
                                                    >
                                                        <Text style={styles.smallDangerBtnText}>Remover</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    )}
                                </View>
                            ),
                        },
                        {
                            key: 'ocorrencias',
                            label: 'Ocorrências',
                            content: (
                                <View style={styles.tabContent}>
                                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setNovaOcorrenciaAberta(true)} activeOpacity={0.8}>
                                        <Text style={styles.primaryBtnText}>Nova Ocorrência</Text>
                                    </TouchableOpacity>
                                    <ScrollView style={styles.listaScroll}>
                                        {ocorrencias.length === 0 ? (
                                            <Text style={styles.emptyText}>Nenhuma ocorrência registrada.</Text>
                                        ) : (
                                            ocorrencias.map((oc) => (
                                                <View key={oc.id} style={styles.listRow}>
                                                    <Text style={styles.listRowText}>{val(asRecord(oc).nome ?? asRecord(oc).descricao)}</Text>
                                                    <Text style={styles.listRowDate}>{formatDate(asRecord(oc).data ?? asRecord(oc).dataCadastro)}</Text>
                                                </View>
                                            ))
                                        )}
                                    </ScrollView>
                                </View>
                            ),
                        },
                        {
                            key: 'observacoes',
                            label: 'Observações',
                            content: (
                                <View style={styles.tabContent}>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                        placeholder="Descreva as observações..."
                                        placeholderTextColor={Colors.textPlaceholder}
                                        value={observacao}
                                        onChangeText={setObservacao}
                                    />
                                    <Btn label="Salvar Observações" color={Colors.btnGreen} onPress={salvarObservacao} />
                                </View>
                            ),
                        },
                    ]}
                />
            </View>

            {novaOcorrenciaAberta && <OcorrenciaWizardModal turma={turma} onClose={() => setNovaOcorrenciaAberta(false)} />}
        </ModalShell>
    );
}

function OcorrenciaWizardModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [responsavel, setResponsavel] = useState('');

    const salvar = async (_data: unknown) => {
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/nova-ocorrencia`, {descricao, data, responsavel});
            Alert.alert('Ocorrência', 'Ocorrência registrada com sucesso!', [{text: 'OK', onPress: onClose}]);
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Nova Ocorrência"
            onClose={onClose}
            full
            footer={<Btn label="Fechar" color={Colors.btnRed} onPress={onClose} />}
        >
            <Wizard
                completeLabel="Salvar"
                onComplete={salvar}
                steps={[
                    {
                        key: 'descricao',
                        label: 'Descrição',
                        content: (
                            <Field label="Descrição">
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    multiline
                                    placeholder="Descreva a ocorrência..."
                                    placeholderTextColor={Colors.textPlaceholder}
                                    value={descricao}
                                    onChangeText={setDescricao}
                                />
                            </Field>
                        ),
                        validate: () => (descricao.trim() ? true : 'Informe a descrição da ocorrência.'),
                    },
                    {
                        key: 'data',
                        label: 'Data',
                        content: (
                            <Field label="Data (dd/MM/aaaa)">
                                <TextInput
                                    style={styles.input}
                                    placeholder="dd/MM/aaaa"
                                    placeholderTextColor={Colors.textPlaceholder}
                                    value={data}
                                    onChangeText={setData}
                                />
                            </Field>
                        ),
                        validate: () => (data.trim() ? true : 'Informe a data da ocorrência.'),
                    },
                    {
                        key: 'responsavel',
                        label: 'Responsável',
                        content: (
                            <Field label="Responsável">
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nome do responsável"
                                    placeholderTextColor={Colors.textPlaceholder}
                                    value={responsavel}
                                    onChangeText={setResponsavel}
                                />
                            </Field>
                        ),
                        validate: () => (responsavel.trim() ? true : 'Informe o responsável.'),
                    },
                ]}
            />
        </ModalShell>
    );
}

function CancelarProrrogarModal({
    turma,
    onClose,
    onProrrogar,
}: {
    turma: ApiItem | null;
    onClose: () => void;
    onProrrogar: () => void;
}) {
    const record = asRecord(turma);
    const [tab, setTab] = useState('cancelar');
    const [motivo, setMotivo] = useState('');

    const cancelar = () => {
        if (!motivo.trim()) {
            Alert.alert('Cancelar turma', 'Informe o motivo do cancelamento.');
            return;
        }
        Alert.alert('Cancelar turma', 'Deseja realmente cancelar a turma?', [
            {text: 'Não', style: 'cancel'},
            {
                text: 'Sim',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.post(`/api/educacao/turma/${turma?.id ?? ''}/cancelar`, {motivo, dataCancelamento: formatDate(new Date().toISOString().slice(0, 10))});
                        Alert.alert('Turma cancelada', 'A turma foi cancelada com sucesso!', [{text: 'OK', onPress: onClose}]);
                    } catch (e) {
                        Alert.alert('Erro', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    return (
        <ModalShell
            title="Cancelar ou Prorrogar"
            onClose={onClose}
            footer={
                <>
                    <Btn label="Cancelar" color={Colors.btnRed} onPress={cancelar} disabled={tab === 'prorrogar'} />
                    <Btn label="Prorrogar" color={Colors.btnYellow} onPress={onProrrogar} disabled={tab === 'cancelar'} flex />
                </>
            }
        >
            <View style={styles.body}>
                <InfoRow label="Sala" value={val(record.sala_descricao ?? record.sala)} />
                <InfoRow label="Vagas" value={val(record.vagas)} />
                <InfoRow label="Data Início" value={formatDate(record.dataInicio)} />
                <View style={styles.segmentedRow}>
                    {(['cancelar', 'prorrogar'] as const).map((key) => {
                        const active = tab === key;
                        return (
                            <TouchableOpacity
                                key={key}
                                style={[styles.segment, active && styles.segmentActive]}
                                onPress={() => setTab(key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                                    {key === 'cancelar' ? 'Cancelar' : 'Prorrogar'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {tab === 'cancelar' ? (
                    <Field label="Motivo do cancelamento">
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="Informe o motivo..."
                            placeholderTextColor={Colors.textPlaceholder}
                            value={motivo}
                            onChangeText={setMotivo}
                        />
                    </Field>
                ) : (
                    <Field label="Observações">
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="Observações sobre a prorrogação..."
                            placeholderTextColor={Colors.textPlaceholder}
                            value={motivo}
                            onChangeText={setMotivo}
                        />
                    </Field>
                )}
            </View>
        </ModalShell>
    );
}

function ProrrogarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [dataInicio, setDataInicio] = useState<string>(formatDate(record.dataInicio));
    const [duracao, setDuracao] = useState('1');
    const [observacao, setObservacao] = useState('');

    const salvar = async (_data: unknown) => {
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/prorrogar`, {
                dataInicio,
                duracao: Number(duracao) || 1,
                observacao,
            });
            Alert.alert('Turma prorrogada', 'A turma foi prorrogada com sucesso!', [{text: 'OK', onPress: onClose}]);
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Prorrogar Turma"
            onClose={onClose}
            full
            footer={<Btn label="Fechar" color={Colors.btnRed} onPress={onClose} />}
        >
            <Wizard
                completeLabel="Salvar"
                onComplete={salvar}
                steps={[
                    {
                        key: 'dados',
                        label: 'Dados',
                        content: (
                            <>
                                <Field label="Data Início">
                                    <TextInput
                                        style={styles.input}
                                        placeholder="dd/MM/aaaa"
                                        placeholderTextColor={Colors.textPlaceholder}
                                        value={dataInicio}
                                        onChangeText={setDataInicio}
                                    />
                                </Field>
                                <Field label="Duração (semestres)">
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="1"
                                        placeholderTextColor={Colors.textPlaceholder}
                                        value={duracao}
                                        onChangeText={setDuracao}
                                    />
                                </Field>
                            </>
                        ),
                        validate: () => (dataInicio.trim() ? true : 'Informe a nova data de início.'),
                    },
                    {
                        key: 'observacoes',
                        label: 'Observações',
                        content: (
                            <Field label="Observações">
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    multiline
                                    placeholder="Observações sobre a prorrogação..."
                                    placeholderTextColor={Colors.textPlaceholder}
                                    value={observacao}
                                    onChangeText={setObservacao}
                                />
                            </Field>
                        ),
                    },
                ]}
            />
        </ModalShell>
    );
}

function TrocarTurmaModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [turmas, setTurmas] = useState<ApiItem[]>([]);
    const [destino, setDestino] = useState<ApiItem | null>(null);

    const trocar = async () => {
        if (!destino) {
            Alert.alert('Trocar Turma', 'Selecione a turma de destino.');
            return;
        }
        if (destino.id === turma?.id) {
            Alert.alert('Trocar Turma', 'A turma de destino deve ser diferente da atual.');
            return;
        }
        try {
            await api.post(`/api/educacao/turma/${turma?.id ?? ''}/trocar`, {
                novaTurmaId: destino.id,
                turmaId: turma?.id,
            });
            Alert.alert('Trocar Turma', 'Troca de turma realizada com sucesso!', [{text: 'OK', onPress: onClose}]);
        } catch (e) {
            Alert.alert('Erro', apiErrorMessage(e));
        }
    };

    return (
        <ModalShell
            title="Trocar Turma"
            onClose={onClose}
            footer={
                <>
                    <Btn label="Cancelar" color={Colors.btnRed} onPress={onClose} />
                    <Btn label="Trocar" color={Colors.btnGreen} onPress={trocar} flex />
                </>
            }
        >
            <View style={styles.body}>
                <InfoRow label="Turma atual" value={String(turma?.id ?? '-')} />
                <Text style={styles.noteText}>Somente alunos comuns às duas turmas serão trocados.</Text>
                <MasterDetail
                    label="Turma de destino"
                    source={TURMA_SOURCE}
                    valueKey="id"
                    searchKeys={TURMA_SEARCH}
                    columns={TURMA_COLUMNS}
                    items={turmas}
                    onChange={(list) => {
                        setTurmas(list);
                        setDestino(list.length > 0 ? list[0] : null);
                    }}
                />
                {destino && <Text style={styles.selectedText}>Selecionada: #{destino.id}</Text>}
            </View>
        </ModalShell>
    );
}

function DiarioModal({turma, onClose}: {turma: ApiItem | null; onClose: () => void}) {
    const record = asRecord(turma);
    const [alunos, setAlunos] = useState<ApiItem[]>(() => {
        const v = record.diario;
        return Array.isArray(v) ? (v as ApiItem[]) : [];
    });

    useEffect(() => {
        let active = true;
        api.get(`/api/educacao/turma/${turma?.id ?? ''}/diario`)
            .then((res) => res.data as { content?: ApiItem[] })
            .then((body) => {
                if (!active) return;
                const list = Array.isArray(body) ? body : body.content ?? [];
                if (list.length > 0) setAlunos(list);
            })
            .catch(() => {})
            .finally(() => {});
        return () => {
            active = false;
        };
    }, [turma]);

    return (
        <ModalShell
            title="Diário de Classe"
            onClose={onClose}
            footer={<Btn label="Fechar" color={Colors.btnRed} onPress={onClose} />}
        >
            <View style={styles.body}>
                <InfoRow label="Turma" value={String(turma?.id ?? '-')} />
                <ScrollView style={styles.listaScroll}>
                    {alunos.length === 0 ? (
                        <Text style={styles.emptyText}>Nenhum dado de diário disponível.</Text>
                    ) : (
                        alunos.map((aluno) => {
                            const r = asRecord(aluno);
                            return (
                                <View key={aluno.id} style={styles.diarioRow}>
                                    <Text style={styles.listRowText}>{val(r.nome ?? r.label)}</Text>
                                    <Text style={styles.diarioFaltas}>
                                        UN1: {val(r.un1)} · UN2: {val(r.un2)} · UN3: {val(r.un3)} · UN4: {val(r.un4)}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        </ModalShell>
    );
}

/* ============================== Tela principal ============================== */

export default function ViewTurmaListTurmaListScreen() {
    const navigation = useNavigation();
    const outcome = '/view/turma/listTurma';

    const [unidade, setUnidade] = useState<ApiItem | null>(null);
    const [componente, setComponente] = useState<ApiItem | null>(null);
    const [turma, setTurma] = useState<ApiItem | null>(null);

    const [professorAberto, setProfessorAberto] = useState(false);
    const [salaAberto, setSalaAberto] = useState(false);
    const [infoAberto, setInfoAberto] = useState(false);
    const [cancelarProrrogarAberto, setCancelarProrrogarAberto] = useState(false);
    const [prorrogarAberto, setProrrogarAberto] = useState(false);
    const [trocarAberto, setTrocarAberto] = useState(false);
    const [diarioAberto, setDiarioAberto] = useState(false);

    const fechar = (setter: (v: boolean) => void) => () => {
        setter(false);
        setTurma(null);
    };

    const abrir = (item: ApiItem, setter: (v: boolean) => void) => {
        setTurma(item);
        setter(true);
    };

    /**
     * Lista de botões de regra de negócio por linha da tabela, espelhando os
     * 10 <p:menuitem> dos 4 <p:menuButton> do listTurma.xhtml
     * (acessoNovo | acessoEditar | acessoRelatorios | acessoRemover).
     * A permissão de cada botão é filtrada pelo próprio ModuleList; as regras
     * de status (disabled do XHTML) são validadas no clique com alerta.
     */
    const rowActions: ModuleListExtraAction[] = [
        {
            key: 'trocarComponente',
            title: 'Trocar Componente',
            icon: '⇄',
            permission: 'CREATE',
            onPress: (item) => abrir(item, setTrocarAberto),
        },
        {
            key: 'alterarProfessor',
            title: 'Alterar professor',
            icon: '👤',
            permission: 'CREATE',
            onPress: (item) => abrir(item, setProfessorAberto),
        },
        {
            key: 'criarAulaCoringa',
            title: 'Criar Aula coringa',
            icon: '📅',
            permission: 'UPDATE',
            onPress: async (item) => {
                const status = statusOf(item);
                if (status === 'PENDENTE' || status === 'CANCELADA') {
                    Alert.alert('Aula coringa', 'Ação indisponível para turmas PENDENTE ou CANCELADA.');
                    return;
                }
                try {
                    await api.post('/api/educacao/calendario/recriar', {turmaId: item.id});
                    Alert.alert('Aula coringa', 'Aula coringa criada com sucesso!');
                } catch (e) {
                    Alert.alert('Erro', apiErrorMessage(e));
                }
            },
        },
        {
            key: 'trocarTurma',
            title: 'Trocar Turma',
            icon: '🔀',
            permission: 'UPDATE',
            onPress: (item) => abrir(item, setTrocarAberto),
        },
        {
            key: 'alterarSala',
            title: 'Alterar sala',
            icon: '🏫',
            permission: 'UPDATE',
            onPress: (item) => abrir(item, setSalaAberto),
        },
        {
            key: 'maisInformacoes',
            title: 'Mais informações',
            icon: 'ℹ',
            permission: 'EXECUTE',
            onPress: (item) => abrir(item, setInfoAberto),
        },
        {
            key: 'trocaTurmaSegundaVia',
            title: 'Troca Turma (2ª via)',
            icon: '🖨',
            permission: 'EXECUTE',
            onPress: (item) => {
                api.get(`/api/educacao/turma/${item.id}/segunda-via-troca`).catch(() => {});
                Alert.alert('Segunda via', 'Segunda via gerada. O documento é disponibilizado pelo portal web.');
            },
        },
        {
            key: 'diarioClasse',
            title: 'Diário de Classe',
            icon: '📓',
            permission: 'EXECUTE',
            onPress: (item) => abrir(item, setDiarioAberto),
        },
        {
            key: 'finalizar',
            title: 'Finalizar',
            icon: '✔',
            permission: 'DELETE',
            onPress: (item) => {
                const status = statusOf(item);
                if (status !== 'EM_ANDAMENTO' && status !== 'CANCELADA') {
                    Alert.alert('Finalizar', 'Somente turmas EM_ANDAMENTO ou CANCELADA podem ser finalizadas.');
                    return;
                }
                navigation.navigate('view/turma/listTurmaFinalizando' as never, {turmaId: item.id});
            },
        },
        {
            key: 'cancelarProrrogar',
            title: 'Cancelar ou Prorrogar',
            icon: '✖',
            permission: 'DELETE',
            onPress: (item) => {
                if (statusOf(item) === 'CANCELADA') {
                    Alert.alert('Cancelar ou Prorrogar', 'Ação indisponível para turmas CANCELADA.');
                    return;
                }
                abrir(item, setCancelarProrrogarAberto);
            },
        },
    ];

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Turma</Text>
            </View>

            <Text style={styles.sectionLabel}>Filtros</Text>
            <MasterDetail
                label="Unidade"
                source={UNIDADE_SOURCE}
                valueKey="id"
                searchKeys={UNIDADE_SEARCH}
                columns={UNIDADE_COLUMNS}
                items={unidade ? [unidade] : []}
                onChange={(list) => setUnidade(list.length > 0 ? list[0] : null)}
            />
            <MasterDetail
                label="Componente Curricular"
                source={COMPONENTE_SOURCE}
                valueKey="id"
                searchKeys={COMPONENTE_SEARCH}
                columns={COMPONENTE_COLUMNS}
                items={componente ? [componente] : []}
                onChange={(list) => setComponente(list.length > 0 ? list[0] : null)}
            />

            <ModuleList
                path="/api/educacao/turma"
                title="Lista de Turmas"
                outcome={outcome}
                params={{
                    ...(unidade ? {unidadeId: unidade.id} : {}),
                    ...(componente ? {componenteCurricularId: componente.id} : {}),
                }}
                extraActions={rowActions}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />

            {professorAberto && <ProfessorModal turma={turma} onClose={fechar(setProfessorAberto)} />}
            {salaAberto && <SalaModal turma={turma} onClose={fechar(setSalaAberto)} />}
            {infoAberto && <InformacoesModal turma={turma} onClose={fechar(setInfoAberto)} />}
            {cancelarProrrogarAberto && (
                <CancelarProrrogarModal
                    turma={turma}
                    onClose={fechar(setCancelarProrrogarAberto)}
                    onProrrogar={() => {
                        setCancelarProrrogarAberto(false);
                        setProrrogarAberto(true);
                    }}
                />
            )}
            {prorrogarAberto && <ProrrogarTurmaModal turma={turma} onClose={fechar(setProrrogarAberto)} />}
            {trocarAberto && <TrocarTurmaModal turma={turma} onClose={fechar(setTrocarAberto)} />}
            {diarioAberto && <DiarioModal turma={turma} onClose={fechar(setDiarioAberto)} />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: Colors.bgPrimary},
    pageContent: {padding: Spacing.md},
    header: {
        backgroundColor: Colors.headerStart,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: Colors.borderGold,
        marginBottom: Spacing.md,
    },
    pageTitle: {fontSize: Typography.sizes.heading, fontWeight: Typography.weights.bold, color: Colors.textWhite},
    sectionLabel: {fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm},
    center: {alignItems: 'center', justifyContent: 'center', padding: Spacing.xl},
    loadingText: {marginTop: Spacing.sm, color: Colors.textMuted, fontSize: Typography.sizes.base},

    overlay: {
        flex: 1,
        backgroundColor: Colors.modalOverlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.md,
    },
    modalCard: {
        width: '92%',
        maxHeight: '80%',
        backgroundColor: Colors.modalBg,
        borderRadius: BorderRadius.xxl,
        ...Shadows.modal,
        overflow: 'hidden',
    },
    modalCardFull: {height: '86%', width: '96%'},
    modalHeader: {
        backgroundColor: Colors.modalHeaderStart,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: Colors.modalHeaderBorder,
    },
    modalTitle: {fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold, color: Colors.textWhite},
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.modalCloseBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {color: Colors.modalCloseColor, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold},
    body: {padding: Spacing.lg},
    modalFooter: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.bgSecondary,
    },
    actionBtn: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 90,
    },
    actionBtnText: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},
    btnDisabled: {opacity: 0.4},

    field: {marginBottom: Spacing.md},
    fieldLabel: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.formLabelColor, marginBottom: Spacing.xs},
    input: {
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.bgSecondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.sizes.base,
        color: Colors.textPrimary,
    },
    textArea: {minHeight: 90, textAlignVertical: 'top'},

    infoRow: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
    infoLabel: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.medium, color: Colors.textMuted},
    infoValue: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textPrimary, flexShrink: 1, textAlign: 'right'},

    listaBox: {flex: 1, padding: Spacing.sm},
    listaScroll: {flexGrow: 0, maxHeight: 320},
    emptyText: {textAlign: 'center', color: Colors.textMuted, padding: Spacing.lg, fontSize: Typography.sizes.base},
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    listRowText: {fontSize: Typography.sizes.base, color: Colors.textPrimary, flex: 1, paddingRight: Spacing.sm},
    listRowDate: {fontSize: Typography.sizes.sm, color: Colors.textMuted},

    selectRow: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    selectRowActive: {backgroundColor: Colors.goldBg},
    selectRowText: {fontSize: Typography.sizes.base, color: Colors.textPrimary},
    selectRowTextActive: {color: Colors.goldText, fontWeight: Typography.weights.semibold},

    smallDangerBtn: {
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.btnRed,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    smallDangerBtnText: {color: Colors.textWhite, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold},
    primaryBtn: {
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        alignItems: 'center',
    },
    primaryBtnText: {color: Colors.textWhite, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold},

    segmentedRow: {flexDirection: 'row', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.md, overflow: 'hidden', backgroundColor: Colors.bgSecondary},
    segment: {flex: 1, alignItems: 'center', paddingVertical: Spacing.sm},
    segmentActive: {backgroundColor: Colors.primary},
    segmentText: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textMuted},
    segmentTextActive: {color: Colors.textWhite},
    tabContent: {padding: Spacing.sm},
    noteText: {fontSize: Typography.sizes.md, color: Colors.textMuted, marginVertical: Spacing.sm},
    selectedText: {fontSize: Typography.sizes.base, color: Colors.goldText, fontWeight: Typography.weights.semibold, marginTop: Spacing.xs},

    diarioRow: {paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
    diarioFaltas: {fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: Spacing.xs},
});