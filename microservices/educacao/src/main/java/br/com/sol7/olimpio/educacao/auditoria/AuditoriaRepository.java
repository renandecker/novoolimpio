package br.com.sol7.olimpio.educacao.auditoria;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

import java.util.List;
import java.util.Map;

@ApplicationScoped
public class AuditoriaRepository {

    // Whitelist: tabelas _aud legadas (Envers) expostas na tela de auditoria.
    // Mapeamento: chave frontend -> tabela do banco.
    // Regra: uma entrada por tabela fisica. Telas do menu que compartilham a
    // mesma tabela (ex.: "Oferecimento de Curso" e "Oferecimento Componente
    // Curricular" -> edc_oferecimento_componente_curricular_aud, ou
    // "Matricula" e "Rematricula" -> edc_matricula_aud) usam a mesma chave.
    // Telas do menu sem tabela _aud correspondente (ex.: Turma, Caixa,
    // Disponibilidades, Mensagens, NAP/Cobranca operacionais) ficam de fora.
    private static final Map<String, String> TABELAS = Map.ofEntries(
            Map.entry("matricula", "public.edc_matricula_aud"),
            Map.entry("oferecimento", "public.edc_oferecimento_componente_curricular_aud"),
            Map.entry("contrato", "public.edc_contrato_aud"),
            Map.entry("desistente", "public.edc_desistente_aud"),
            Map.entry("componenteCurricular", "public.edc_componente_curricular_aud"),
            Map.entry("curso", "public.edc_curso_aud"),
            Map.entry("curriculo", "public.edc_curriculo_aud"),
            Map.entry("tipoCurso", "public.edc_tipo_curso_aud"),
            Map.entry("grupo", "public.edc_grupo_aud"),
            Map.entry("grupoComponenteCurricular", "public.edc_grupo_componente_curricular_aud"),
            Map.entry("tipoMatrizCurricular", "public.edc_tipo_matriz_curricular_aud"),
            Map.entry("baseTecnologica", "public.edc_base_tecnologica_aud"),
            Map.entry("criterio", "public.edc_criterio_aud"),
            Map.entry("grau", "public.edc_grau_aud"),
            Map.entry("tempoAula", "public.edc_tempo_aula_aud"),
            Map.entry("tipoContrato", "public.edc_tipo_contrato_aud"),
            Map.entry("valorCurso", "public.edc_valor_curso_aud"),
            Map.entry("professor", "public.edc_professor_aud"),
            Map.entry("historicoAluno", "public.edc_historico_aluno_aud"),
            Map.entry("chamadaAssinada", "public.edc_chamada_assinada_impressa_aud"),
            Map.entry("referenciaBibliografica", "public.edc_referencia_bibliografica_aud"),
            Map.entry("sala", "public.edc_sala_aud"),
            Map.entry("tipoSala", "public.edc_tipo_sala_aud"),
            Map.entry("turnoAula", "public.edc_turno_aud"),
            Map.entry("etapasNap", "public.edc_etapas_nap_aud"),
            Map.entry("resultadoLigacaoNap", "public.edc_resultado_ligacao_nap_aud"),
            Map.entry("livro", "public.bib_livro_aud"),
            Map.entry("configuracaoLivro", "public.bib_configuracao_livro_aud"),
            Map.entry("livroDigital", "public.bib_livro_digital_aud"),
            Map.entry("licencaAcervo", "public.bib_licenca_acervo_aud"),
            Map.entry("emprestimoDigital", "public.bib_emprestimo_digital_aud"),
            Map.entry("filaEspera", "public.bib_fila_espera_digital_aud"),
            Map.entry("provedor", "public.bib_provedor_aud"),
            Map.entry("pessoaFisica", "public.bas_pessoa_fisica_aud"),
            Map.entry("pessoaJuridica", "public.bas_pessoa_juridica_aud"),
            Map.entry("unidade", "public.bas_unidade_aud"),
            Map.entry("rede", "public.bas_rede_aud"),
            Map.entry("agenda", "public.bas_agenda_aud"),
            Map.entry("compromisso", "public.bas_compromisso_aud"),
            Map.entry("tipoCompromisso", "public.bas_tipo_compromisso_aud"),
            Map.entry("statusCompromisso", "public.bas_status_compromisso_aud"),
            Map.entry("tipoAgenda", "public.bas_tipo_agenda_aud"),
            Map.entry("resultado", "public.bas_resultado_aud"),
            Map.entry("horario", "public.bas_horario_aud"),
            Map.entry("feriado", "public.bas_feriado_aud"),
            Map.entry("motivo", "public.bas_motivo_aud"),
            Map.entry("logradouro", "public.bas_logradouro_aud"),
            Map.entry("bairro", "public.bas_bairro_aud"),
            Map.entry("cidade", "public.bas_cidade_aud"),
            Map.entry("estado", "public.bas_estado_aud"),
            Map.entry("pais", "public.bas_pais_aud"),
            Map.entry("regiao", "public.bas_regiao_aud"),
            Map.entry("telefone", "public.bas_telefone_aud"),
            Map.entry("tipoTelefone", "public.bas_tipo_telefone_aud"),
            Map.entry("tipoUnidade", "public.bas_tipo_unidade_aud"),
            Map.entry("escolaridade", "public.bas_escolaridade_aud"),
            Map.entry("estadoCivil", "public.bas_estado_civil_aud"),
            Map.entry("etnia", "public.bas_etnia_aud"),
            Map.entry("genero", "public.bas_genero_aud"),
            Map.entry("funcao", "public.bas_funcao_aud"),
            Map.entry("turnoFuncionario", "public.bas_turno_funcionario_aud"),
            Map.entry("usuario", "public.bas_usuario_aud"),
            Map.entry("perfil", "public.bas_perfil_aud"),
            Map.entry("modulo", "public.bas_modulo_aud"),
            Map.entry("config", "public.bas_config_aud"),
            Map.entry("layout", "public.bas_layout_aud"),
            Map.entry("favoritoUsuario", "public.bas_favorito_usuario_aud"),
            Map.entry("cpfAlunosAntigos", "public.bas_cpf_alunos_antigos_aud"),
            Map.entry("comunicacao", "public.bas_comunicacao_aud"),
            Map.entry("fornecedor", "public.bas_fornecedor_aud"),
            Map.entry("apresentacao", "public.bas_apresentacao_aud"),
            Map.entry("prospecto", "public.com_prospecto_aud"),
            Map.entry("campanha", "public.com_campanha_aud"),
            Map.entry("acao", "public.com_acao_aud"),
            Map.entry("tipoAcao", "public.com_tipo_acao_aud"),
            Map.entry("tipoCanal", "public.com_tipo_canal_aud"),
            Map.entry("estrategia", "public.com_estrategia_aud"),
            Map.entry("indicador", "public.com_indicador_aud"),
            Map.entry("pacote", "public.com_pacote_aud"),
            Map.entry("campo", "public.com_campo_aud"),
            Map.entry("meta", "public.com_meta_dinamica_aud"),
            Map.entry("operacional", "public.cen_operacional_aud"),
            Map.entry("tipoPausa", "public.cen_tipo_pausa_aud"),
            Map.entry("turnoTrabalho", "public.cen_turno_trabalho_aud"),
            Map.entry("turnoUsuario", "public.cen_turno_usuario_aud"),
            Map.entry("resultadoContato", "public.cen_resultado_contato_aud"),
            Map.entry("configuracaoMarketing", "public.cen_configuracao_marketing_aud"),
            Map.entry("etapasCobranca", "public.fin_etapas_cobranca_aud"),
            Map.entry("resultadoLigacaoCobranca", "public.fin_resultado_ligacao_cobranca_aud"),
            Map.entry("campanhaNegociacao", "public.fin_campanha_negociacao_aud"),
            Map.entry("movimento", "public.fin_movimento_aud"),
            Map.entry("tipoHistorico", "public.fin_tipo_historico_aud"),
            Map.entry("contaCorrente", "public.fin_conta_corrente_aud"),
            Map.entry("impressora", "public.fin_impressora_aud"),
            Map.entry("diaPagamento", "public.fin_dia_pagamento_aud"),
            Map.entry("custoServico", "public.fin_custo_servico_aud"),
            Map.entry("modeloCarta", "public.fin_modelo_carta_aud"),
            Map.entry("valorProduto", "public.fin_valor_produto_aud"),
            Map.entry("configuracaoCaixa", "public.fin_configuracao_caixa_aud"),
            Map.entry("configuracaoParcela", "public.fin_configuracao_parcela_aud"),
            Map.entry("produto", "public.est_produto_aud"),
            Map.entry("entrega", "public.est_entrega_aud"),
            Map.entry("controleEstoque", "public.est_controle_estoque_aud"),
            Map.entry("configuracaoEstoque", "public.est_configuracao_estoque_aud"),
            Map.entry("estrutura", "public.rel_estrutura_aud"),
            Map.entry("tabela", "public.rel_tabela_aud"),
            Map.entry("mapa", "public.rel_mapa_aud"),
            Map.entry("grafico", "public.rel_grafico_aud"),
            Map.entry("organograma", "public.rel_organograma_aud"),
            Map.entry("painel", "public.rel_painel_aud"),
            Map.entry("extrator", "public.rel_extrator_aud")
    );

    public boolean existeEntidade(String entidade) {
        return TABELAS.containsKey(entidade);
    }

    private String sqlLista(String tabela) {
        return "SELECT a.*, ba.\"timestamp\" AS \"rev_timestamp\", ba.username AS \"rev_usuario\", ba.action AS \"rev_action\""
                + " FROM " + tabela + " a"
                + " JOIN public.bas_auditoria ba ON ba.id = a.rev"
                + " ORDER BY ba.\"timestamp\" DESC, a.rev DESC, a.id DESC";
    }

    private String sqlConta(String tabela) {
        return "SELECT count(*) FROM " + tabela + " a"
                + " JOIN public.bas_auditoria ba ON ba.id = a.rev";
    }

    public Uni<List<Tuple>> listar(String entidade, int page, int size) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sqlLista(TABELAS.get(entidade)), Tuple.class)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList());
    }

    public Uni<Long> contar(String entidade) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sqlConta(TABELAS.get(entidade)))
                .getSingleResult())
                .map(resultado -> ((Number) resultado).longValue());
    }
}
