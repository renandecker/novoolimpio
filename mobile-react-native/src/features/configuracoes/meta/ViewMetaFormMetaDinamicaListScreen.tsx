import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AutoComplete} from '../../../shared/components/AutoComplete';
import {UnidadeCombo} from '../../../shared/components/UnidadeCombo';
import {api} from '../../../shared/services/api';
import {
    FORMATO_LABELS,
    INDICADOR_LIST_SOURCE,
    MESES,
    META_DIAS_NAO_UTEIS_SOURCE,
    META_DINAMICA_API,
    META_DINAMICA_ITEM_SOURCE,
    META_VALOR_SOURCE,
    PERC_KEYS,
    PERC_LABELS,
    UNIDADE_LIST_SOURCE,
    bool,
    fetchIndicadorById,
    fetchIndicadorMetas,
    fetchMetaDiasNaoUteis,
    fetchMetaValores,
    metaDinamicaBody,
    metaUnidadeId,
    metaValorBody,
    num,
    percFromRow,
    rec,
    saveMetaDinamica,
    str,
    toIndicadorOption,
    toUnidadeOption,
} from './metaDinamica';
import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

const fetchIndicadorOptions = async (query: string): Promise<AutoCompleteOption[]> => {
    const {data} = await api.get<Record<string, unknown>[]>(INDICADOR_LIST_SOURCE);
    const termo = query.trim().toLowerCase();
    return (data ?? [])
        .filter((row) => !termo || str(row.nome).toLowerCase().includes(termo))
        .slice(0, 20)
        .map((row) => toIndicadorOption(row))
        .filter((opt): opt is AutoCompleteOption => opt !== null);
};

