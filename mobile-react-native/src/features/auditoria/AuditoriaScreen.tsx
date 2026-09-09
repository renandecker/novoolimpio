import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {Tabs} from '../../Tabs';

// Uma aba por tela do menu com tabela _aud correspondente. Telas do menu que
// compartilham a mesma tabela fisica usam uma unica aba (ex.: "Oferecimento
// de Curso" + "Oferecimento Componente Curricular" -> "Oferecimentos").
// Mantem as mesmas chaves `entidade` da tela web e da whitelist do backend
// (AuditoriaRepository.TABELAS).
const AUDITORIA_TABS: Array<{ key: string; label: string; entidade: string }> = [
    {key: 'matricula', label: 'Matrícula / Rematrícula', entidade: 'matricula'},
    {key: 'oferecimento', label: 'Oferecimentos', entidade: 'oferecimento'},
    {key: 'contrato', label: 'Contrato', entidade: 'contrato'},
    {key: 'desistente', label: 'Desistentes', entidade: 'desistente'},
    {key: 'componenteCurricular', label: 'Componente Curricular', entidade: 'componenteCurricular'},
    {key: 'curso', label: 'Curso', entidade: 'curso'},
    {key: 'curriculo', label: 'Currículo do Curso', entidade: 'curriculo'},
    {key: 'tipoCurso', label: 'Tipo de Curso', entidade: 'tipoCurso'},
    {key: 'grupo', label: 'Grupo do Oferecimento', entidade: 'grupo'},
    {key: 'grupoComponenteCurricular', label: 'Grupo Componente Curricular', entidade: 'grupoComponenteCurricular'},
    {key: 'tipoMatrizCurricular', label: 'Tipo de Matriz Curricular', entidade: 'tipoMatrizCurricular'},
    {key: 'baseTecnologica', label: 'Base Tecnológica', entidade: 'baseTecnologica'},
    {key: 'criterio', label: 'Critérios de Curso', entidade: 'criterio'},
    {key: 'grau', label: 'Grau (Requisito de Aprovação)', entidade: 'grau'},
    {key: 'tempoAula', label: 'Tempo Aula', entidade: 'tempoAula'},
    {key: 'tipoContrato', label: 'Tipo de Contrato', entidade: 'tipoContrato'},
    {key: 'valorCurso', label: 'Valor do Curso', entidade: 'valorCurso'},
    {key: 'professor', label: 'Professor', entidade: 'professor'},
    {key: 'historicoAluno', label: 'Histórico do Aluno', entidade: 'historicoAluno'},
    {key: 'chamadaAssinada', label: 'Chamada Assinada', entidade: 'chamadaAssinada'},
    {key: 'referenciaBibliografica', label: 'Referência Bibliográfica', entidade: 'referenciaBibliografica'},
    {key: 'sala', label: 'Sala', entidade: 'sala'},
    {key: 'tipoSala', label: 'Tipo de Sala', entidade: 'tipoSala'},
    {key: 'turnoAula', label: 'Turno Aula', entidade: 'turnoAula'},
    {key: 'etapasNap', label: 'Etapas NAP', entidade: 'etapasNap'},
    {key: 'resultadoLigacaoNap', label: 'Resultado Ligação NAP', entidade: 'resultadoLigacaoNap'},
    {key: 'livro', label: 'Livros', entidade: 'livro'},
    {key: 'configuracaoLivro', label: 'Configuração de Livros', entidade: 'configuracaoLivro'},
    {key: 'pessoaFisica', label: 'Pessoa Física', entidade: 'pessoaFisica'},
    {key: 'pessoaJuridica', label: 'Pessoa Jurídica', entidade: 'pessoaJuridica'},
    {key: 'unidade', label: 'Unidade', entidade: 'unidade'},
    {key: 'rede', label: 'Rede de Franquias', entidade: 'rede'},
    {key: 'agenda', label: 'Agenda', entidade: 'agenda'},
    {key: 'compromisso', label: 'Compromisso', entidade: 'compromisso'},
    {key: 'tipoCompromisso', label: 'Tipo de Compromisso', entidade: 'tipoCompromisso'},
    {key: 'statusCompromisso', label: 'Status do Compromisso', entidade: 'statusCompromisso'},
    {key: 'tipoAgenda', label: 'Tipo de Agenda', entidade: 'tipoAgenda'},
    {key: 'resultado', label: 'Resultado de Agendamento', entidade: 'resultado'},
    {key: 'horario', label: 'Horário', entidade: 'horario'},
    {key: 'feriado', label: 'Feriado', entidade: 'feriado'},
    {key: 'motivo', label: 'Motivo', entidade: 'motivo'},
    {key: 'logradouro', label: 'Logradouro', entidade: 'logradouro'},
    {key: 'bairro', label: 'Bairro', entidade: 'bairro'},
    {key: 'cidade', label: 'Cidade', entidade: 'cidade'},
    {key: 'estado', label: 'Estado', entidade: 'estado'},
    {key: 'pais', label: 'País', entidade: 'pais'},
    {key: 'regiao', label: 'Região', entidade: 'regiao'},
    {key: 'telefone', label: 'Telefone', entidade: 'telefone'},
    {key: 'tipoTelefone', label: 'Tipo de Telefone', entidade: 'tipoTelefone'},
    {key: 'tipoUnidade', label: 'Tipo de Unidade', entidade: 'tipoUnidade'},
    {key: 'escolaridade', label: 'Escolaridade', entidade: 'escolaridade'},
    {key: 'estadoCivil', label: 'Estado Civil', entidade: 'estadoCivil'},
    {key: 'etnia', label: 'Etnia', entidade: 'etnia'},
    {key: 'genero', label: 'Gênero', entidade: 'genero'},
    {key: 'funcao', label: 'Função de Funcionários', entidade: 'funcao'},
    {key: 'turnoFuncionario', label: 'Turno de Funcionários', entidade: 'turnoFuncionario'},
    {key: 'usuario', label: 'Usuário', entidade: 'usuario'},
    {key: 'perfil', label: 'Perfil', entidade: 'perfil'},
    {key: 'modulo', label: 'Módulo', entidade: 'modulo'},
    {key: 'config', label: 'Configuração', entidade: 'config'},
    {key: 'layout', label: 'Estrutura do Sistema', entidade: 'layout'},
    {key: 'favoritoUsuario', label: 'Favoritos', entidade: 'favoritoUsuario'},
    {key: 'cpfAlunosAntigos', label: 'CPF Alunos Antigos', entidade: 'cpfAlunosAntigos'},
    {key: 'comunicacao', label: 'Comunicação', entidade: 'comunicacao'},
    {key: 'fornecedor', label: 'Fornecedor', entidade: 'fornecedor'},
    {key: 'apresentacao', label: 'Apresentação', entidade: 'apresentacao'},
    {key: 'prospecto', label: 'Prospectos', entidade: 'prospecto'},
    {key: 'campanha', label: 'Campanha', entidade: 'campanha'},
    {key: 'acao', label: 'Ação', entidade: 'acao'},
    {key: 'tipoAcao', label: 'Tipo de Ação', entidade: 'tipoAcao'},
    {key: 'tipoCanal', label: 'Tipo do Canal', entidade: 'tipoCanal'},
    {key: 'estrategia', label: 'Estratégia', entidade: 'estrategia'},
    {key: 'indicador', label: 'Indicador', entidade: 'indicador'},
    {key: 'pacote', label: 'Pacote', entidade: 'pacote'},
    {key: 'campo', label: 'Campo', entidade: 'campo'},
    {key: 'meta', label: 'Metas', entidade: 'meta'},
    {key: 'operacional', label: 'Operacional', entidade: 'operacional'},
    {key: 'tipoPausa', label: 'Tipo de Pausa', entidade: 'tipoPausa'},
    {key: 'turnoTrabalho', label: 'Turno de Trabalho', entidade: 'turnoTrabalho'},
    {key: 'turnoUsuario', label: 'Turno dos Operadores', entidade: 'turnoUsuario'},
    {key: 'resultadoContato', label: 'Resultado da Ligação', entidade: 'resultadoContato'},
    {key: 'configuracaoMarketing', label: 'Configuração de Marketing', entidade: 'configuracaoMarketing'},
    {key: 'etapasCobranca', label: 'Etapas de Cobrança', entidade: 'etapasCobranca'},
    {key: 'resultadoLigacaoCobranca', label: 'Resultado Ligação Cobrança', entidade: 'resultadoLigacaoCobranca'},
    {key: 'campanhaNegociacao', label: 'Campanhas de Negociação', entidade: 'campanhaNegociacao'},
    {key: 'movimento', label: 'Movimento Financeiro', entidade: 'movimento'},
    {key: 'tipoHistorico', label: 'Tipo de Histórico', entidade: 'tipoHistorico'},
    {key: 'contaCorrente', label: 'Conta Corrente', entidade: 'contaCorrente'},
    {key: 'impressora', label: 'Cadastro de Impressora', entidade: 'impressora'},
    {key: 'diaPagamento', label: 'Dias Pagamento de Parcelas', entidade: 'diaPagamento'},
    {key: 'custoServico', label: 'Custo por Serviço', entidade: 'custoServico'},
    {key: 'modeloCarta', label: 'Modelo de Carta', entidade: 'modeloCarta'},
    {key: 'valorProduto', label: 'Valor do Produto', entidade: 'valorProduto'},
    {key: 'configuracaoCaixa', label: 'Configuração do Caixa', entidade: 'configuracaoCaixa'},
    {key: 'configuracaoParcela', label: 'Configuração de Parcela', entidade: 'configuracaoParcela'},
    {key: 'produto', label: 'Produtos', entidade: 'produto'},
    {key: 'entrega', label: 'Entrega', entidade: 'entrega'},
    {key: 'controleEstoque', label: 'Controle de Estoque', entidade: 'controleEstoque'},
    {key: 'configuracaoEstoque', label: 'Configuração de Estoque', entidade: 'configuracaoEstoque'},
    {key: 'estrutura', label: 'Estrutura de Relatório', entidade: 'estrutura'},
    {key: 'tabela', label: 'Tabelas', entidade: 'tabela'},
    {key: 'mapa', label: 'Mapas', entidade: 'mapa'},
    {key: 'grafico', label: 'Gráfico', entidade: 'grafico'},
    {key: 'organograma', label: 'Organograma', entidade: 'organograma'},
    {key: 'painel', label: 'Painel (Dashboard)', entidade: 'painel'},
    {key: 'extrator', label: 'Extrator', entidade: 'extrator'},
];

