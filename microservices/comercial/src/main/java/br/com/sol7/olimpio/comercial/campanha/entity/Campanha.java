package br.com.sol7.olimpio.comercial.campanha;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "com_campanha")
public class Campanha extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "meta")
    public Integer meta;
    @Column(name = "fl_ativo")
    public boolean ativo;
    @Column(name = "data_inicial")
    public Date dataInicial;
}
