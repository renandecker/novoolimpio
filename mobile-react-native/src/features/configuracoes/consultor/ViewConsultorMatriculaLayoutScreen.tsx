import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {api} from '../../../shared/services/api';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
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
    pessoaId?: number;
    nome: string;
    cpf: string;
}

interface PessoaJuridicaResponse {
    id: number;
    pessoaId?: number;
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

interface ContratoState {
    pessoa?: AutoCompleteOption | null;
    curriculo?: AutoCompleteOption | null;
    responsavel?: AutoCompleteOption | null;
    unidade?: AutoCompleteOption | null;
    testemunha1?: AutoCompleteOption | null;
    testemunha2?: AutoCompleteOption | null;
    tipoContratante?: 'fisica' | 'juridica';
}

interface InfoPessoaFisicaResponse {
    maioridade: 'DE MAIOR' | 'DE MENOR';
    financeiro: 'SEM DÍVIDAS' | 'COM DÍVIDAS';
    aluno: 'SIM' | 'NÃO';
    atualizarDados: 'SIM' | 'NÃO';
}

const INFO_PANELS_DEFAULT: InfoPessoaFisicaResponse = {
    maioridade: 'DE MAIOR',
    financeiro: 'SEM DÍVIDAS',
    aluno: 'NÃO',
    atualizarDados: 'NÃO',
};

function toAutoCompleteLabel(item: { id: number; pessoaId?: number; nome?: string; nomeFantasia?: string; cpf?: string; cnpj?: string; sucinto?: string; curso?: { nome: string } }): string {
    return item.nome
        ? `${item.nome} (${item.cpf || ''})`
        : item.nomeFantasia
        ? `${item.nomeFantasia} (${item.cnpj || ''})`
        : item.sucinto
        ? `${item.sucinto} - ${item.curso?.nome || ''}`
        : `#${item.id}`;
}

// Referência legado (extracted_aceso abasMatricula.xhtml):
// completeMethod="#{pessoaFisicaController.autoCompleteTestemunha}",
// itemLabel="#{pessoa.pessoaFisica.nome} (#{pessoa.pessoaFisica.cpf})", dropdown=true.
// Contrato.testemunha1/2 referenciam Pessoa (bas_pessoa id) -> usar pessoaId.
function toPessoaFisicaOption(item: PessoaFisicaResponse): AutoCompleteOption {
    const pessoaId = item.pessoaId ?? item.id;
    return { id: pessoaId, label: item.nome ? `${item.nome} (${item.cpf || ''})` : `#${pessoaId}` };
}

function toPessoaJuridicaOption(item: PessoaJuridicaResponse): AutoCompleteOption {
    const pessoaId = item.pessoaId ?? item.id;
    return { id: pessoaId, label: item.nomeFantasia ? `${item.nomeFantasia} (${item.cnpj || ''})` : `#${pessoaId}` };
}

function badgeColor(value: string, kind: keyof InfoPessoaFisicaResponse): string {
    switch (kind) {
        case 'maioridade':
            return value === 'DE MENOR' ? '#c0392b' : '#27ae60';
        case 'financeiro':
            return value === 'COM DÍVIDAS' ? '#c0392b' : '#27ae60';
        case 'aluno':
            return value === 'SIM' ? '#27ae60' : '#c0392b';
        default:
            return value === 'SIM' ? '#c0392b' : '#27ae60';
    }
}

export default function ViewConsultorMatriculaLayoutScreen() {
    const navigation: any = useNavigation();
    const [activeTab, setActiveTab] = useState<'contrato' | 'matricula'>('contrato');
    const [grupos, setGrupos] = useState<OferecimentoGrupo[]>([]);
    const [ofertasLivre, setOfertasLivre] = useState<OferecimentoItem[]>([]);
    const [filtro, setFiltro] = useState<FiltroMatricula>({ tipoMatricula: 'LIVRE' });
    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState<ContratoState>({ tipoContratante: 'fisica' });
    const [matriculaSelecionadas, setMatriculaSelecionadas] = useState<OferecimentoItem[]>([]);
    const [infoPanels, setInfoPanels] = useState<InfoPessoaFisicaResponse>(INFO_PANELS_DEFAULT);

    const loadAlunos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query && query.length < 3) return [];
        try {
            const response = await api.get<ContratoAutoCompleteResponse[]>('/api/educacao/contrato/auto-complete-aluno', { params: { query } });
            return response.data.map(item => ({ id: item.id, label: item.nome || `#${item.id}` }));
        } catch (e) {
            console.error('Erro ao buscar alunos:', e);
            return [];
        }
    }, []);

    const loadCurriculos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        try {
            const response = await api.get<CurriculoResponse[]>('/api/educacao/curriculo/auto-complete-full', { params: { query } });
            return response.data.map(item => ({ id: item.id, label: toAutoCompleteLabel(item) }));
        } catch (e) {
            console.error('Erro ao buscar currículos:', e);
            return [];
        }
    }, []);

    const loadUnidades = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        try {
            const response = await api.get<UnidadeResponse[]>('/api/basico/unidade');
            const termo = (query || '').toLowerCase();
            return response.data
                .filter(u => !termo || (u.sucinto || '').toLowerCase().includes(termo))
                .map(u => ({ id: u.id, label: u.sucinto || `#${u.id}` }));
        } catch (e) {
            console.error('Erro ao buscar unidades:', e);
            return [];
        }
    }, []);

    const loadPessoasFisicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query && query.length < 3) return [];
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-todos', { params: { query } });
            return response.data.map(toPessoaFisicaOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas físicas:', e);
            return [];
        }
    }, []);

    const loadPessoasJuridicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query && query.length < 3) return [];
        try {
            const response = await api.get<PessoaJuridicaResponse[]>('/api/basico/pessoa-juridica/auto-complete-todos', { params: { query } });
            return response.data.map(toPessoaJuridicaOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas jurídicas:', e);
            return [];
        }
    }, []);

    const loadTestemunhas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (query && query.length < 3) return [];
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-testemunha', { params: { query } });
            return response.data.map(toPessoaFisicaOption);
        } catch (e) {
            console.error('Erro ao buscar testemunhas:', e);
            return [];
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
        if (filtro.tipoMatricula === 'GRUPO') {
            loadGrupos();
        } else {
            loadOfertasLivre();
        }
    }, [filtro, loadGrupos, loadOfertasLivre]);

    const calcularInfoPanels = useCallback(async (pessoaId: number) => {
        try {
            const response = await api.get<InfoPessoaFisicaResponse>(`/api/educacao/matricula/calcular-info-pessoa-fisica/${pessoaId}`);
            setInfoPanels(response.data);
        } catch (e) {
            console.error('Erro ao calcular info panels:', e);
            setInfoPanels(INFO_PANELS_DEFAULT);
        }
    }, []);

    const resetInfoPanels = useCallback(() => setInfoPanels(INFO_PANELS_DEFAULT), []);

    // Ao retornar do cadastro/edição de pessoa, atualiza os painéis do aluno selecionado.
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            const pessoa = contrato.pessoa;
            if (pessoa) calcularInfoPanels(pessoa.id);
        });
        return unsubscribe;
    }, [navigation, contrato.pessoa, calcularInfoPanels]);

    const handleAlunoSelect = (option: AutoCompleteOption | null) => {
        if (option) {
            setContrato(prev => ({ ...prev, pessoa: option }));
            calcularInfoPanels(option.id);
        } else {
            setContrato(prev => ({ ...prev, pessoa: null }));
            resetInfoPanels();
        }
    };

    const handleCursoSelect = (option: AutoCompleteOption | null) => {
        setContrato(prev => ({ ...prev, curriculo: option }));
        setFiltro(prev => ({ ...prev, curriculoId: option?.id }));
    };

    const handleResponsavelSelect = (option: AutoCompleteOption | null) => {
        setContrato(prev => ({ ...prev, responsavel: option }));
    };

    const handleUnidadeChange = (option: AutoCompleteOption | null) => {
        setContrato(prev => ({ ...prev, unidade: option }));
        setFiltro(prev => ({ ...prev, unidadeId: option?.id }));
    };

    const handleTestemunhaSelect = (option: AutoCompleteOption | null, num: 1 | 2) => {
        setContrato(prev => ({ ...prev, [`testemunha${num}`]: option }));
    };

    const abrirPessoaFisica = (id?: number) => {
        navigation.navigate('view/pessoa/formPessoaFisica' as never, (id ? { id } : {}) as never);
    };

    const abrirPessoaJuridica = (id?: number) => {
        navigation.navigate('view/pessoa/formPessoaJuridica' as never, (id ? { id } : {}) as never);
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

    const handleTipoMatriculaChange = (tipo: 'GRUPO' | 'LIVRE') => {
        setFiltro(prev => ({ ...prev, tipoMatricula: tipo }));
    };

    const renderInfoPanel = (label: string, value: string, kind: keyof InfoPessoaFisicaResponse) => (
        <View style={[styles.panelBadge, { borderColor: badgeColor(value, kind) }]}>
            <Text style={styles.panelBadgeLabel}>{label}</Text>
            <Text style={[styles.panelBadgeValue, { color: badgeColor(value, kind) }]}>{value}</Text>
        </View>
    );

    const renderRadio = (label: string, checked: boolean, onPress: () => void) => (
        <Pressable style={styles.radioItem} onPress={onPress}>
            <View style={[styles.radioOuter, checked && styles.radioOuterChecked]}>
                {checked && <View style={styles.radioInner} />}
            </View>
            <Text>{label}</Text>
        </Pressable>
    );

    const renderContratoTab = () => (
        <ScrollView style={styles.tabContent}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados do Aluno</Text>
                <View style={styles.fieldRow}>
                    <View style={styles.field}>
                        <AutoComplete
                            label="Aluno *"
                            value={contrato.pessoa ?? null}
                            onChange={handleAlunoSelect}
                            fetchOptions={loadAlunos}
                            minChars={3}
                        />
                    </View>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => abrirPessoaFisica()}>
                        <Text style={styles.actionBtnText}>Novo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, !contrato.pessoa && styles.actionBtnDisabled]}
                        disabled={!contrato.pessoa}
                        onPress={() => contrato.pessoa && abrirPessoaFisica(contrato.pessoa.id)}
                    >
                        <Text style={styles.actionBtnText}>Editar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.panelsRow}>
                    {renderInfoPanel('Maioridade', infoPanels.maioridade, 'maioridade')}
                    {renderInfoPanel('Financeiro', infoPanels.financeiro, 'financeiro')}
                    {renderInfoPanel('Aluno', infoPanels.aluno, 'aluno')}
                    {renderInfoPanel('Atualizar Dados', infoPanels.atualizarDados, 'atualizarDados')}
                </View>
                <View style={styles.field}>
                    <AutoComplete
                        label="Curso *"
                        value={contrato.curriculo ?? null}
                        onChange={handleCursoSelect}
                        fetchOptions={loadCurriculos}
                        minChars={2}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de Contratante</Text>
                <View style={styles.radioGroup}>
                    {renderRadio('Pessoa Física', contrato.tipoContratante === 'fisica', () => setContrato(prev => ({ ...prev, tipoContratante: 'fisica', responsavel: null })))}
                    {renderRadio('Pessoa Jurídica', contrato.tipoContratante === 'juridica', () => setContrato(prev => ({ ...prev, tipoContratante: 'juridica', responsavel: null })))}
                </View>
                <View style={styles.fieldRow}>
                    <View style={styles.field}>
                        {contrato.tipoContratante === 'juridica' ? (
                            <AutoComplete
                                label="Contratante *"
                                value={contrato.responsavel ?? null}
                                onChange={handleResponsavelSelect}
                                fetchOptions={loadPessoasJuridicas}
                                minChars={3}
                            />
                        ) : (
                            <AutoComplete
                                label="Contratante *"
                                value={contrato.responsavel ?? null}
                                onChange={handleResponsavelSelect}
                                fetchOptions={loadPessoasFisicas}
                                minChars={3}
                            />
                        )}
                    </View>
                    {contrato.tipoContratante === 'juridica' ? (
                        <>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => abrirPessoaJuridica()}>
                                <Text style={styles.actionBtnText}>Novo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, !contrato.responsavel && styles.actionBtnDisabled]}
                                disabled={!contrato.responsavel}
                                onPress={() => contrato.responsavel && abrirPessoaJuridica(contrato.responsavel.id)}
                            >
                                <Text style={styles.actionBtnText}>Editar</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => abrirPessoaFisica()}>
                                <Text style={styles.actionBtnText}>Novo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, !contrato.responsavel && styles.actionBtnDisabled]}
                                disabled={!contrato.responsavel}
                                onPress={() => contrato.responsavel && abrirPessoaFisica(contrato.responsavel.id)}
                            >
                                <Text style={styles.actionBtnText}>Editar</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Unidade</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <AutoComplete
                            label="Unidade do Contrato *"
                            value={contrato.unidade ?? null}
                            onChange={handleUnidadeChange}
                            fetchOptions={loadUnidades}
                            minChars={0}
                            minDropdownResults={50}
                        />
                    </View>
                </View>
                <Text style={styles.sectionTitle}>Testemunhas</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <AutoComplete
                            label="Primeira Testemunha"
                            value={contrato.testemunha1 ?? null}
                            onChange={option => handleTestemunhaSelect(option, 1)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <AutoComplete
                            label="Segunda Testemunha"
                            value={contrato.testemunha2 ?? null}
                            onChange={option => handleTestemunhaSelect(option, 2)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderMatriculaTab = () => {
        const curriculo = contrato.curriculo;
        return (
        <ScrollView style={styles.tabContent}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Curso Selecionado</Text>
                <View style={{ backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: '#666', fontWeight: 'bold' }}>CURSO / SUCINTO</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1d2025' }}>
                        {curriculo?.label || 'Nenhum curso selecionado'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filtro Busca</Text>
                <View style={styles.row}>
                    <View style={styles.field}>
                        <AutoComplete
                            label="Unidade"
                            value={contrato.unidade ?? null}
                            onChange={handleUnidadeChange}
                            fetchOptions={loadUnidades}
                            minChars={0}
                            minDropdownResults={50}
                        />
                    </View>
                </View>
                <View style={styles.radioGroup}>
                    {renderRadio('Grupo', filtro.tipoMatricula === 'GRUPO', () => handleTipoMatriculaChange('GRUPO'))}
                    {renderRadio('Livre', filtro.tipoMatricula === 'LIVRE', () => handleTipoMatriculaChange('LIVRE'))}
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
                                <TouchableOpacity key={oferta.id} style={[styles.ofertaItem, oferta.selected && styles.ofertaItemSelected]} onPress={() => handleOfertaSelect(oferta)}>
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
                                </TouchableOpacity>
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
    };

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
    fieldRow: {flexDirection: 'row', gap: 8, alignItems: 'flex-start'},
    field: {flex: 1},
    label: {fontSize: 14, color: '#666', marginBottom: 4},
    radioGroup: {flexDirection: 'row', gap: 16, marginVertical: 8},
    radioItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
    radioOuter: {width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#999', alignItems: 'center', justifyContent: 'center'},
    radioOuterChecked: {borderColor: '#007AFF'},
    radioInner: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#007AFF'},
    actionBtn: {backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 4, marginBottom: 12},
    actionBtnDisabled: {backgroundColor: '#b0c4de'},
    actionBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
    panelsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
    panelBadge: {borderWidth: 1, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, minWidth: 110, backgroundColor: '#fff'},
    panelBadgeLabel: {fontSize: 11, color: '#666'},
    panelBadgeValue: {fontSize: 13, fontWeight: 'bold'},
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
