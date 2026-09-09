import {useState} from 'react';

import {useQuery} from '@tanstack/react-query';

import {PermissionGate} from '../../../shared/services/permissions';

import {Tabs} from '../../../shared/components/Tabs';

import {auditoriaApi, type AuditoriaItem} from '../../auditoria/auditoria';


const PAGE_SIZES = [10, 20, 50, 100];


const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());


const formatData = (data: number | string | null | undefined): string => {
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


function AuditTable({entidade, titulo}: { entidade: string; titulo: string }) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});


    const query = useQuery({
        queryKey: ['auditoria', entidade, page, size],
        queryFn: () => auditoriaApi.listar(entidade, page, size),
    });


    const items = query.data?.content ?? [];
    const totalElements = query.data?.totalElements ?? 0;
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);


    const toggle = (item: AuditoriaItem) =>
        setExpanded((prev) => ({...prev, [`${item.id}-${item.rev}`]: !prev[`${item.id}-${item.rev}`]}));


    return (
        <div className="data-table">
            {query.isError ? (
                <p>Erro ao carregar a auditoria de {titulo.toLowerCase()}.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th className="col-toggle"></th>
                        <th className="col-id">Id</th>
                        <th>Rev</th>
                        <th>Data</th>
                        <th>Usuário</th>
                        <th>Ação</th>
                    </tr>
                    </thead>
                    <tbody>
                    {query.isLoading && items.length === 0 ? (
                        <tr>
                            <td colSpan={6}>Carregando...</td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={6}>Nenhum registro encontrado.</td>
                        </tr>
                    ) : (
                        items.flatMap((item) => {
                            const rowKey = `${item.id}-${item.rev}`;
                            const isOpen = Boolean(expanded[rowKey]);
                            const row = (
                                <tr key={`${rowKey}-row`}>
                                    <td className="col-toggle">
                                        <button
                                            type="button"
                                            className="btn-row-toggle"
                                            title={isOpen ? 'Recolher' : 'Expandir'}
                                            onClick={() => toggle(item)}
                                        >
                                            {isOpen ? '▼' : '▶'}
                                        </button>
                                    </td>
                                    <td className="col-id">{item.id}</td>
                                    <td>{item.rev}</td>
                                    <td>{formatData(item.data)}</td>
                                    <td>{item.usuario ?? '-'}</td>
                                    <td>{item.acao ?? '-'}</td>
                                </tr>
                            );

                            if (!isOpen) return [row];
                            return [
                                row,
                                <tr key={`${rowKey}-detail`} className="row-detail">
                                    <td colSpan={6}>
                                        <div className="sub-columns">
                                            {item.campos.length === 0 ? (
                                                <span className="sub-column-label">Nenhum campo.</span>
                                            ) : (
                                                item.campos.map((campo) => (
                                                    <div key={campo.nome} className="sub-column">
                                                        <span className="sub-column-label">{toTitle(campo.nome)}</span>
                                                        <span className="sub-column-value">{formatValor(campo.valor)}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                </tr>,
                            ];
                        })
                    )}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={6} className="data-table-paginator">
                            <button
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || query.isFetching}
                            >
                                Anterior
                            </button>
                            <span>
                  Página {page + 1} de {totalPages}
                </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || query.isFetching}
                            >
                                Próxima
                            </button>
                            <label>
                                Registros por página
                                <select
                                    value={size}
                                    onChange={(event) => {
                                        setSize(Number(event.target.value));
                                        setPage(0);
                                    }}
                                >
                                    {PAGE_SIZES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <span>Total: {totalElements}</span>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
}


// Uma aba por tela do menu com tabela _aud correspondente. Telas do menu que
// compartilham a mesma tabela fisica usam uma unica aba (ex.: "Oferecimento
// de Curso" + "Oferecimento Componente Curricular" -> "Oferecimentos";
// "Matricula" + "Rematricula" -> "Matricula / Rematricula"). Telas sem
// tabela _aud (ex.: Turma, Caixa, Disponibilidades, Mensagens, operacao de
// NAP/Cobranca) nao geram aba. Toda chave `entidade` existe na whitelist do
// backend (AuditoriaRepository.TABELAS).
const AUDITORIA_TABS: Array<{ key: string; label: string; entidade: string }> = [
    // Academico: matricula, oferecimentos, contrato e desistencias
    {key: 'matricula', label: 'Matrícula / Rematrícula', entidade: 'matricula'},
    {key: 'oferecimento', label: 'Oferecimentos', entidade: 'oferecimento'},
    {key: 'contrato', label: 'Contrato', entidade: 'contrato'},
    {key: 'desistente', label: 'Desistentes', entidade: 'desistente'},
    // Academico: estrutura de cursos
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
    // Biblioteca
    {key: 'livro', label: 'Livros', entidade: 'livro'},
    {key: 'configuracaoLivro', label: 'Configuração de Livros', entidade: 'configuracaoLivro'},
    // Cadastros basicos: pessoas, unidades e agenda
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
    // Sistema e seguranca
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
    // Comercial / call center
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
    // Financeiro e cobranca
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
    // Estoque
    {key: 'produto', label: 'Produtos', entidade: 'produto'},
    {key: 'entrega', label: 'Entrega', entidade: 'entrega'},
    {key: 'controleEstoque', label: 'Controle de Estoque', entidade: 'controleEstoque'},
    {key: 'configuracaoEstoque', label: 'Configuração de Estoque', entidade: 'configuracaoEstoque'},
    // Relatorios
    {key: 'estrutura', label: 'Estrutura de Relatório', entidade: 'estrutura'},
    {key: 'tabela', label: 'Tabelas', entidade: 'tabela'},
    {key: 'mapa', label: 'Mapas', entidade: 'mapa'},
    {key: 'grafico', label: 'Gráfico', entidade: 'grafico'},
    {key: 'organograma', label: 'Organograma', entidade: 'organograma'},
    {key: 'painel', label: 'Painel (Dashboard)', entidade: 'painel'},
    {key: 'extrator', label: 'Extrator', entidade: 'extrator'},
];


export default function AuditoriaScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Auditoria</h1>
                <Tabs
                    tabs={AUDITORIA_TABS.map((tab) => ({
                        key: tab.key,
                        label: tab.label,
                        content: <AuditTable entidade={tab.entidade} titulo={tab.label} />,
                    }))}
                />
            </main>
        </PermissionGate>
    );
}