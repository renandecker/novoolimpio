package br.com.sol7.olimpio.basico.cpfalunos.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_cpf_alunos_antigos")
public class CpfAlunos extends PanacheEntity {

    @Column(name = "cpf")
    public String cpf;
    @Column(name = "nome")
    public String nome;
}
