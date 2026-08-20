import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import {api} from './api';

export interface ModeloEmail {
    id: number;
    descricao: string;
    assunto: string;
    mensagem: string;
}

export interface AlunoLote {
    contratoId: number;
    aluno: string;
    contratante: string;
    email: string | null;
}

export interface SituacaoOption {
    value: string;
    label: string;
}

export const SITUACOES_NAP: SituacaoOption[] = [
    {value: 'DISPONIVEL', label: 'Disponível'},
    {value: 'AGENDADO', label: 'Agendado'},
    {value: 'AGENDADO_SEM_RETORNO', label: 'Agendado sem retorno'},
    {value: 'COMUNICADO', label: 'Comunicado'},
    {value: 'CONTRATO_RECORENTE', label: 'Contrato recorrente'},
    {value: 'PRIORITARIO', label: 'Prioritário'},
    {value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado'},
    {value: 'RETORNO', label: 'Retorno'},
    {value: 'SEM_RETORNO', label: 'Sem retorno'},
];

export const SITUACOES_COBRANCA: SituacaoOption[] = [
    {value: 'NUNCA_CONTATADO', label: 'Nunca contatado'},
    {value: 'AGENDADO', label: 'Agendado'},
    {value: 'AGENDADO_ATRASADO', label: 'Agendado atrasado'},
    {value: 'CONTATADO_HOJE', label: 'Contatado hoje'},
    {value: 'CONTATO_PENDENTE', label: 'Contato pendente'},
    {value: 'CONTATO_RECORRENTE', label: 'Contato recorrente'},
    {value: 'PRIORITARIO', label: 'Prioritário'},
    {value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado'},
];

interface LoteApiProps {
    basePath: string;
    etapaKey: 'etapasNapId' | 'etapasCobrancaId';
    etapaId: number;
    etapaLabel: string;
    situacoes: SituacaoOption[];
    onClose: () => void;
}

const apiError = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ? ? (error as Error)?.message
        ? ? 'erro desconhecido';

function SituacaoPicker({
                            situacoes,
                            value,
                            onChange,
                        }: {
    situacoes: SituacaoOption[];
    value: string;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const current = situacoes.find((s) => s.value === value);
    return (
        <View>
            <Text style={styles.fieldLabel}>Situação</Text>
            <Pressable style={styles.picker} onPress={() => setOpen(true)}>
                <Text style={styles.pickerText}>{current?.label ? ? 'Selecione'}</Text>
            </Pressable>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
                    <View style={styles.optionsBox}>
                        <ScrollView>
                            {situacoes.map((s) => (
                                <Pressable
                                    key={s.value}
                                    style={styles.option}
                                    onPress={() => {
                                        onChange(s.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Text
                                        style={[styles.optionText, s.value === value && styles.optionTextActive]}>{s.label}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

function AlunoRow({
                      aluno,
                      selected,
                      onToggle,
                  }: {
    aluno: AlunoLote;
    selected: boolean;
    onToggle: () => void;
}) {
    return (
        <Pressable style={styles.row} onPress={onToggle}>
            <Text style={[styles.checkbox, selected && styles.checkboxChecked]}>{selected ? '☑' : '☐'}</Text>
            <View style={styles.rowMain}>
                <Text style={styles.rowText}>{aluno.aluno}</Text>
                <Text style={styles.rowDetail}>
                    {aluno.contratante} {aluno.email ? `· ${aluno.email}` : '· sem e-mail'}
                </Text>
            </View>
        </Pressable>
    );
}

export function LoteEmailModal({basePath, etapaKey, etapaId, etapaLabel, situacoes, onClose}: LoteApiProps) {
    const [situacao, setSituacao] = useState(situacoes[0]?.value ? ? '');
    const [q, setQ] = useState('');
    const [mensagemId, setMensagemId] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [enviado, setEnviado] = useState<{ processados: number; semEmail: number } | null>(null);
    const [error, setError] = useState('');

    const modelosQuery = useQuery({
        queryKey: [basePath, 'modelos-email'],
        queryFn: async () => (await api.get<ModeloEmail[]>(`${basePath}/modelos-email`)).data,
    });
    const modelos = modelosQuery.data ? ? [];
    const modelo = modelos.find((m) => m.id === mensagemId) ? ? null;

    const alunosQuery = useQuery({
        queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
        queryFn: async () =>
            (
                await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
                    params: {[etapaKey]: etapaId, situacao, tipo: 0, q},
                })
            ).data,
    });
    const alunos = alunosQuery.data?.alunos ? ? [];

    const toggle = (contratoId: number) =>
        setSelected((prev) =>
            prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
        );

    const toggleTodos = () =>
        setSelected((prev) => {
            const ids = alunos.map((a) => a.contratoId);
            const todosSelecionados = ids.every((id) => prev.includes(id));
            return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
        });

    const enviarMutation = useMutation({
        mutationFn: async () =>
            (
                await api.post<{ processados: number; semEmail: number }>(`${basePath}/email`, {
                    [etapaKey]: etapaId,
                    mensagemId,
                    contratoIds: selected,
                })
            ).data,
        onSuccess: (data) => setEnviado(data),
        onError: (err) => setError(apiError(err)),
    });

    const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>E-mail em lote · {etapaLabel}</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <ScrollView style={styles.modalScroll}>
                        <Text style={styles.fieldLabel}>Modelo de e-mail</Text>
                        {modelosQuery.isLoading ? (
                            <ActivityIndicator/>
                        ) : (
                            <View>
                                {modelos.map((m) => (
                                    <Pressable
                                        key={m.id}
                                        style={[styles.option, mensagemId === m.id && styles.optionSelected]}
                                        onPress={() => setMensagemId(m.id)}
                                    >
                                        <Text
                                            style={[styles.optionText, mensagemId === m.id && styles.optionTextActive]}>{m.descricao}</Text>
                                    </Pressable>
                                ))}
                                {modelos.length === 0 && <Text style={styles.empty}>Nenhum modelo disponível.</Text>}
                            </View>
                        )}
                        {modelo && (
                            <View style={styles.preview}>
                                <Text style={styles.previewTitle}>{modelo.assunto}</Text>
                                <Text style={styles.previewBody}>{modelo.mensagem}</Text>
                            </View>
                        )}

                        <SituacaoPicker
                            situacoes={situacoes}
                            value={situacao}
                            onChange={(value) => {
                                setSituacao(value);
                                setSelected([]);
                            }}
                        />
                        <Text style={styles.fieldLabel}>Buscar aluno</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={q}
                            onChangeText={setQ}
                            placeholder="Nome do aluno ou contratante"
                            placeholderTextColor="#9a9a9a"
                        />

                        <View style={styles.selectionBar}>
                            <Pressable style={styles.rowButton} onPress={toggleTodos} disabled={alunos.length === 0}>
                                <Text
                                    style={styles.rowButtonText}>{todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
                            </Pressable>
                            <Text style={styles.countText}>{selected.length} selecionado(s)</Text>
                        </View>

                        {alunosQuery.isLoading ? (
                            <ActivityIndicator style={{marginVertical: 12}}/>
                        ) : alunos.length === 0 ? (
                            <Text style={styles.empty}>Nenhum aluno encontrado para a situação selecionada.</Text>
                        ) : (
                            <FlatList
                                data={alunos}
                                keyExtractor={(a) => String(a.contratoId)}
                                renderItem={({item}) => (
                                    <AlunoRow aluno={item} selected={selected.includes(item.contratoId)}
                                              onToggle={() => toggle(item.contratoId)}/>
                                )}
                            />
                        )}

                        {error ? <Text style={styles.errorText}>Falha: {error}</Text> : null}

                        {enviado ? (
                            <Text style={styles.notice}>
                                {enviado.processados} e-mail(s) registrado(s)
                                {enviado.semEmail > 0 ? `, ${enviado.semEmail} aluno(s) sem e-mail cadastrado` : ''}.
                            </Text>
                        ) : (
                            <Pressable
                                style={[styles.primaryButton, (selected.length === 0 || !mensagemId || enviarMutation.isPending) && styles.primaryButtonDisabled]}
                                disabled={selected.length === 0 || !mensagemId || enviarMutation.isPending}
                                onPress={() => enviarMutation.mutate()}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {enviarMutation.isPending ? 'Enviando...' : `Enviar e-mails (${selected.length})`}
                                </Text>
                            </Pressable>
                        )}
                    </ScrollView>
                    <View style={styles.modalActions}>
                        <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{enviado ? 'Concluir' : 'Cancelar'}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export function LoteLigacaoModal({basePath, etapaKey, etapaId, etapaLabel, situacoes, onClose}: LoteApiProps) {
    const [situacao, setSituacao] = useState(situacoes[0]?.value ? ? '');
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [resultado, setResultado] = useState<{ processados: number } | null>(null);
    const [error, setError] = useState('');

    const alunosQuery = useQuery({
        queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
        queryFn: async () =>
            (
                await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
                    params: {[etapaKey]: etapaId, situacao, tipo: 1, q},
                })
            ).data,
    });
    const alunos = alunosQuery.data?.alunos ? ? [];

    const iniciarMutation = useMutation({
        mutationFn: async () =>
            (
                await api.post<{ processados: number }>(`${basePath}/ligacao`, {
                    [etapaKey]: etapaId,
                    contratoIds: selected,
                })
            ).data,
        onSuccess: (data) => setResultado(data),
        onError: (err) => setError(apiError(err)),
    });

    const toggle = (contratoId: number) =>
        setSelected((prev) =>
            prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
        );

    const toggleTodos = () =>
        setSelected((prev) => {
            const ids = alunos.map((a) => a.contratoId);
            const todosSelecionados = ids.every((id) => prev.includes(id));
            return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
        });

    const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Ligação em lote · {etapaLabel}</Text>
                        <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar">
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>
                    <ScrollView style={styles.modalScroll}>
                        {resultado ? (
                            <Text style={styles.notice}>{resultado.processados} ligação(ões) iniciada(s).</Text>
                        ) : (
                            <>
                                <SituacaoPicker
                                    situacoes={situacoes}
                                    value={situacao}
                                    onChange={(value) => {
                                        setSituacao(value);
                                        setSelected([]);
                                    }}
                                />
                                <Text style={styles.fieldLabel}>Buscar aluno</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    value={q}
                                    onChangeText={setQ}
                                    placeholder="Nome do aluno ou contratante"
                                    placeholderTextColor="#9a9a9a"
                                />

                                <View style={styles.selectionBar}>
                                    <Pressable style={styles.rowButton} onPress={toggleTodos}
                                               disabled={alunos.length === 0}>
                                        <Text
                                            style={styles.rowButtonText}>{todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}</Text>
                                    </Pressable>
                                    <Text style={styles.countText}>{selected.length} selecionado(s)</Text>
                                </View>

                                {alunosQuery.isLoading ? (
                                    <ActivityIndicator style={{marginVertical: 12}}/>
                                ) : alunos.length === 0 ? (
                                    <Text style={styles.empty}>Nenhum aluno encontrado para a situação
                                        selecionada.</Text>
                                ) : (
                                    <FlatList
                                        data={alunos}
                                        keyExtractor={(a) => String(a.contratoId)}
                                        renderItem={({item}) => (
                                            <AlunoRow aluno={item} selected={selected.includes(item.contratoId)}
                                                      onToggle={() => toggle(item.contratoId)}/>
                                        )}
                                    />
                                )}

                                {error ? <Text style={styles.errorText}>Falha: {error}</Text> : null}

                                <Pressable
                                    style={[styles.primaryButton, (selected.length === 0 || iniciarMutation.isPending) && styles.primaryButtonDisabled]}
                                    disabled={selected.length === 0 || iniciarMutation.isPending}
                                    onPress={() => iniciarMutation.mutate()}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {iniciarMutation.isPending ? 'Iniciando...' : `Iniciar ligações (${selected.length})`}
                                    </Text>
                                </Pressable>
                            </>
                        )}
                    </ScrollView>
                    <View style={styles.modalActions}>
                        <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{resultado ? 'Concluir' : 'Cancelar'}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(29, 32, 37, 0.55)',
        justifyContent: 'center',
        padding: 16
    },
    modalBox: {
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#2f333b',
        borderBottomWidth: 3,
        borderBottomColor: '#c2aa3c',
    },
    modalTitle: {
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
    modalScroll: {flexGrow: 0, paddingHorizontal: 20, paddingVertical: 16},
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    modalButton: {borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginLeft: 10},
    cancelButton: {backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0'},
    cancelButtonText: {color: '#4a4a4a', fontSize: 15, fontWeight: '600'},
    modalButtonText: {color: '#ffffff', fontSize: 15, fontWeight: '600'},
    primaryButton: {
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#2a5a88',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    primaryButtonText: {color: '#ffffff', fontSize: 15, fontWeight: '600'},
    primaryButtonDisabled: {opacity: 0.5, shadowOpacity: 0},
    fieldLabel: {fontSize: 13, fontWeight: '600', color: '#4a4a4a', marginBottom: 4, marginTop: 14},
    fieldInput: {
        borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#1d2025',
        backgroundColor: '#ffffff'
    },
    fieldInputFocused: {borderColor: '#337ab7', borderWidth: 2},
    picker: {borderWidth: 1, borderColor: '#d3d3d3', borderRadius: 8, padding: 12, backgroundColor: '#ffffff'},
    pickerText: {fontSize: 15, color: '#1d2025'},
    optionsBox: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 8,
        marginHorizontal: 24,
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6
    },
    option: {paddingVertical: 12, paddingHorizontal: 14, borderRadius: 6},
    optionSelected: {backgroundColor: 'rgba(51, 122, 183, 0.08)'},
    optionText: {fontSize: 15, color: '#1d2025'},
    optionTextActive: {color: '#265a88', fontWeight: '600'},
    preview: {
        borderWidth: 1,
        borderColor: '#e8e8e8',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        backgroundColor: '#fafafa'
    },
    previewTitle: {fontSize: 14, fontWeight: '600', color: '#1d2025', marginBottom: 6},
    previewBody: {fontSize: 13, color: '#555', lineHeight: 20},
    selectionBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10},
    rowButton: {
        backgroundColor: 'rgba(51, 122, 183, 0.08)',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8
    },
    rowButtonText: {color: '#265a88', fontSize: 13, fontWeight: '600'},
    countText: {fontSize: 13, color: '#666'},
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0'
    },
    checkbox: {fontSize: 20, marginRight: 12, color: '#bbb'},
    checkboxChecked: {color: '#265a88'},
    rowMain: {flex: 1},
    rowText: {fontSize: 15, color: '#1d2025'},
    rowDetail: {fontSize: 12, color: '#888', marginTop: 2},
    empty: {textAlign: 'center', color: '#888', marginTop: 16, fontSize: 14},
    notice: {
        backgroundColor: '#e8f4e8',
        borderWidth: 1,
        borderColor: '#a3d3a3',
        borderRadius: 8,
        padding: 10,
        marginVertical: 10,
        color: '#2e7d32',
        fontSize: 14
    },
    errorText: {color: '#a61b29', fontSize: 13, marginTop: 8},
    buttonDisabled: {opacity: 0.5},
});
