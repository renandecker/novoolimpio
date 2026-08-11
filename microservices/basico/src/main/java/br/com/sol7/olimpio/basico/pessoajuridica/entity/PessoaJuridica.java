package br.com.sol7.olimpio.basico.pessoajuridica.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_pessoa_juridica")
public class PessoaJuridica extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "nome_fantasia")
    public String nomeFantasia;
    @Column(name = "razao_social")
    public String razaoSocial;
    @Column(name = "cnpj")
    public String cnpj;
    @Column(name = "fax")
    public String fax;
    @Column(name = "inscricao_municipal")
    public String inscricaoMunicipal;
    @Column(name = "inscricao_estadual")
    public String inscricaoEstadual;
}
