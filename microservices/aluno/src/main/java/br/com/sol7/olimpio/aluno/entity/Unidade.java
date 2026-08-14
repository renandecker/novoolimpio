package br.com.sol7.olimpio.aluno.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_unidade")
public class Unidade extends PanacheEntityBase {

    @Id
    public Integer id;

    @Column(name = "sucinto")
    public String sucinto;
}
