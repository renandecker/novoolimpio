import React, {useCallback, useEffect, useState} from 'react';
import {
    Alert,
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {FormLayout, FormFieldConfig, FormTabConfig} from '../../FormLayout';
import {AutoComplete, AutoCompleteOption} from '../../shared/components/AutoComplete';
import {api} from '../../shared/services/api';
import {Colors, Spacing, BorderRadius, Typography, Shadows, Layout} from '../../shared/styles/theme';

const toTitle = (value: unknown): string => String(value ?? '');

const parseDate = (v: string): string | null => {
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v ?? '');
};

const toTimeInput = (v: unknown): string => {
    if (!v) return '';
    const m = /^(\d{2}):(\d{2})/.exec(String(v));
    return m ? `${m[1]}:${m[2]}` : String(v ?? '');
};

const fetchPessoaFisicaOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-fisica/listPessoaFisica', {params: {q}});
    return (data ?? []).map((row) => {
        const id = Number(row.id_pessoa ?? row.pessoaId ?? row.id ?? 0);
        const nome = String(row.nome ?? row.nome_social ?? '');
        const cpf = String(row.cpf ?? '').trim();
        const label = nome && cpf ? `${nome} (${cpf})` : nome || `#${id}`;
        return {id, label};
    });
};

const fetchPessoaJuridicaOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-juridica/listPessoaJuridica', {params: {q}});
    return (data ?? []).map((row) => {
        const id = Number(row.id_pessoa ?? row.pessoaId ?? row.id ?? 0);
        const razao = String(row.razao_social ?? row.nome ?? '');
        const cnpj = String(row.cnpj ?? '').trim();
        const label = razao && cnpj ? `${razao} (${cnpj})` : razao || `#${id}`;
        return {id, label};
    });
};

const fetchUnidadeOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/unidade/listUnidade', {params: {q}});
    return (data ?? []).map((row) => {
        const id = Number(row.id ?? row.unidadeId ?? 0);
        const label = String(row.sucinto ?? row.razaoSocial ?? row.nomeFantasia ?? row.nome ?? `#${id}`);
        return {id, label};
    });
};

const fetchTipoContratoOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/educacao/tipo-contrato', {params: {q}});
    return (data ?? []).map((row) => {
        const id = Number(row.id ?? 0);
        const label = String(row.descricao ?? `#${id}`);
        return {id, label};
    });
};

const fetchComponenteOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/componente-curricular/listComponenteCurricular', {params: {q}});
    return (data ?? []).map((row) => {
        const id = Number(row.id ?? row.componenteId ?? 0);
        const label = String(row.descricao ?? row.nome ?? `#${id}`);
        return {id, label};
    });
};

interface DisponibilidadeRow {
    id?: number;
    unidadeId?: number;
    unidadeLabel?: string;
    tipoContratoId?: number;
    tipoContratoLabel?: string;
    inicio?: string;
    fim?: string;
    preAutorizado?: boolean;
}

interface ComponenteRow {
    id?: number;
    componenteId?: number;
    componenteLabel?: string;
    quantidade?: string;
    cargaHoraria?: string;
}

export default function ViewProfessorFormProfessorListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const idEdicao = Number(route.params?.id ?? 0) || null;

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [salvando, setSalvando] = useState(false);

    const [pessoaOpt, setPessoaOpt] = useState<AutoCompleteOption | null>(null);
    const [tipoPessoa, setTipoPessoa] = useState<'F' | 'J'>('F');
    const [flAtivo, setFlAtivo] = useState(true);
    const [cadernoBola, setCadernoBola] = useState(true);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeRow[]>([]);
    const [componentes, setComponentes] = useState<ComponenteRow[]>([]);

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const {data} = await api.get<Record<string, any>>(`/api/professor/professor/${idEdicao}`);
                if (!ativo) return;
                setFlAtivo(Boolean(data.fl_ativo ?? data.flAtivo ?? true));
                setCadernoBola(Boolean(data.caderno_bola ?? data.cadernoBola ?? true));
                setDataInicio(toDateInput(data.data_inicio ?? data.dataInicio));
                setDataFim(toDateInput(data.data_fim ?? data.dataFim));
                const pessoaId = Number(data.pessoa_id ?? data.pessoaId ?? 0);
                if (pessoaId) {
                    setPessoaOpt({id: pessoaId, label: String(data.pessoa_nome ?? data.pessoaNome ?? `#${pessoaId}`)});
                }
            } catch (error) {
                console.error('Erro ao carregar professor', error);
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idEdicao]);

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const {data} = await api.get<Array<Record<string, unknown>>>('/api/professor/disponibilidade-professor', {
                    params: {filtro: {professorId: idEdicao}},
                });
                if (!ativo) return;
                setDisponibilidades((data ?? []).map((d) => ({
                    id: Number(d.id),
                    unidadeId: Number(d.unidade_id ?? d.unidadeId ?? 0),
                    unidadeLabel: String(d.unidade_sucinto ?? d.unidadeLabel ?? ''),
                    tipoContratoId: Number(d.tipo_contrato_id ?? d.tipoContratoId ?? 0),
                    tipoContratoLabel: String(d.tipo_contrato_descricao ?? d.tipoContratoLabel ?? ''),
                    inicio: toTimeInput(d.inicio),
                    fim: toTimeInput(d.fim),
                    preAutorizado: Boolean(d.pre_autorizado ?? d.preAutorizado ?? false),
                })));
            } catch (error) {
                console.error('Erro ao carregar disponibilidades', error);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idEdicao]);

    useEffect(() => {
        if (!idEdicao) return;
        let ativo = true;
        (async () => {
            try {
                const {data} = await api.get<Array<Record<string, unknown>>>('/api/professor/componente-curricular', {
                    params: {filtro: {professorId: idEdicao}},
                });
                if (!ativo) return;
                setComponentes((data ?? []).map((d) => ({
                    id: Number(d.id),
                    componenteId: Number(d.componente_id ?? d.componenteCurricularId ?? 0),
                    componenteLabel: String(d.componente_descricao ?? d.componenteLabel ?? ''),
                    quantidade: d.quantidade != null ? String(d.quantidade) : '',
                    cargaHoraria: d.carga_horaria != null ? String(d.carga_horaria) : '',
                })));
            } catch (error) {
                console.error('Erro ao carregar componentes curriculares', error);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idEdicao]);

    const atualizarDisponibilidade = (idx: number, patch: Partial<DisponibilidadeRow>) =>
        setDisponibilidades((prev) => prev.map((row, i) => (i === idx ? {...row, ...patch} : row)));

    const atualizarComponente = (idx: number, patch: Partial<ComponenteRow>) =>
        setComponentes((prev) => prev.map((row, i) => (i === idx ? {...row, ...patch} : row)));

    const salvar = async () => {
        if (!pessoaOpt) {
            Alert.alert('Atenção', 'Selecione a pessoa do professor.');
            return;
        }
        if (!dataInicio.trim()) {
            Alert.alert('Atenção', 'Informe a data de início.');
            return;
        }
        setSalvando(true);
        try {
            const professorBody = {
                pessoaId: pessoaOpt.id,
                flAtivo: flAtivo,
                cadernoBola: cadernoBola,
                dataInicio: parseDate(dataInicio) || null,
                dataFim: parseDate(dataFim) || null,
            };
            let professorId = idEdicao;
            if (idEdicao) {
                await api.put(`/api/professor/professor/${idEdicao}`, professorBody);
            } else {
                const res = await api.post('/api/professor/professor', professorBody);
                professorId = Number(res.data?.id ?? res.data ?? idEdicao);
            }

            if (!professorId) {
                Alert.alert('Erro', 'Não foi possível obter o ID do professor.');
                return;
            }

            for (const d of disponibilidades) {
                const body = {
                    professorId,
                    unidadeId: d.unidadeId,
                    tipoContratoId: d.tipoContratoId,
                    inicio: d.inicio ? `${d.inicio}:00` : null,
                    fim: d.fim ? `${d.fim}:00` : null,
                    preAutorizado: d.preAutorizado ?? false,
                };
                if (d.id) {
                    await api.put(`/api/professor/disponibilidade-professor/${d.id}`, body);
                } else {
                    await api.post('/api/professor/disponibilidade-professor', body);
                }
            }

            for (const c of componentes) {
                const body = {
                    professorId,
                    componenteId: c.componenteId,
                    quantidade: c.quantidade ? Number(c.quantidade) : 1,
                    cargaHoraria: c.cargaHoraria ? Number(c.cargaHoraria) : null,
                };
                if (c.id) {
                    await api.put(`/api/professor/componente-curricular/${c.id}`, body);
                } else {
                    await api.post('/api/professor/componente-curricular', body);
                }
            }

            Alert.alert('Sucesso', 'Professor salvo com sucesso.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', `Erro ao salvar professor: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setSalvando(false);
        }
    };

    const renderDisponibilidade = () => (
        <ScrollView style={{width: '100%'}}>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colUnidade]}>Unidade</Text>
                    <Text style={[styles.tableHeaderCell, styles.colContrato]}>Contrato</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Início</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Fim</Text>
                    <Text style={[styles.tableHeaderCell, styles.colPrev]}>Pré-Aut.</Text>
                    <Text style={[styles.tableHeaderCell, styles.colAction]}>-</Text>
                </View>
                {disponibilidades.map((d, idx) => (
                    <View key={d.id ?? `nova-${idx}`} style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.colUnidade]}>
                            <AutoComplete
                                placeholder="Digite 3 letras..."
                                value={d.unidadeId ? {id: d.unidadeId, label: d.unidadeLabel ?? ''} : null}
                                onChange={(opt) => atualizarDisponibilidade(idx, {unidadeId: opt?.id, unidadeLabel: opt?.label ?? ''})}
                                fetchOptions={fetchUnidadeOptions}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colContrato]}>
                            <AutoComplete
                                placeholder="Contrato..."
                                value={d.tipoContratoId ? {id: d.tipoContratoId, label: d.tipoContratoLabel ?? ''} : null}
                                onChange={(opt) => atualizarDisponibilidade(idx, {tipoContratoId: opt?.id, tipoContratoLabel: opt?.label ?? ''})}
                                fetchOptions={fetchTipoContratoOptions}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colTime]}>
                            <TextInput
                                style={styles.cellInput}
                                value={d.inicio ?? ''}
                                onChangeText={(v) => atualizarDisponibilidade(idx, {inicio: v})}
                                placeholder="08:00"
                                maxLength={5}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colTime]}>
                            <TextInput
                                style={styles.cellInput}
                                value={d.fim ?? ''}
                                onChangeText={(v) => atualizarDisponibilidade(idx, {fim: v})}
                                placeholder="22:00"
                                maxLength={5}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colPrev]}>
                            <Switch
                                value={Boolean(d.preAutorizado)}
                                onValueChange={(v) => atualizarDisponibilidade(idx, {preAutorizado: v})}
                                trackColor={{false: Colors.borderMedium, true: Colors.primary}}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colAction]}>
                            <TouchableOpacity onPress={() => setDisponibilidades((prev) => prev.filter((_, i) => i !== idx))}>
                                <Text style={styles.removeText}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {disponibilidades.length === 0 && (
                    <View style={styles.tableRow}>
                        <Text style={styles.emptyText}>Nenhuma disponibilidade cadastrada.</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setDisponibilidades((prev) => [...prev, {}])}>
                <Text style={styles.addButtonText}>+ Adicionar Disponibilidade</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderComponente = () => (
        <ScrollView style={{width: '100%'}}>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colComp]}>Componente</Text>
                    <Text style={[styles.tableHeaderCell, styles.colQtd]}>Qtd</Text>
                    <Text style={[styles.tableHeaderCell, styles.colQtd]}>C.H.</Text>
                    <Text style={[styles.tableHeaderCell, styles.colAction]}>-</Text>
                </View>
                {componentes.map((c, idx) => (
                    <View key={c.id ?? `nova-${idx}`} style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.colComp]}>
                            <AutoComplete
                                placeholder="Digite 3 letras..."
                                value={c.componenteId ? {id: c.componenteId, label: c.componenteLabel ?? ''} : null}
                                onChange={(opt) => atualizarComponente(idx, {componenteId: opt?.id, componenteLabel: opt?.label ?? ''})}
                                fetchOptions={fetchComponenteOptions}
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colQtd]}>
                            <TextInput
                                style={styles.cellInput}
                                value={c.quantidade ?? ''}
                                onChangeText={(v) => atualizarComponente(idx, {quantidade: v})}
                                keyboardType="numeric"
                                placeholder="1"
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colQtd]}>
                            <TextInput
                                style={styles.cellInput}
                                value={c.cargaHoraria ?? ''}
                                onChangeText={(v) => atualizarComponente(idx, {cargaHoraria: v})}
                                keyboardType="numeric"
                                placeholder="60"
                            />
                        </View>
                        <View style={[styles.tableCell, styles.colAction]}>
                            <TouchableOpacity onPress={() => setComponentes((prev) => prev.filter((_, i) => i !== idx))}>
                                <Text style={styles.removeText}>Remover</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {componentes.length === 0 && (
                    <View style={styles.tableRow}>
                        <Text style={styles.emptyText}>Nenhum componente curricular cadastrado.</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setComponentes((prev) => [...prev, {}])}>
                <Text style={styles.addButtonText}>+ Adicionar Componente</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    if (carregando) {
        return (
            <View style={[styles.page, styles.center]}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    const tabs: FormTabConfig[] = [
        {
            key: 'informacoes',
            label: 'Informações',
            fields: [
                {
                    name: 'tipoPessoa',
                    label: 'Tipo Pessoa',
                    type: 'select',
                    required: true,
                    options: [
                        {value: 'F', label: 'Pessoa Física'},
                        {value: 'J', label: 'Pessoa Jurídica'},
                    ],
                    actions: [],
                },
                {
                    name: 'pessoa',
                    label: 'Pessoa',
                    type: 'autoComplete',
                    required: true,
                    placeholder: 'Digite 3 letras para buscar...',
                    autoCompleteSource: tipoPessoa === 'F' ? 'pessoaFisica' : 'pessoaJuridica',
                    autoCompleteSearchKeys: ['nome', 'cpf'],
                    actions: [],
                },
                {name: 'flAtivo', label: 'Ativo', type: 'boolean', actions: []},
                {name: 'cadernoBola', label: 'Caderno de Bola', type: 'boolean', actions: []},
                {name: 'dataInicio', label: 'Data de Início', type: 'date', required: true, placeholder: 'dd/mm/aaaa', actions: []},
                {name: 'dataFim', label: 'Data de Fim', type: 'date', placeholder: 'dd/mm/aaaa', actions: []},
            ],
        },
        {
            key: 'disponibilidade',
            label: 'Disponibilidade',
            fields: [],
            customContent: renderDisponibilidade(),
        },
        {
            key: 'componente',
            label: 'Componente Curricular',
            fields: [],
            customContent: renderComponente(),
        },
    ];

    const handleSubmit = (values: Record<string, unknown>) => {
        const tp = String(values.tipoPessoa ?? 'F');
        setTipoPessoa(tp === 'J' ? 'J' : 'F');
        const p = values.pessoa as AutoCompleteOption | null | undefined;
        if (p?.id) setPessoaOpt({id: p.id, label: p.label});
        setFlAtivo(Boolean(values.flAtivo ?? true));
        setCadernoBola(Boolean(values.cadernoBola ?? true));
        setDataInicio(String(values.dataInicio ?? ''));
        setDataFim(String(values.dataFim ?? ''));
        salvar();
    };

    return (
        <FormLayout
            title={idEdicao ? `Editar Professor #${idEdicao}` : 'Novo Professor'}
            tabs={tabs}
            initialValues={{
                tipoPessoa,
                pessoa: pessoaOpt ?? undefined,
                flAtivo,
                cadernoBola,
                dataInicio: toDateInput(dataInicio),
                dataFim: toDateInput(dataFim),
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigation.goBack()}
            submitLabel="Salvar"
            cancelLabel="Voltar"
            saving={salvando}
            error={undefined}
        />
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.lg,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: Colors.bgSecondary,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        paddingVertical: Spacing.sm,
    },
    tableHeaderCell: {
        flex: 1,
        paddingHorizontal: Spacing.xs,
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
    },
    tableRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.borderMedium,
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    tableCell: {
        paddingHorizontal: Spacing.xs,
    },
    colUnidade: {flex: 1.4},
    colContrato: {flex: 1.1},
    colTime: {flex: 0.7},
    colPrev: {flex: 0.6},
    colAction: {flex: 0.6},
    colComp: {flex: 1.6},
    colQtd: {flex: 0.6},
    cellInput: {
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        fontSize: Typography.sizes.sm,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgPrimary,
    },
    removeText: {
        color: Colors.danger,
        fontSize: Typography.sizes.xs,
    },
    emptyText: {
        color: Colors.textLight,
        fontSize: Typography.sizes.sm,
        padding: Spacing.md,
    },
    addButton: {
        marginTop: Spacing.lg,
        alignSelf: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    addButtonText: {
        color: Colors.primary,
        fontWeight: Typography.weights.semibold,
        fontSize: Typography.sizes.md,
    },
});
