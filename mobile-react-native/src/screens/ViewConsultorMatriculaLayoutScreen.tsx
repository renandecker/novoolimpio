import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, RadioButton} from 'react-native';
import {ModuleList} from '../ModuleListScreen';
import {ModuleWizard} from '../ModuleWizard';
import {api} from '../api';
import {useState, useEffect, useCallback} from 'react';

interface ContratoAutoCompleteResponse {
    id: number;
    nome: string;
}

interface CurriculoResponse {
    id: number;
    sucinto: string;
    curso: { nome: string };
    tipoCurso: { descricao: string };
    cargaHoraria: number;
}

interface UnidadeResponse {
    id: number;
    sucinto: string;
}

interface PessoaFisicaResponse {
    id: number;
    nome: string;
    cpf: string;
}

interface PessoaJuridicaResponse {
    id: number;
    nomeFantasia: string;
    cnpj: string;
}

interface OferecimentoGrupo {
    id: number;
    grupo: string;
    unidade: { sucinto: string };
    horario: string;
    selected: boolean;
}

interface OferecimentoItem {
    id: number;
    status: string;
    unidade: { sucinto: string };
    sala: { numero: string };
    componenteCurricular: { descricao: string; cargaHoraria: number };
    dataInicio: string;
    dataFim: string;
    professor?: { pessoa?: { pessoaFisica?: { nome: string }; pessoaJuridica?: { nomeFantasia: string } } };
    disabledComponenteCurricular?: boolean;
    disabledConflitoDia?: boolean;
    disabledRequisito?: boolean;
    motivo?: string;
    selected?: boolean;
}

interface FiltroMatricula {
    unidadeId?: number;
    turnoEducacaoId?: number;
    diaSemanaId?: number;
    curriculoId?: number;
    tipoMatricula: 'GRUPO' | 'LIVRE';
}

function toAutoCompleteLabel(item: { id: number; nome?: string; nomeFantasia?: string; cpf?: string; cnpj?: string; sucinto?: string; curso?: { nome: string } }): string {
    return item.nome 
        ? `${item.nome} (${item.cpf || ''})`
        : item.nomeFantasia
        ? `${item.nomeFantasia} (${item.cnpj || ''})`
        : item.sucinto
        ? `${item.sucinto} - ${item.curso?.nome || ''}`
        : `#${item.id}`;
}

