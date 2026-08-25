package br.com.sol7.olimpio.basico.financobanco.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "fin_bancos")
public class FinBanco extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;

    @Column(name = "provedor")
    public String provedor;

    @Column(name = "chave")
    public String chave;

    @Column(name = "valor")
    public String valor;

    @Column(name = "fl_ativo")
    public Boolean ativo;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao;

    @Column(name = "data_alteracao")
    public LocalDateTime dataAlteracao;
}
