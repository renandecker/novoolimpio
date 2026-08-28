package br.com.sol7.olimpio.central.ordemligacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "cen_ordem_ligacao")
public class OrdemLigacao extends PanacheEntity {

    @Column(name = "id_prospecto")
    public Long prospectoId;

    @Column(name = "id_operacional")
    public Long operacionalId;

    @Column(name = "data_criacao")
    public Date dataCriacao;

    @Column(name = "status")
    public String status;

    @Column(name = "prioritaria")
    public boolean prioritaria;

    @Column(name = "tentativas")
    public int tentativas;

    @Column(name = "ultima_tentativa")
    public Date ultimaTentativa;
}