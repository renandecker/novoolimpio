import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Alert} from '../../../shared/components/SweetAlert';
import {api} from '../../../shared/services/api';
import {
    FORMATOS,
    INDICADOR_API,
    INDICADOR_META_SOURCE,
    bool,
    fetchIndicadorMetas,
    num,
    rec,
    str,
} from '../meta/metaDinamica';

interface MetaIndicador {
    id: number | null;
    descricao: string;
    formato: string;
}

const PARAMETRO = 'id';

const paraMeta = (row: Record<string, unknown>): MetaIndicador => ({
    id: num(row.id),
    descricao: str(row.descricao),
    formato: str(row.formato),
});

export default function ViewIndicadorFormIndicadorListScreen() {
    const navigation = useNavigation();
    const route = useRoute<{params?: Record<string, string>}>();
    const id = num(route.params?.[PARAMETRO]) ?? num(route.params?.indicadorId);

    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);

    const [nome, setNome] = useState('');
    const [dia, setDia] = useState(false);
    const [mes, setMes] = useState(false);
    const [ano, setAno] = useState(false);
    const [semana, setSemana] = useState(false);
    const [metas, setMetas] = useState<MetaIndicador[]>([]);
    const [removidas, setRemovidas] = useState<number[]>([]);
    const [novaDescricao, setNovaDescricao] = useState('');
    const [novoFormato, setNovoFormato] = useState('');

    const carregar = useCallback(async (indicadorId: number) => {
        setCarregando(true);
        setErro(null);
        try {
            const {data} = await api.get<Record<string, unknown>>(`${INDICADOR_API}/${indicadorId}`);
            const row = rec(data);
            setNome(str(row.nome));
            setDia(bool(row.dia));
            setMes(bool(row.mes));
            setAno(bool(row.ano));
            setSemana(bool(row.semana));
            setMetas((await fetchIndicadorMetas(indicadorId)).map(paraMeta));
        } catch (e) {
            console.error('Erro ao carregar indicador:', e);
            setErro('Erro ao carregar o indicador.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        if (id !== null) void carregar(id);
    }, [id, carregar]);

    const adicionarMeta = () => {
        if (!novaDescricao.trim()) {
            setErro('Informe a descrição da meta.');
            return;
        }
        if (!novoFormato) {
            setErro('Selecione o formato da meta.');
            return;
        }
        setMetas((prev) => [...prev, {id: null, descricao: novaDescricao.trim(), formato: novoFormato}]);
        setNovaDescricao('');
        setNovoFormato('');
        setErro(null);
    };

    const removerMeta = (meta: MetaIndicador) => {
        if (meta.id !== null) setRemovidas((prev) => [...prev, meta.id as number]);
        setMetas((prev) => prev.filter((item) => item !== meta));
    };

    const salvar = async () => {
        if (!nome.trim()) {
            setErro('Informe o nome do indicador.');
            return;
        }
        if (metas.length === 0) {
            setErro('Cadastre ao menos uma meta para o indicador.');
            return;
        }
        setSalvando(true);
        setErro(null);
        setAviso(null);
        try {
            const body = {nome: nome.trim(), dia, mes, ano, semana};
            let indicadorId = id;
            if (indicadorId === null) {
                const {data} = await api.post<Record<string, unknown>>(INDICADOR_API, body);
                indicadorId = num(rec(data).id);
            } else {
                await api.put(`${INDICADOR_API}/${indicadorId}`, body);
            }
            if (indicadorId === null) throw new Error('Indicador sem id');

            for (const meta of metas) {
                const metaBody = {descricao: meta.descricao.trim(), formato: meta.formato, id_indicador: indicadorId};
                if (meta.id !== null) await api.put(`${INDICADOR_META_SOURCE}/${meta.id}`, metaBody);
                else await api.post(INDICADOR_META_SOURCE, metaBody);
            }
            for (const removida of removidas) {
                await api.delete(`${INDICADOR_META_SOURCE}/${removida}`);
            }

            setAviso('Indicador salvo com sucesso.');
            if (id === null) navigation.goBack();
            else await carregar(indicadorId);
            setRemovidas([]);
        } catch (e) {
            console.error('Erro ao salvar indicador:', e);
            setErro('Erro ao salvar o indicador.');
        } finally {
            setSalvando(false);
        }
    };

    const confirmarSaida = () => {
        Alert.alert('Sair', 'As alterações não salvas serão perdidas. Deseja sair?', [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Sair', style: 'destructive', onPress: () => navigation.goBack()},
        ]);
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
            <Text style={styles.title}>{id !== null ? 'Alterar Indicador' : 'Novo Indicador'}</Text>

            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

            <Text style={styles.label}>ID</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={id !== null ? String(id) : ''} editable={false}/>

            <Text style={styles.label}>Nome *</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome}/>

            <Toggle label="Dia" value={dia} onChange={setDia}/>
            <Toggle label="Mês" value={mes} onChange={setMes}/>
            <Toggle label="Ano" value={ano} onChange={setAno}/>
            <Toggle label="Percentual Semana" value={semana} onChange={setSemana}/>

            <Text style={styles.sectionTitle}>Metas</Text>
            <View style={styles.addRow}>
                <TextInput
                    style={[styles.input, styles.addInput]}
                    placeholder="Nome da meta"
                    value={novaDescricao}
                    onChangeText={setNovaDescricao}
                />
                <View style={styles.formatos}>
                    {FORMATOS.map((formato) => (
                        <Pressable
                            key={formato.value}
                            onPress={() => setNovoFormato(formato.value)}
                            style={[styles.chip, novoFormato === formato.value && styles.chipAtivo]}
                        >
                            <Text style={[styles.chipText, novoFormato === formato.value && styles.chipTextAtivo]}>
                                {formato.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            <Pressable style={styles.botaoSecundario} onPress={adicionarMeta}>
                <Text style={styles.botaoSecundarioTexto}>Adicionar meta</Text>
            </Pressable>

            {metas.length === 0 ? (
                <Text style={styles.vazio}>Nenhum registro encontrado.</Text>
            ) : (
                metas.map((meta, index) => (
                    <View style={styles.metaCard} key={meta.id ?? `nova-${index}`}>
                        <TextInput
                            style={styles.input}
                            value={meta.descricao}
                            onChangeText={(texto) => setMetas((prev) => prev.map((item, i) =>
                                (i === index ? {...item, descricao: texto} : item)))}
                        />
                        <View style={styles.metaFooter}>
                            <View style={styles.formatos}>
                                {FORMATOS.map((formato) => (
                                    <Pressable
                                        key={formato.value}
                                        onPress={() => setMetas((prev) => prev.map((item, i) =>
                                            (i === index ? {...item, formato: formato.value} : item)))}
                                        style={[styles.chip, meta.formato === formato.value && styles.chipAtivo]}
                                    >
                                        <Text style={[styles.chipText, meta.formato === formato.value && styles.chipTextAtivo]}>
                                            {formato.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Pressable onPress={() => removerMeta(meta)}>
                                <Text style={styles.remover}>Remover</Text>
                            </Pressable>
                        </View>
                    </View>
                ))
            )}

            <View style={styles.botoes}>
                <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={confirmarSaida} disabled={salvando}>
                    <Text style={styles.botaoSecundarioTexto}>Voltar</Text>
                </Pressable>
                <Pressable style={styles.botao} onPress={() => void salvar()} disabled={salvando}>
                    <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

function Toggle({label, value, onChange}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <Pressable style={styles.toggleRow} onPress={() => onChange(!value)}>
            <View style={[styles.checkbox, value && styles.checkboxAtivo]}>
                {value ? <Text style={styles.check}>✓</Text> : null}
            </View>
            <Text style={styles.toggleLabel}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f5f5f5'},
    content: {padding: 16, paddingBottom: 40},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    title: {fontSize: 20, fontWeight: '700', color: '#1f2d3d', marginBottom: 16},
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
    inputDisabled: {backgroundColor: '#eceff2'},
    erro: {color: '#a61b29', backgroundColor: '#fdecec', padding: 10, borderRadius: 6, marginBottom: 8},
    aviso: {color: '#1b5e20', backgroundColor: '#e8f5e9', padding: 10, borderRadius: 6, marginBottom: 8},
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
    sectionTitle: {fontSize: 16, fontWeight: '700', color: '#1f2d3d', marginTop: 24, marginBottom: 8},
    addRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
    addInput: {flex: 1},
    formatos: {flexDirection: 'row', gap: 6, flexWrap: 'wrap'},
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
    botaoSecundario: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2a5a88',
        alignItems: 'center',
    },
    botaoSecundarioTexto: {color: '#2a5a88', fontWeight: '600', fontSize: 14},
    vazio: {color: '#8a94a0', fontStyle: 'italic', marginTop: 12},
    metaCard: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccd3db',
        backgroundColor: '#fff',
    },
    metaFooter: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10},
    remover: {color: '#a61b29', fontWeight: '600', fontSize: 14},
    botoes: {flexDirection: 'row', gap: 10, marginTop: 24},
    botao: {
        flex: 1,
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    botaoTexto: {color: '#fff', fontWeight: '700', fontSize: 15},
});
