package br.com.sol7.olimpio.basico.horario.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_horario")
public class Horario extends PanacheEntity {

    @Column(name = "hora")
    public String hora;
}