export default function ViewConsultorMatriculaLayoutScreen() {
    const [activeTab, setActiveTab] = useState<'contrato' | 'matricula'>('contrato');
    const [alunos, setAlunos] = useState<{id: number; label: string}[]>([]);
    const [curriculos, setCurriculos] = useState<{id: number; label: string}[]>([]);
    const [unidades, setUnidades] = useState<UnidadeResponse[]>([]);
    const [pessoasFisicas, setPessoasFisicas] = useState<{id: number; label: string}[]>([]);
    const [pessoasJuridicas, setPessoasJuridicas] = useState<{id: number; label: string}[]>([]);
    const [testemunhas, setTestemunhas] = useState<{id: number; label: string}[]>([]);
    const [grupos, setGrupos] = useState<OferecimentoGrupo[]>([]);
    const [ofertasLivre, setOfertasLivre] = useState<OferecimentoItem[]>([]);
    const [filtro, setFiltro] = useState<FiltroMatricula>({ tipoMatricula: 'LIVRE' });
    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState<Record<string, unknown>>({});
    const [matriculaSelecionadas, setMatriculaSelecionadas] = useState<OferecimentoItem[]>([]);

    const loadAlunos = useCallback(async (query: string) => {
        if (!query || query.length < 3) return;
        try {
            const response = await api.get<ContratoAutoCompleteResponse[]>('/api/educacao/contrato/auto-complete-aluno', { params: { query } });
            setAlunos(response.data.map(toAutoCompleteLabel).map(l => ({id: l.split(' ')[0] as unknown as number, label: l})));
        } catch (e) {
            console.error('Erro ao buscar alunos:', e);
        }
    }, []);

    const loadCurriculos = useCallback(async (query: string) => {
        if (!query) return;
        try {
            const response = await api.get<CurriculoResponse[]>('/api/educacao/curriculo/auto-complete-full', { params: { query } });
            setCurriculos(response.data.map(toAutoCompleteLabel).map(l => ({id: l.split(' ')[0] as unknown as number, label: l})));
        } catch (e) {
            console.error('Erro ao buscar currículos:', e);
        }
    }, []);

    const loadUnidades = useCallback(async () => {
        try {
            const response = await api.get<UnidadeResponse[]>('/api/basico/unidade');
            setUnidades(response.data);
        } catch (e) {
            console.error('Erro ao buscar unidades:', e);
        }
    }, []);

    const loadPessoasFisicas = useCallback(async (query: string) => {
        if (!query || query.length < 3) return;
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-todos', { params: { query } });
            setPessoasFisicas(response.data.map(toAutoCompleteLabel).map(l => ({id: l.split(' ')[0] as unknown as number, label: l})));
        } catch (e) {
            console.error('Erro ao buscar pessoas físicas:', e);
        }
    }, []);

    const loadPessoasJuridicas = useCallback(async (query: string) => {
        if (!query || query.length < 3) return;
        try {
            const response = await api.get<PessoaJuridicaResponse[]>('/api/basico/pessoa-juridica/auto-complete-todos', { params: { query } });
            setPessoasJuridicas(response.data.map(toAutoCompleteLabel).map(l => ({id: l.split(' ')[0] as unknown as number, label: l})));
        } catch (e) {
            console.error('Erro ao buscar pessoas jurídicas:', e);
        }
    }, []);

    const loadTestemunhas = useCallback(async (query: string) => {
        if (!query || query.length < 3) return;
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-testemunha', { params: { query } });
            setTestemunhas(response.data.map(toAutoCompleteLabel).map(l => ({id: l.split(' ')[0] as unknown as number, label: l})));
        } catch (e) {
            console.error('Erro ao buscar testemunhas:', e);
        }
    }, []);

    const loadGrupos = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            const response = await api.get<OferecimentoGrupo[]>(`/api/educacao/oferecimento-curso/listar-grupos?${params}`);
            setGrupos(response.data);
        } catch (e) {
            console.error('Erro ao buscar grupos:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    const loadOfertasLivre = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            if (filtro.turnoEducacaoId) params.append('turnoEducacaoId', String(filtro.turnoEducacaoId));
            if (filtro.diaSemanaId) params.append('diaSemanaId', String(filtro.diaSemanaId));
            const response = await api.get<{ content: OferecimentoItem[] }>(`/api/educacao/oferecimento-componente-curricular/paged?${params}`);
            setOfertasLivre(response.data.content || []);
        } catch (e) {
            console.error('Erro ao buscar ofertas livre:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    useEffect(() => {
        if (filtro.tipoMatricula === 'GRUPO') {
            loadGrupos();
        } else {
            loadOfertasLivre();
        }
    }, [filtro, loadGrupos, loadOfertasLivre]);

    const handleAlunoSelect = (option: {id: number; label: string} | null) => {
        if (option) setContrato(prev => ({ ...prev, pessoa: option }));
    };

    const handleCursoSelect = (option: {id: number; label: string} | null) => {
        if (option) {
            setContrato(prev => ({ ...prev, curriculo: option }));
            setFiltro(prev => ({ ...prev, curriculoId: option.id }));
        }
    };

    const handleResponsavelSelect = (option: {id: number; label: string} | null, tipo: 'fisica' | 'juridica') => {
        if (option) setContrato(prev => ({ ...prev, responsavel: option, tipoContratante: tipo }));
    };

    const handleUnidadeChange = (unidade: UnidadeResponse | undefined) => {
        if (unidade) {
            setContrato(prev => ({ ...prev, unidade }));
            setFiltro(prev => ({ ...prev, unidadeId: unidade.id }));
        }
    };

    const handleTestemunhaSelect = (option: {id: number; label: string} | null, num: 1 | 2) => {
        if (option) setContrato(prev => ({ ...prev, [`testemunha${num}`]: option }));
    };

    const handleGrupoSelect = (grupo: OferecimentoGrupo) => {
        setGrupos(prev => prev.map(g => ({
            ...g,
            selected: g.id === grupo.id ? !grupo.selected : g.selected
        })));
    };

    const handleOfertaSelect = (oferta: OferecimentoItem) => {
        setOfertasLivre(prev => prev.map(o => ({
            ...o,
            selected: o.id === oferta.id ? !oferta.selected : o.selected
        })));
        if (!oferta.selected) {
            setMatriculaSelecionadas(prev => [...prev, oferta]);
        } else {
            setMatriculaSelecionadas(prev => prev.filter(o => o.id !== oferta.id));
        }
    };

    const handleFiltroChange = (key: keyof FiltroMatricula, value: unknown) => {
        setFiltro(prev => ({ ...prev, [key]: value }));
    };

    const handleTipoMatriculaChange = (tipo: 'GRUPO' | 'LIVRE') => {
        setFiltro(prev => ({ ...prev, tipoMatricula: tipo }));
    };

    const renderContratoTab = () => (
        <ScrollView style={styles.tabContent}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados do Aluno</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Aluno *</Text>
                        <ModuleList path="/api/educacao/contrato/auto-complete-aluno" />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Curso *</Text>
                        <ModuleList path="/api/educacao/curriculo/auto-complete-full" />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de Contratante</Text>
                <View style={styles.radioGroup}>
                    <View style={styles.radioItem}>
                        <RadioButton value="fisica" status={contrato.tipoContratante === 'fisica' ? 'checked' : 'unchecked'} onPress={() => setContrato(prev => ({ ...prev, tipoContratante: 'fisica' }))} />
                        <Text>Pessoa Física</Text>
                    </View>
                    <View style={styles.radioItem}>
                        <RadioButton value="juridica" status={contrato.tipoContratante === 'juridica' ? 'checked' : 'unchecked'} onPress={() => setContrato(prev => ({ ...prev, tipoContratante: 'juridica' }))} />
                        <Text>Pessoa Jurídica</Text>
                    </View>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Contratante *</Text>
                    {contrato.tipoContratante === 'fisica' ? (
                        <ModuleList path="/api/basico/pessoa-fisica/auto-complete-todos" />
                    ) : (
                        <ModuleList path="/api/basico/pessoa-juridica/auto-complete-todos" />
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Unidade e Testemunhas</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Unidade do Contrato *</Text>
                        <ModuleList path="/api/basico/unidade" />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Primeira Testemunha</Text>
                        <ModuleList path="/api/basico/pessoa-fisica/auto-complete-testemunha" />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Segunda Testemunha</Text>
                        <ModuleList path="/api/basico/pessoa-fisica/auto-complete-testemunha" />
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderMatriculaTab = () => (
        <ScrollView style={styles.tabContent}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Curso Selecionado</Text>
                <Text>{contrato.curriculo ? (contrato.curriculo as {label: string}).label : 'Não selecionado'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filtro Busca</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Unidade</Text>
                        <ModuleList path="/api/basico/unidade" />
                    </View>
                </View>
                <View style={styles.radioGroup}>
                    <View style={styles.radioItem}>
                        <RadioButton value="GRUPO" status={filtro.tipoMatricula === 'GRUPO' ? 'checked' : 'unchecked'} onPress={() => handleTipoMatriculaChange('GRUPO')} />
                        <Text>Grupo</Text>
                    </View>
                    <View style={styles.radioItem}>
                        <RadioButton value="LIVRE" status={filtro.tipoMatricula === 'LIVRE' ? 'checked' : 'unchecked'} onPress={() => handleTipoMatriculaChange('LIVRE')} />
                        <Text>Livre</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={() => filtro.tipoMatricula === 'GRUPO' ? loadGrupos() : loadOfertasLivre()}>
                    <Text style={styles.buttonText}>Filtrar</Text>
                </TouchableOpacity>
            </View>

            {filtro.tipoMatricula === 'GRUPO' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Grupos ({grupos.length})</Text>
                    {loading ? (
                        <Text>Carregando...</Text>
                    ) : grupos.length === 0 ? (
                        <Text>Nenhum grupo encontrado</Text>
                    ) : (
                        <ScrollView horizontal={true} style={styles.gruposScroll}>
                            {grupos.map(grupo => (
                                <TouchableOpacity key={grupo.id} style={[styles.grupoCard, grupo.selected && styles.grupoCardSelected]} onPress={() => handleGrupoSelect(grupo)}>
                                    <Text style={styles.grupoTitle}>{grupo.grupo}</Text>
                                    <Text>{grupo.unidade?.sucinto}</Text>
                                    <Text>{grupo.horario}</Text>
                                    <View style={styles.grupoActions}>
                                        <TouchableOpacity style={[styles.smallButton, styles.blueButton]} onPress={() => handleGrupoSelect(grupo)}>
                                            <Text style={styles.buttonText}>{grupo.selected ? 'Desmarcar' : 'Marcar'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {filtro.tipoMatricula === 'LIVRE' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ofertas Livre ({ofertasLivre.length})</Text>
                    {loading ? (
                        <Text>Carregando...</Text>
                    ) : ofertasLivre.length === 0 ? (
                        <Text>Nenhuma oferta encontrada</Text>
                    ) : (
                        <View>
                            {ofertasLivre.map(oferta => (
                                <View key={oferta.id} style={[styles.ofertaItem, oferta.selected && styles.ofertaItemSelected]}>
                                    <View style={styles.ofertaHeader}>
                                        <View style={styles.ofertaStatus}>
                                            <Text style={{fontWeight: 'bold'}}>{oferta.status}</Text>
                                        </View>
                                        <View style={styles.ofertaFields}>
                                            <Text>Turma {oferta.id}</Text>
                                            <Text>{oferta.unidade?.sucinto}</Text>
                                            <Text>{oferta.componenteCurricular?.descricao}</Text>
                                            <Text>{oferta.dataInicio} - {oferta.dataFim}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selecionados ({matriculaSelecionadas.length})</Text>
                {matriculaSelecionadas.map(o => (
                    <View key={o.id} style={styles.selectedItem}>
                        <Text>{o.componenteCurricular?.descricao}</Text>
                        <Text>{o.unidade?.sucinto} - Sala {o.sala?.numero}</Text>
                        <Text>{o.dataInicio} - {o.dataFim}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'contrato' && styles.tabActive]} onPress={() => setActiveTab('contrato')}>
                    <Text style={[styles.tabText, activeTab === 'contrato' && styles.tabTextActive]}>Contrato</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'matricula' && styles.tabActive]} onPress={() => setActiveTab('matricula')}>
                    <Text style={[styles.tabText, activeTab === 'matricula' && styles.tabTextActive]}>Matrícula</Text>
                </TouchableOpacity>
            </View>
            {activeTab === 'contrato' ? renderContratoTab() : renderMatriculaTab()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    tabs: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd'},
    tab: {flex: 1, paddingVertical: 12, alignItems: 'center'},
    tabActive: {borderBottomWidth: 2, borderBottomColor: '#007AFF'},
    tabText: {fontSize: 16, color: '#666'},
    tabTextActive: {color: '#007AFF', fontWeight: 'bold'},
    tabContent: {flex: 1, padding: 16},
    section: {marginBottom: 20},
    sectionTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333'},
    row: {flexDirection: 'row', gap: 12},
    field: {flex: 1},
    label: {fontSize: 14, color: '#666', marginBottom: 4},
    radioGroup: {flexDirection: 'row', gap: 16, marginVertical: 8},
    radioItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
    button: {backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 4, alignSelf: 'flex-start', marginTop: 8},
    buttonText: {color: '#fff', fontWeight: 'bold'},
    blueButton: {backgroundColor: '#007AFF'},
    smallButton: {paddingVertical: 6, paddingHorizontal: 12},
    gruposScroll: {flexDirection: 'row', gap: 12, paddingVertical: 8},
    grupoCard: {width: 200, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff'},
    grupoCardSelected: {backgroundColor: '#e8f5e9', borderColor: '#4caf50'},
    grupoTitle: {fontWeight: 'bold', fontSize: 16, marginBottom: 4},
    grupoActions: {marginTop: 12, flexDirection: 'row', gap: 8},
    ofertaItem: {borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, marginBottom: 8, backgroundColor: '#fff'},
    ofertaItemSelected: {backgroundColor: '#e8f5e9', borderColor: '#4caf50'},
    ofertaHeader: {flexDirection: 'row', gap: 8, alignItems: 'center'},
    ofertaStatus: {width: 80},
    ofertaFields: {flex: 1},
    selectedItem: {borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, marginBottom: 8, backgroundColor: '#f9f9f9'},
});