package br.com.sol7.olimpio.basico.pessoa.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "bas_pessoa")
public class Pessoa extends PanacheEntity {

    @Column(name = "numero")
    public String numero;
    @Column(name = "complemento")
    public String complemento;
    @Column(name = "email")
    public String email;
    @Column(name = "telefone")
    public String telefone;
    @Column(name = "celular")
    public String celular;
    @Column(name = "foto")
    public String foto;
    @Column(name = "observacao", columnDefinition = "text")
    public String observacao;
    @Column(name = "comunicado")
    public boolean comunicado;
    @Column(name = "id_logradouro")
    public Long logradouroId;  // referencia a Logradouro (id, cross-service)
    @Column(name = "data_cadastro")
    public LocalDate dataCadastro;
    @Column(name = "data_alteracao")
    public LocalDate dataAlteracao;
}
