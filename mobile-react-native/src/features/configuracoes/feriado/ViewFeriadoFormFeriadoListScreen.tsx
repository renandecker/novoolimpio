import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    CheckBox,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {api} from '../../../shared/services/api';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../../shared/styles/theme';
import {AutoComplete} from '../../../shared/components/AutoComplete';

type AutoCompleteOption = {
    id: number;
    label: string;
};

type Turma = {
    id: number;
    data: string;
    oferecimentoId: number;
    grupoNome: string;
    unidadeSucinto: string;
    cursoNome: string;
    componenteCurricularDescricao: string;
    cargaHoraria: number;
    status: string;
    inscritos: number;
    vagas: number;
    diaSemanaNome: string;
    turnoDescricao: string;
    tempoAulaDescricao: string;
};

const formatarData = (value: string | null | undefined): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const parseData = (value: string): string | null => {
    if (!value) return null;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    return `${match[3]}-${match[2]}-${match[1]}`;
};

export default function ViewFeriadoFormFeriadoListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const idEdicao = route.params?.id as string | undefined;

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoFeriao, setTipoFeriao] = useState('');
    const [dataFeriado, setDataFeriado] = useState('');
    const [nacional, setNacional] = useState(false);
    const [todosCursos, setTodosCursos] = useState(false);
    const [feriadoFixo, setFeriadoFixo] = useState(false);

    const [tipoCursos, setTipoCursos] = useState<AutoCompleteOption[]>([]);
    const [unidades, setUnidades] = useState<AutoCompleteOption[]>([]);

    const [mostrarModalTurmas, setMostrarModalTurmas] = useState(false);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [turmasCarregando, setTurmasCarregando] = useState(false);
    const [turmasSelecionadas, setTurmasSelecionadas] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const ent = (await api.get(`/api/basico/feriado/${idEdicao}`)).data;
                if (!ativo) return;
                setNome(String(ent.nome ?? ''));
                setDescricao(String(ent.descricao ?? ''));
                setTipoFeriao(String(ent.tipo_feriao ?? ''));
                setDataFeriado(formatarData(ent.dt_feriado));
                setNacional(Boolean(ent.fl_nacional ?? false));
                setTodosCursos(Boolean(ent.fl_tipo_curso ?? false));
                setFeriadoFixo(Boolean(ent.fl_feriado_fixo ?? false));

                try {
                    const relCursos = await api.get(`/api/basico/feriado/${idEdicao}/tipo-cursos`);
                    if (relCursos.data) {
                        setTipoCursos(relCursos.data.map((item: any) => ({id: item.id, label: item.descricao || item.sucinto || `#${item.id}`})));
                    }
                } catch { }

                try {
                    const relUnidades = await api.get(`/api/basico/feriado/${idEdicao}/unidades`);
                    if (relUnidades.data) {
                        setUnidades(relUnidades.data.map((item: any) => ({id: item.id, label: item.sucinto || item.nome || `#${item.id}`})));
                    }
                } catch { }
            } catch (erro) {
                console.error('Erro ao carregar feriado:', erro);
                Alert.alert('Erro', 'Não foi possível carregar o feriado para edição');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [idEdicao]);

    const buscarTipoCursos = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get(`/api/educacao/tipo-curso/opcoes`, {params: {query}});
        return (data ?? []).map((item: any) => ({id: item.id, label: item.label || item.descricao || `#${item.id}`}));
    };

    const buscarUnidades = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get(`/api/basico/unidade/auto-complete-unidade-usuario`, {params: {query}});
        return (data ?? []).map((item: any) => ({id: item.id, label: item.sucinto || `#${item.id}`}));
    };

    const voltar = () => navigation.navigate('FeriadoList');

    const carregarTurmas = async (data: string) => {
        setTurmasCarregando(true);
        try {
            const dataFormatada = parseData(data);
            if (!dataFormatada) return;
            const {data: turmasData} = await api.get(`/api/basico/feriado/turmas-por-data`, {params: {data: dataFormatada}});
            setTurmas(turmasData ?? []);
            setTurmasSelecionadas(new Set());
        } catch (error) {
            Alert.alert('Erro', `Erro ao carregar turmas: ${error}`);
        } finally {
            setTurmasCarregando(false);
        }
    };

    const salvar = async (voltarDepois: boolean) => {
        if (!nome.trim()) {
            Alert.alert('Atenção', 'Informe o nome do feriado.');
            return;
        }
        if (!dataFeriado.trim()) {
            Alert.alert('Atenção', 'Informe a data do feriado.');
            return;
        }

        if (!idEdicao) {
            await carregarTurmas(dataFeriado);
            if (turmas.length > 0) {
                setMostrarModalTurmas(true);
                return;
            }
        }

        await salvarFeriado(voltarDepois, [], []);
    };

    const salvarFeriado = async (voltarDepois: boolean, ajustarIds: number[], naoAjustarIds: number[]) => {
        setSalvando(true);
        try {
            const body = {
                nome: nome.trim(),
                descricao: descricao.trim() || null,
                tipoFeriao: tipoFeriao || null,
                dataFeriado: parseData(dataFeriado),
                nacional: nacional,
                todosCursos: todosCursos,
                feriadoFixo: feriadoFixo,
                ajustarOcorrenciaIds: ajustarIds,
                naoAjustarOcorrenciaIds: naoAjustarIds,
            };

            if (idEdicao) {
                await api.put(`/api/basico/feriado/${idEdicao}`, body);
            } else {
                await api.post('/api/basico/feriado', body);
            }

            Alert.alert('Sucesso', 'Registro salvo com sucesso.');
            setMostrarModalTurmas(false);
            if (voltarDepois) voltar();
        } catch (error) {
            Alert.alert('Erro', `Erro ao salvar o feriado: ${error}`);
        } finally {
            setSalvando(false);
        }
    };

    const handleManterDatas = () => salvarFeriado(true, [], []);
    const handleAjustarTodas = () => salvarFeriado(true, turmas.map(t => t.id), []);
    const handleAjustarSelecionadas = () => salvarFeriado(true, Array.from(turmasSelecionadas), turmas.filter(t => !turmasSelecionadas.has(t.id)).map(t => t.id));
    const handleNaoAjustarSelecionadas = () => salvarFeriado(true, [], Array.from(turmasSelecionadas));

    const toggleTurmaSelecao = (id: number) => {
        setTurmasSelecionadas(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (carregando) {
        return (
            <View style={styles.page}>
                <View style={styles.center}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>{idEdicao ? `Editar Feriado #${idEdicao}` : 'Novo Feriado'}</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.formField}>
                        <Text style={styles.label}>Id</Text>
                        <TextInput
                            style={styles.input}
                            value={idEdicao ?? ''}
                            editable={false}
                            disabled
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.labelRequired}>Nome *</Text>
                        <TextInput
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                            placeholder="Nome do feriado"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.labelRequired}>Descrição *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            numberOfLines={4}
                            placeholder="Descrição do feriado"
                        />
                    </View>

                    <View style={styles.formField}>
                        <Text style={styles.labelRequired}>Data Feriado *</Text>
                        <TextInput
                            style={styles.input}
                            value={dataFeriado}
                            onChangeText={setDataFeriado}
                            placeholder="dd/mm/aaaa"
                            maxLength={10}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.checkboxField}>
                        <CheckBox
                            value={feriadoFixo}
                            onValueChange={setFeriadoFixo}
                            color={Colors.primary}
                        />
                        <Text style={styles.checkboxLabel}>Feriado Fixo</Text>
                    </View>

                    <View style={styles.checkboxField}>
                        <CheckBox
                            value={nacional}
                            onValueChange={(value) => { setNacional(value); if (value) setUnidades([]); }}
                            color={Colors.primary}
                        />
                        <Text style={styles.checkboxLabel}>Nacional (Todas Unidades)</Text>
                    </View>

                    <View style={styles.checkboxField}>
                        <CheckBox
                            value={todosCursos}
                            onValueChange={(value) => { setTodosCursos(value); if (value) setTipoCursos([]); }}
                            color={Colors.primary}
                        />
                        <Text style={styles.checkboxLabel}>Todos Tipos de Curso</Text>
                    </View>

                    {!todosCursos && (
                        <View style={styles.formField}>
                            <Text style={styles.label}>Tipo Cursos</Text>
                            <AutoComplete
                                placeholder="Digite para buscar (mínimo 3 caracteres)"
                                value={tipoCursos}
                                onChange={setTipoCursos}
                                fetchOptions={buscarTipoCursos}
                            />
                        </View>
                    )}

                    {!nacional && (
                        <View style={styles.formField}>
                            <Text style={styles.label}>Unidade</Text>
                            <AutoComplete
                                placeholder="Digite para buscar (mínimo 3 caracteres)"
                                value={unidades}
                                onChange={setUnidades}
                                fetchOptions={buscarUnidades}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary, salvando || turmasCarregando && styles.buttonDisabled]}
                        onPress={() => salvar(true)}
                        disabled={salvando || turmasCarregando}
                    >
                        <Text style={styles.buttonTextPrimary}>Gravar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary, salvando || turmasCarregando && styles.buttonDisabled]}
                        onPress={() => salvar(false)}
                        disabled={salvando || turmasCarregando}
                    >
                        <Text style={styles.buttonTextSecondary}>Salvar e Continuar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonTertiary, salvando || turmasCarregando && styles.buttonDisabled]}
                        onPress={voltar}
                        disabled={salvando || turmasCarregando}
                    >
                        <Text style={styles.buttonTextTertiary}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {mostrarModalTurmas && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Turmas encontradas nessa data</Text>
                        </View>
                        {turmasCarregando ? (
                            <View style={styles.modalCenter}>
                                <ActivityIndicator color={Colors.primary} size="large" />
                            </View>
                        ) : turmas.length === 0 ? (
                            <View style={styles.modalCenter}>
                                <Text style={styles.modalEmpty}>Nenhuma turma encontrada para esta data.</Text>
                            </View>
                        ) : (
                            <>
                                <FlatList
                                    data={turmas}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.modalRow,
                                                turmasSelecionadas.has(item.id) && styles.modalRowSelected,
                                            ]}
                                            onPress={() => toggleTurmaSelecao(item.id)}
                                        >
                                            <View style={styles.modalRowCheckbox}>
                                                <CheckBox
                                                    value={turmasSelecionadas.has(item.id)}
                                                    onValueChange={() => toggleTurmaSelecao(item.id)}
                                                    color={Colors.primary}
                                                />
                                            </View>
                                            <View style={styles.modalRowContent}>
                                                <Text style={styles.modalRowText}>{formatarData(item.data)}</Text>
                                                <Text style={styles.modalRowText}>Turma: {item.oferecimentoId}</Text>
                                                <Text style={styles.modalRowText}>Grupo: {item.grupoNome}</Text>
                                                <Text style={styles.modalRowText}>Unidade: {item.unidadeSucinto}</Text>
                                                <Text style={styles.modalRowText}>Curso: {item.cursoNome}</Text>
                                                <Text style={styles.modalRowText}>Componente: {item.componenteCurricularDescricao}</Text>
                                                <Text style={styles.modalRowText}>C.H.: {item.cargaHoraria} H/A</Text>
                                                <Text style={[styles.modalRowText, {color: Colors.primary}]}>Status: {item.status}</Text>
                                                <Text style={styles.modalRowText}>Inscritos/Vagas: {item.inscritos} / {item.vagas}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonBlue, salvando && styles.buttonDisabled]}
                                        onPress={handleManterDatas}
                                        disabled={salvando}
                                    >
                                        <Text style={styles.modalButtonText}>Manter datas das ofertas</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonStop, salvando && styles.buttonDisabled]}
                                        onPress={handleAjustarTodas}
                                        disabled={salvando}
                                    >
                                        <Text style={styles.modalButtonText}>Ajustar datas das ofertas</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonGreen, salvando && styles.buttonDisabled, turmasSelecionadas.size === 0 && styles.buttonDisabled]}
                                        onPress={handleAjustarSelecionadas}
                                        disabled={salvando || turmasSelecionadas.size === 0}
                                    >
                                        <Text style={styles.modalButtonText}>Ajustar ofertas selecionadas</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonBlack, salvando && styles.buttonDisabled, turmasSelecionadas.size === 0 && styles.buttonDisabled]}
                                        onPress={handleNaoAjustarSelecionadas}
                                        disabled={salvando || turmasSelecionadas.size === 0}
                                    >
                                        <Text style={styles.modalButtonText}>Não Ajustar ofertas selecionadas</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonYellow, salvando && styles.buttonDisabled]}
                                        onPress={() => setMostrarModalTurmas(false)}
                                        disabled={salvando}
                                    >
                                        <Text style={styles.modalButtonText}>Fechar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    formContainer: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        ...Shadows.medium,
    },
    formField: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    labelRequired: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgPrimary,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    checkboxField: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    checkboxLabel: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        color: Colors.textPrimary,
        marginLeft: Spacing.sm,
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    button: {
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        ...Shadows.gold,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonPrimary: {
        backgroundColor: Colors.primary,
    },
    buttonSecondary: {
        backgroundColor: Colors.secondary,
    },
    buttonTertiary: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.goldBg,
    },
    buttonTextPrimary: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    buttonTextSecondary: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    buttonTextTertiary: {
        color: Colors.goldText,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.modalOverlay,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalContainer: {
        backgroundColor: Colors.bgSecondary,
        borderRadius: BorderRadius.xxl,
        maxHeight: '85%',
        ...Shadows.modal,
        width: '100%',
    },
    modalHeader: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    modalCenter: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    modalEmpty: {
        color: Colors.textLight,
        fontSize: Typography.sizes.lg,
        textAlign: 'center',
    },
    modalRow: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    modalRowSelected: {
        backgroundColor: Colors.primary + '15',
    },
    modalRowCheckbox: {
        marginRight: Spacing.md,
    },
    modalRowContent: {
        flex: 1,
    },
    modalRowText: {
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    modalButtonContainer: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    modalButton: {
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
    },
    modalButtonBlue: {
        backgroundColor: Colors.primary,
    },
    modalButtonStop: {
        backgroundColor: Colors.secondary,
    },
    modalButtonGreen: {
        backgroundColor: '#27ae60',
    },
    modalButtonBlack: {
        backgroundColor: '#333',
    },
    modalButtonYellow: {
        backgroundColor: Colors.warningBg,
        borderWidth: 1,
        borderColor: Colors.goldBg,
    },
    modalButtonText: {
        color: Colors.textWhite,
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
});