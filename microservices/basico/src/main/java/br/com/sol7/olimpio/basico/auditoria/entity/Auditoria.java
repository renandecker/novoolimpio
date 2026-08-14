package br.com.sol7.olimpio.basico.auditoria.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_auditoria")
public class Auditoria extends PanacheEntity {

    @Column(name = "username")
    public String username;
    @Column(name = "action")
    public int action;
    @Column(name = "`timestamp`")
    public long timestamp;
}
