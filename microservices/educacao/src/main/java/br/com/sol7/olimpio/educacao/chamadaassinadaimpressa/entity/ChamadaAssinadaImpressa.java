package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "edc_chamada_assinada_impressa")
public class ChamadaAssinadaImpressa extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "id_oferecimento_componente_curricular")
    public Long oferecimentoComponenteCurricularId;  // referencia a OferecimentoComponenteCurricular (id, cross-service)
    @Column(name = "sequencia")
    public Integer sequencia;
    @Column(name = "quantidade")
    public Integer quantidade;
    @Column(name = "aula_coringa")
    public boolean aulaCoringa;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "inicio")
    public Date inicio;
    @Column(name = "fim")
    public Date fim;
    @Column(name = "pendente")
    public boolean pendente;
}