export default function ViewMetaFormMetaDinamicaListScreen() {
    const navigation = useNavigation();
    const route = useRoute<{params?: Record<string, string>}>();
    const idParam = num(route.params?.id);
    const indicadorParam = num(route.params?.indicadorId);

    const [id, setId] = useState<number | null>(idParam);
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);

    const [indicador, setIndicador] = useState<AutoCompleteOption | null>(null);
    const [flags, setFlags] = useState({dia: false, mes: false, ano: false, semana: false});
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    const [todosMeses, setTodosMeses] = useState(false);
    const [mes, setMes] = useState('');
    const [ano, setAno] = useState('');
    const [perc, setPerc] = useState<Record<string, number | null>>({});
    const [metas, setMetas] = useState<Record<string, unknown>[]>([]);
    const [valores, setValores] = useState<Record<string, unknown>[]>([]);
    const [dias, setDias] = useState<Record<string, unknown>[]>([]);
    const [novoDia, setNovoDia] = useState('');

    const percentualTotal = useMemo(
        () => PERC_KEYS.reduce((total, chave) => total + (perc[chave] ?? 0), 0),
        [perc],
    );

    const valorDe = useCallback(
        (idIndicadorMeta: number) => valores.find((row) => num(rec(row).id_indicador_meta) === idIndicadorMeta),
        [valores],
    );

    const selecionarIndicador = useCallback(async (row: Record<string, unknown> | null) => {
        setIndicador(toIndicadorOption(row));
        setFlags({
            dia: bool(row?.fl_dia),
            mes: bool(row?.fl_mes),
            ano: bool(row?.fl_ano),
            semana: bool(row?.fl_semana),
        });
        setValores([]);
        if (!row) {
            setMetas([]);
            return;
        }
        const indicadorId = num(row.id);
        if (indicadorId === null) return;
        try {
            setMetas(await fetchIndicadorMetas(indicadorId));
        } catch (e) {
            console.error('Erro ao carregar metas do indicador:', e);
            setErro('Erro ao carregar as metas do indicador.');
        }
    }, []);

    useEffect(() => {
        if (id === null && indicadorParam === null) return;
        let ativo = true;
        (async () => {
            setCarregando(true);
            setErro(null);
            try {
                let metaRow: Record<string, unknown> = {};
                if (id !== null) {
                    const {data} = await api.get<Record<string, unknown>>(`${META_DINAMICA_ITEM_SOURCE}/${id}`);
                    metaRow = rec(data);
                }
                const alvo = num(metaRow.id_indicador) ?? indicadorParam;
                if (alvo !== null) {
                    const row = await fetchIndicadorById(alvo);
                    if (!ativo) return;
                    await selecionarIndicador(row);
                }
                const unidadeId = metaUnidadeId(metaRow);
                if (unidadeId !== null) {
                    const {data} = await api.get<Record<string, unknown>>(`${UNIDADE_LIST_SOURCE}/${unidadeId}`);
                    if (!ativo) return;
                    setUnidade(toUnidadeOption(unidadeId, str(rec(data).sucinto)));
                }
                if (!ativo) return;
                setAno(num(metaRow.ano) === null ? '' : String(num(metaRow.ano)));
                setMes(num(metaRow.mes) === null ? '' : String(num(metaRow.mes)));
                setTodosMeses(num(metaRow.mes) === null && id !== null);
                setPerc(percFromRow(metaRow));

                if (id !== null) {
                    const [valoresRows, diasRows] = await Promise.all([fetchMetaValores(id), fetchMetaDiasNaoUteis(id)]);
                    if (!ativo) return;
                    setValores(valoresRows);
                    setDias(diasRows);
                }
            } catch (e) {
                console.error('Erro ao carregar meta dinâmica:', e);
                if (ativo) setErro('Erro ao carregar os dados da meta.');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        return () => { ativo = false; };
    }, [id, indicadorParam, selecionarIndicador]);

    const setValor = (idIndicadorMeta: number, valor: string) => {
        setValores((prev) => {
            const existente = prev.find((row) => num(rec(row).id_indicador_meta) === idIndicadorMeta);
            if (existente) {
                return prev.map((row) => (num(rec(row).id_indicador_meta) === idIndicadorMeta ? {...row, valor} : row));
            }
            return [...prev, {id_indicador_meta: idIndicadorMeta, valor}];
        });
    };

    const adicionarDia = () => {
        const dia = num(novoDia);
        if (dia === null) {
            setErro('Informe o dia para não diarizar.');
            return;
        }
        if (dias.some((row) => num(rec(row).dia) === dia)) {
            setErro('O dia informado já está na lista.');
            return;
        }
        setDias((prev) => [...prev, {dia}]);
        setNovoDia('');
        setErro(null);
    };

    const salvar = async (acao: 'continuar' | 'nova') => {
        if (!indicador) {
            setErro('Selecione o indicador da meta.');
            return;
        }
        if (!unidade) {
            setErro('Selecione a unidade da meta.');
            return;
        }
        if (flags.mes && !todosMeses && !mes) {
            setErro('Selecione o mês da meta.');
            return;
        }
        if (flags.ano && !ano) {
            setErro('Informe o ano da meta.');
            return;
        }
        setSalvando(true);
        setErro(null);
        setAviso(null);
        try {
            const novoId = await saveMetaDinamica(id, metaDinamicaBody({
                mes: todosMeses ? null : num(mes),
                ano: flags.ano ? num(ano) : null,
                perc,
                indicadorId: indicador.id,
                unidadeId: unidade.id,
            }));
            for (const meta of metas) {
                const metaId = num(rec(meta).id);
                if (metaId === null) continue;
                const row = valorDe(metaId);
                if (!row) continue;
                const body = metaValorBody(row.valor, metaId, novoId);
                if (row.id) await api.put(`${META_VALOR_SOURCE}/${row.id}`, body);
                else await api.post(META_VALOR_SOURCE, body);
            }
            for (const dia of dias) {
                if (dia.id) await api.put(`${META_DIAS_NAO_UTEIS_SOURCE}/${dia.id}`, {dia: dia.dia, id_meta: novoId});
                else await api.post(META_DIAS_NAO_UTEIS_SOURCE, {dia: dia.dia, id_meta: novoId});
            }
            setAviso('Meta salva com sucesso.');
            if (acao === 'nova') {
                // Navegar para a mesma rota reutiliza a tela e manteria os dados;
                // reinicia o estado para a próxima meta mantendo indicador/unidade.
                setId(null);
                setMes('');
                setAno('');
                setTodosMeses(false);
                setPerc({});
                setValores((prev) => prev.map((row) => ({id_indicador_meta: rec(row).id_indicador_meta, valor: rec(row).valor})));
                setDias((prev) => prev.map((row) => ({dia: rec(row).dia})));
                setNovoDia('');
            }
        } catch (e) {
            console.error('Erro ao salvar meta dinâmica:', e);
            setErro('Erro ao salvar a meta dinâmica.');
        } finally {
            setSalvando(false);
        }
    };

    const diarizar = async () => {
        if (id === null) {
            setErro('Salve a meta antes de diarizar os valores.');
            return;
        }
        setSalvando(true);
        setErro(null);
        try {
            await api.post(`${META_DINAMICA_API}/atualizar-valores-das-semanas`, null, {
                params: {metaDinamicaId: id},
            });
            setAviso('Diarização executada com sucesso.');
        } catch (e) {
            console.error('Erro ao diarizar:', e);
            setErro('Erro ao diarizar os valores da meta.');
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{id !== null ? 'Meta Dinâmica' : 'Nova Meta Dinâmica'}</Text>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

            <Text style={styles.section}>Definição</Text>
            <AutoComplete
                label="Indicador *"
                placeholder="Digite para buscar indicador..."
                value={indicador}
                onChange={(option) => {
                    if (!option) {
                        void selecionarIndicador(null);
                        return;
                    }
                    setIndicador(option);
                    void fetchIndicadorById(option.id)
                        .then((row) => selecionarIndicador(row))
                        .catch((e) => {
                            console.error('Erro ao carregar indicador:', e);
                            setErro('Erro ao carregar o indicador.');
                        });
                }}
                fetchOptions={fetchIndicadorOptions}
                minChars={2}
            />
            <UnidadeCombo label="Unidade *" value={unidade} onChange={setUnidade} minChars={0}/>

            {flags.mes ? (
                <>
                    <Pressable style={styles.toggleRow} onPress={() => setTodosMeses(!todosMeses)}>
                        <View style={[styles.checkbox, todosMeses && styles.checkboxAtivo]}>
                            {todosMeses ? <Text style={styles.check}>✓</Text> : null}
                        </View>
                        <Text style={styles.toggleLabel}>Todos os meses</Text>
                    </Pressable>
                    {!todosMeses ? (
                        <>
                            <Text style={styles.label}>Mês</Text>
                            <View style={styles.meses}>
                                {MESES.map((rotulo, indice) => {
                                    const valor = String(indice + 1);
                                    const ativo = mes === valor;
                                    return (
                                        <Pressable
                                            key={rotulo}
                                            onPress={() => setMes(valor)}
                                            style={[styles.chip, ativo && styles.chipAtivo]}
                                        >
                                            <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>
                                                {rotulo.slice(0, 3)}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
                    ) : null}
                </>
            ) : null}

            {flags.ano ? (
                <>
                    <Text style={styles.label}>Ano *</Text>
                    <TextInput style={styles.input} inputMode="numeric" value={ano} onChangeText={setAno} placeholder="2026"/>
                </>
            ) : null}

            <Text style={styles.section}>Metas</Text>
            {!indicador ? (
                <Text style={styles.vazio}>Selecione um indicador para carregar as metas.</Text>
            ) : metas.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma meta cadastrada para o indicador.</Text>
            ) : (
                metas.map((meta) => {
                    const metaId = num(rec(meta).id);
                    const row = metaId === null ? undefined : valorDe(metaId);
                    const formato = str(rec(meta).formato);
                    return (
                        <View style={styles.metaCard} key={str(rec(meta).id)}>
                            <Text style={styles.metaDescricao}>{str(rec(meta).descricao)}</Text>
                            <Text style={styles.metaFormato}>{FORMATO_LABELS[formato] ?? formato}</Text>
                            <TextInput
                                style={styles.input}
                                inputMode="decimal"
                                value={str(row?.valor)}
                                onChangeText={(texto) => metaId !== null && setValor(metaId, texto)}
                                placeholder="0,00"
                            />
                        </View>
                    );
                })
            )}

            {flags.semana ? (
                <>
                    <Text style={styles.section}>Percentual semana</Text>
                    {PERC_KEYS.map((chave) => (
                        <View style={styles.percRow} key={chave}>
                            <Text style={styles.percLabel}>{PERC_LABELS[chave]} (%)</Text>
                            <TextInput
                                style={[styles.input, styles.percInput]}
                                inputMode="decimal"
                                value={perc[chave] === null || perc[chave] === undefined ? '' : String(perc[chave])}
                                onChangeText={(texto) => setPerc((prev) => ({...prev, [chave]: num(texto)}))}
                                placeholder="0,00"
                            />
                        </View>
                    ))}
                    <Text style={styles.total}>Total: {percentualTotal.toFixed(2).replace('.', ',')}%</Text>
                </>
            ) : null}

            {flags.dia ? (
                <>
                    <Text style={styles.section}>Dias para não diarizar</Text>
                    <View style={styles.diaRow}>
                        <TextInput
                            style={[styles.input, styles.diaInput]}
                            inputMode="numeric"
                            value={novoDia}
                            onChangeText={setNovoDia}
                        />
                        <Pressable style={styles.botaoSecundario} onPress={adicionarDia}>
                            <Text style={styles.botaoSecundarioTexto}>Adicionar Dia</Text>
                        </Pressable>
                    </View>
                    {dias.length === 0 ? (
                        <Text style={styles.vazio}>Nenhum dia.</Text>
                    ) : (
                        dias.map((row, indice) => (
                            <View style={styles.diaCard} key={str(rec(row).id) || `novo-${indice}`}>
                                <Text style={styles.diaTexto}>Dia {str(rec(row).dia)}</Text>
                                <Pressable onPress={() => setDias((prev) => prev.filter((item) => item !== row))}>
                                    <Text style={styles.remover}>Remover</Text>
                                </Pressable>
                            </View>
                        ))
                    )}
                </>
            ) : null}

            <View style={styles.botoes}>
                <Pressable
                    style={[styles.botao, styles.botaoSecundario]}
                    onPress={() => navigation.goBack()}
                    disabled={salvando}
                >
                    <Text style={styles.botaoSecundarioTexto}>Voltar</Text>
                </Pressable>
                <Pressable
                    style={styles.botao}
                    onPress={() => void salvar('continuar')}
                    disabled={salvando}
                >
                    <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            </View>

            <View style={styles.botoes}>
                <Pressable
                    style={[styles.botao, styles.botaoSecundario]}
                    onPress={() => void salvar('nova')}
                    disabled={salvando}
                >
                    <Text style={styles.botaoSecundarioTexto}>Salvar e nova meta</Text>
                </Pressable>
                <Pressable
                    style={[styles.botao, styles.botaoSecundario]}
                    onPress={() => void diarizar()}
                    disabled={salvando || id === null}
                >
                    <Text style={styles.botaoSecundarioTexto}>Diarizar</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f5f5f5'},
    content: {padding: 16, paddingBottom: 40},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    title: {fontSize: 20, fontWeight: '700', color: '#1f2d3d', marginBottom: 12},
    section: {fontSize: 16, fontWeight: '700', color: '#1f2d3d', marginTop: 20, marginBottom: 8},
    label: {fontSize: 13, fontWeight: '600', color: '#55606e', marginTop: 12, marginBottom: 4},
    input: {
        borderWidth: 1,
        borderColor: '#ccd3db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1f2d3d',
        backgroundColor: '#fff',
    },
    erro: {color: '#a61b29', backgroundColor: '#fdecec', padding: 10, borderRadius: 6, marginBottom: 8},
    aviso: {color: '#1b5e20', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 6, marginBottom: 8},
    vazio: {color: '#8a94a0', fontStyle: 'italic'},
    toggleRow: {flexDirection: 'row', alignItems: 'center', marginTop: 12},
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#98a2ad',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    checkboxAtivo: {backgroundColor: '#2a5a88', borderColor: '#2a5a88'},
    check: {color: '#fff', fontSize: 14, fontWeight: '700'},
    toggleLabel: {fontSize: 15, color: '#1f2d3d'},
    meses: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ccd3db',
        backgroundColor: '#fff',
    },
    chipAtivo: {backgroundColor: '#2a5a88', borderColor: '#2a5a88'},
    chipText: {fontSize: 12, color: '#55606e'},
    chipTextAtivo: {color: '#fff', fontWeight: '700'},
    metaCard: {
        marginTop: 10,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccd3db',
        backgroundColor: '#fff',
        gap: 6,
    },
    metaDescricao: {fontSize: 14, fontWeight: '600', color: '#1f2d3d'},
    metaFormato: {fontSize: 12, color: '#8a94a0'},
    percRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
    percLabel: {flex: 1, fontSize: 14, color: '#1f2d3d'},
    percInput: {width: 110, textAlign: 'right'},
    total: {marginTop: 10, fontSize: 14, fontWeight: '700', color: '#2a5a88', textAlign: 'right'},
    diaRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
    diaInput: {width: 80},
    diaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e4e9',
        backgroundColor: '#fff',
    },
    diaTexto: {fontSize: 14, color: '#1f2d3d'},
    remover: {color: '#a61b29', fontWeight: '600', fontSize: 14},
    botaoSecundario: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2a5a88',
        alignItems: 'center',
    },
    botaoSecundarioTexto: {color: '#2a5a88', fontWeight: '600', fontSize: 14},
    botoes: {flexDirection: 'row', gap: 10, marginTop: 20},
    botao: {
        flex: 1,
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    botaoTexto: {color: '#fff', fontWeight: '700', fontSize: 15},
});