interface AuditoriaCampo {
    nome: string;
    valor: unknown;
}

interface AuditoriaItem {
    entidade: string;
    id: number | null;
    rev: number | null;
    revType: number | null;
    data: number | string | null;
    usuario: string | null;
    acao: string | null;
    campos: AuditoriaCampo[];
}

interface AuditoriaPaged {
    content: AuditoriaItem[];
    totalElements: number;
    page: number;
    size: number;
    totalPages: number;
}

const PAGE_SIZE = 20;

const formatData = (data: number | string | null): string => {
    if (data === null || data === undefined) return '-';
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return String(data);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

const formatValor = (valor: unknown): string => {
    if (valor === null || valor === undefined) return '-';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    return String(valor);
};

function AuditTab({entidade, titulo}: { entidade: string; titulo: string }) {
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const query = useQuery({
        queryKey: ['auditoria', entidade, page],
        queryFn: async () => {
            const response = await api.get<AuditoriaPaged>('/api/educacao/auditoria', {
                params: {entidade, page, size: PAGE_SIZE},
            });
            return response.data;
        },
    });

    const items = query.data?.content ?? [];
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);
    const totalElements = query.data?.totalElements ?? 0;

    const toggle = (item: AuditoriaItem) => {
        const key = `${item.id}-${item.rev}`;
        setExpanded((prev) => ({...prev, [key]: !prev[key]}));
    };

    if (query.isPending) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large"/>
                <Text style={styles.muted}>Carregando...</Text>
            </View>
        );
    }

    if (query.isError) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>Erro ao carregar a auditoria de {titulo.toLowerCase()}.</Text>
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.muted}>Nenhum registro encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.list}>
            <FlatList
                data={items}
                keyExtractor={(item) => `${item.id}-${item.rev}`}
                renderItem={({item}) => {
                    const key = `${item.id}-${item.rev}`;
                    const isOpen = Boolean(expanded[key]);
                    return (
                        <View style={styles.card}>
                            <Pressable onPress={() => toggle(item)} style={styles.row}>
                                <Text style={styles.toggle}>{isOpen ? '▼' : '▶'}</Text>
                                <View style={styles.rowMain}>
                                    <Text style={styles.rowTitle}>Id {item.id ?? '-'} · Rev {item.rev ?? '-'}</Text>
                                    <Text style={styles.rowSub}>{formatData(item.data)}</Text>
                                    <Text style={styles.rowSub}>{item.usuario ?? '-'} · {item.acao ?? '-'}</Text>
                                </View>
                            </Pressable>
                            {isOpen && (
                                <View style={styles.detail}>
                                    {item.campos.length === 0 ? (
                                        <Text style={styles.muted}>Nenhum campo.</Text>
                                    ) : (
                                        item.campos.map((campo) => (
                                            <View key={campo.nome} style={styles.field}>
                                                <Text style={styles.fieldLabel}>{campo.nome}</Text>
                                                <Text style={styles.fieldValue}>{formatValor(campo.valor)}</Text>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    );
                }}
            />
            <View style={styles.pager}>
                <Pressable
                    style={[styles.pageButton, (page === 0 || query.isFetching) && styles.pageButtonDisabled]}
                    disabled={page === 0 || query.isFetching}
                    onPress={() => setPage((current) => Math.max(0, current - 1))}
                >
                    <Text style={styles.pageButtonLabel}>Anterior</Text>
                </Pressable>
                <Text style={styles.muted}>
                    Página {page + 1} de {totalPages} · Total {totalElements}
                </Text>
                <Pressable
                    style={[styles.pageButton, (page >= totalPages - 1 || query.isFetching) && styles.pageButtonDisabled]}
                    disabled={page >= totalPages - 1 || query.isFetching}
                    onPress={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                >
                    <Text style={styles.pageButtonLabel}>Próxima</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function AuditoriaScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Auditoria</Text>
            <Tabs
                tabs={AUDITORIA_TABS.map((tab) => ({
                    key: tab.key,
                    label: tab.label,
                    content: <AuditTab entidade={tab.entidade} titulo={tab.label}/>,
                }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 12},
    title: {fontSize: 20, fontWeight: '700', marginBottom: 8},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32},
    muted: {color: '#888', fontStyle: 'italic'},
    error: {color: '#B00020'},
    list: {flex: 1},
    card: {borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 8, overflow: 'hidden'},
    row: {flexDirection: 'row', alignItems: 'center', padding: 10},
    toggle: {width: 24, color: '#2a5a88', fontWeight: '700'},
    rowMain: {flex: 1},
    rowTitle: {fontSize: 14, fontWeight: '700'},
    rowSub: {fontSize: 12, color: '#666'},
    detail: {borderTopWidth: 1, borderTopColor: '#eee', padding: 10},
    field: {flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2},
    fieldLabel: {fontSize: 12, fontWeight: '600', flex: 1},
    fieldValue: {fontSize: 12, color: '#333', flex: 1, textAlign: 'right'},
    pager: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8},
    pageButton: {paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#2a5a88', borderRadius: 6},
    pageButtonDisabled: {backgroundColor: '#aaa'},
    pageButtonLabel: {color: '#fff', fontWeight: '600'},
});
