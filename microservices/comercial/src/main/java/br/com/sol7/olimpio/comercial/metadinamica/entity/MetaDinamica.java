package br.com.sol7.olimpio.comercial.metadinamica;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "com_meta_dinamica")
public class MetaDinamica extends PanacheEntity {

    @Column(name = "mes")
    public Integer mes;
    @Column(name = "ano")
    public Integer ano;
    @Column(name = "perc_segunda")
    public BigDecimal percSegunda;
    @Column(name = "perc_terca")
    public BigDecimal percTerca;
    @Column(name = "perc_quarta")
    public BigDecimal percQuarta;
    @Column(name = "perc_quinta")
    public BigDecimal percQuinta;
    @Column(name = "perc_sexta")
    public BigDecimal percSexta;
    @Column(name = "perc_sabado")
    public BigDecimal percSabado;
    @Column(name = "perc_domingo")
    public BigDecimal percDomingo;
    @Column(name = "id_indicador")
    public Long indicadorId;  // referencia a Indicador (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "data_atualizacao")
    public Date dataAtualizacao;
}
