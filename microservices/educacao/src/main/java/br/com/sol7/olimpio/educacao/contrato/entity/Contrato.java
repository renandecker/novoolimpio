package br.com.sol7.olimpio.educacao.contrato;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "edc_contrato")
public class Contrato extends PanacheEntity {

    @Column(name = "id_curso")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_unidade_resposavel")
    public Long unidadeResponsavelId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_contrato_ultimo")
    public Long ultimoContratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_contrato_anterior")
    public Long contratoAnteriorId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_compromisso")
    public Long compromissoId;  // referencia a Compromisso (id, cross-service)
    @Column(name = "id_valor_curso")
    public Long valorCursoId;  // referencia a ValorCurso (id, cross-service)
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "id_desconto_curso")
    public Long descontoCursoId;  // referencia a DescontoCurso (id, cross-service)
    @Column(name = "id_taxa_curso")
    public Long taxaCursoId;  // referencia a TaxaCurso (id, cross-service)
    @Column(name = "id_forma_pagamento")
    public Long formaPagamentoId;  // referencia a FormaPagamento (id, cross-service)
    @Column(name = "valor_desconto")
    public BigDecimal valorDesconto;
    @Column(name = "valor_taxa")
    public BigDecimal valorTaxa;
    @Column(name = "id_responsavel")
    public Long responsavelId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "data_conclusao")
    public Date dataConclusao;
    @Column(name = "local")
    public String local;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_testemunha1")
    public Long testemunha1Id;  // referencia a Pessoa (id, cross-service)
    @Column(name = "id_testemunha2")
    public Long testemunha2Id;  // referencia a Pessoa (id, cross-service)
    @Column(name = "ativo")
    public Boolean ativo;
    @Column(name = "inscricao")
    public Boolean inscricao;
    @Column(name = "desistente")
    public Boolean desistente;
    @Column(name = "id_desistente")
    public Long contratoDesistenteId;  // referencia a Desistente (id, cross-service)
    @Column(name = "fl_pdf")
    public Boolean pdf;
    @Column(name = "data")
    public Date data;
    @Column(name = "data_reparcelamento")
    public Date dataReparcelamento;
    @Column(name = "data_cancelamento")
    public Date dataCancelamento;
    @Column(name = "qtde_reparcelamento")
    public Integer qtdeReparcelamento;
    @Column(name = "id_caderno_ultimo")
    public Long cadernoComponenteCurricularId;  // referencia a CadernoComponenteCurricular (id, cross-service)
    @Column(name = "id_ultima_parcela")
    public Long ultimaParcelaId;  // referencia a Parcela (id, cross-service)
    @Column(name = "id_cancelamento")
    public Long cancelamentoId;  // referencia a Cancelamento (id, cross-service)
    @Column(name = "id_proxima_parcela")
    public Long proximaParcelaId;  // referencia a Parcela (id, cross-service)
    @Column(name = "id_oferecimento_inicio")
    public Long oferecimentoInicioId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "id_oferecimento_fim")
    public Long oferecimentoFimId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "qtde_parcelas_atrasadas")
    public Integer qtdParcelasAtrasadas;
    @Column(name = "qtde_parcelas_nao_pagas")
    public Integer qtdParcelasNaoPagas;
    @Column(name = "valor_parcelas")
    public BigDecimal valorParcelas;
    @Column(name = "troca_turma")
    public Boolean trocaTurma;
}
