package br.com.sol7.olimpio.basico.turnofuncionario.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_turno_funcionario")
public class TurnoFuncionario extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
