package br.com.sol7.olimpio.educacao.professor;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_professor")
public class Professor extends PanacheEntityBase {

    @Id
    public Long id;

    @Column(name = "id_pessoa")
    public Long pessoaId;
}
