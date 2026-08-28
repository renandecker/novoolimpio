package br.com.sol7.olimpio.central.filaprioritaria;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "cen_fila_prioritaria")
public class FilaPrioritaria extends PanacheEntity {

    @Column(name = "id_ligacao")
    public Long ligacaoId;

    @Column(name = "id_ordem_ligacao")
    public Long ordemLigacaoId;

    @Column(name = "data")
    public Date data;

    @Column(name = "status")
    public String status;

    @Column(name = "id_usuario")
    public Long usuarioId;
}