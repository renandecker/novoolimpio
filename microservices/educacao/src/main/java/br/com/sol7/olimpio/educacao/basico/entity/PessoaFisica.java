package br.com.sol7.olimpio.educacao.basico;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_pessoa_fisica")
public class PessoaFisica extends PanacheEntityBase {

    @Id
    public Long id;

    @Column(name = "nome")
    public String nome;
}
