package br.com.sol7.olimpio.basico.estadocivil.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_estado_civil")
public class EstadoCivil extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
