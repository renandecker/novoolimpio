package br.com.sol7.olimpio.basico.auditoria.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "auditoria")
public class Auditoria extends PanacheEntity {

    @Column(name = "username")
    public String username;
    @Column(name = "action")
    public int action;
}
