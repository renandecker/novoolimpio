package br.com.sol7.olimpio.educacao.matricula;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "edc_matricula")
public class Matricula extends PanacheEntity {

    @Column(name = "id_oferecimento_componente_curricular")
    public Long oferecimentoComponenteCurricularId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "id_contrato")
    public Long contratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_caderno_ultimo")
    public Long cadernoComponenteCurricularId;  // referencia a CadernoComponenteCurricular (id, cross-service)
    @Column(name = "id_forma_pagamento")
    public Long formaPagamentoId;  // referencia a FormaPagamento (id, cross-service)
    @Column(name = "data_cancelamento")
    public Date dataCancelamento;
    @Column(name = "motivo_cancelamento", columnDefinition = "text")
    public String motivoCancelamento;
    @Column(name = "status")
    public String status;  // era StatusMatricula (enum/embeddable) no legado
    @Column(name = "media_final")
    public BigDecimal mediaFinal;
    @Column(name = "percentual_presenca")
    public BigDecimal percentualPresenca;
    @Column(name = "qtde_chamadas_frenquencia")
    public int qtdeChamadaFrequencia;
    @Column(name = "data")
    public Date data;
    @Column(name = "qtde_aula")
    public int totalAulas;
    @Column(name = "qtde_aula_feita")
    public int totalAulasFeitas;
    @Column(name = "qtde_aula_presente")
    public int totalAulasPresente;
    @Column(name = "qtde_aula_meia_presente")
    public int totalAulasMeiaPresenca;
    @Column(name = "qtde_falta")
    public int totalFaltas;
    @Column(name = "fl_cancelamento_proprio")
    public boolean cancelamentoProprio;
    @Column(name = "troca_turma")
    public boolean trocaTurma;
    @Column(name = "id_cancelamento")
    public Long cancelamentoId;  // referencia a Cancelamento (id, cross-service)
}
