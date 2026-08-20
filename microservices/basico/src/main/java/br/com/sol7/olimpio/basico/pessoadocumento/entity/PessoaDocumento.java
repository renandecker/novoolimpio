package br.com.sol7.olimpio.basico.pessoadocumento.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "bas_pessoa_documento")
public class PessoaDocumento extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "documento")
    public String documento;
    @Column(name = "data_atualizacao")
    public Date dataAtualizacao;
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
}
