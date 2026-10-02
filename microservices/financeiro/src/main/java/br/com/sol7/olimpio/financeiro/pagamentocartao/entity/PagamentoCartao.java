package br.com.sol7.olimpio.financeiro.pagamentocartao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_pagamento_cartao")
public class PagamentoCartao extends PanacheEntity {

    @Column(name = "id_movimentacao")
    public Long movimentacaoId;  // referencia a MovimentacaoFinanceira (id, mesmo servico)
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pagamento")
    public TipoPagamentoCartao tipoPagamentoCartao;
    @Column(name = "qtd_parcelas")
    public Integer quantidadeParcelas;
    @Column(name = "id_bandeira")
    public Long bandeiraId;  // referencia a Bandeira (id, mesmo servico)
}
