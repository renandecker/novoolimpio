package br.com.sol7.olimpio.financeiro.caixa.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_caixa")
public class Caixa extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "data")
    public Date data;
    @Column(name = "data_fechamento")
    public Date dataFechamento;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "fundo_caixa")
    public BigDecimal fundoCaixa;
    @Column(name = "id_impressora")
    public Long impressoraId;  // referencia a Impressora (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_caixa_unidade")
    public int idCaixaUnidade;
    @Column(name = "documento")
    public String documento;
}
