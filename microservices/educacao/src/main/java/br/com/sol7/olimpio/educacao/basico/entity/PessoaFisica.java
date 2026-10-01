package br.com.sol7.olimpio.educacao.basico;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "bas_pessoa_fisica")
public class PessoaFisica extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;
    @Column(name = "nome")
    public String nome;
    @Column(name = "cpf")
    public String cpf;
    @Column(name = "data_nascimento")
    public LocalDate dataNascimento;
}
