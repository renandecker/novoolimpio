package br.com.sol7.olimpio.basico.usuario.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_usuario")
public class Usuario extends PanacheEntity {

    @Column(name = "login")
    public String login;
    @Column(name = "senha")
    public String senha;
    @Column(name = "foto")
    public String foto;
    @Column(name = "foto_base64")
    public String fotoBase64;
    @Column(name = "hierarquia")
    public String hierarquia;  // era HierarquiaPerfil (enum/embeddable) no legado
    @Column(name = "qtde_notify")
    public int qtdeNotify;
    @Column(name = "fl_ativo")
    public boolean ativo;
    @Column(name = "fl_senha_provisoria")
    public boolean senhaProvisoria;
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "id_funcionario")
    public Long funcionarioId;  // referencia a Funcionario (id, cross-service)
    @Column(name = "id_unidade_default")
    public Long unidadeDefaultId;  // referencia a Unidade (id, cross-service)
}
