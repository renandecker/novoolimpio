package br.com.sol7.olimpio.financeiro.controleimpressao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

// Migrado de br.com.sol7.olimpio.model.entity.financeiro.ControleImpressao (legado)
@Entity
@Table(name = "fin_controle_impressao")
public class ControleImpressao extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_movimentacao")
    public Long movimentacaoId;  // referencia a MovimentacaoFinanceira (id, mesmo servico)
}
