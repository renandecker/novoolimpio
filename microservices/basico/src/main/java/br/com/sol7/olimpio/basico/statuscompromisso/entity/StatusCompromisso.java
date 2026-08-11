package br.com.sol7.olimpio.basico.statuscompromisso.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_status_compromisso")
public class StatusCompromisso extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "cor")
    public String cor;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "alguem")
    public boolean alguem;
    @Column(name = "trocaautomatomatica")
    public boolean trocaautomatomatica;
    @Column(name = "dias")
    public int dias;
    @Column(name = "id_perfil")
    public Long perfilId;  // referencia a Perfil (id, cross-service)
    @Column(name = "descricao_pessoa")
    public String descricaoPessoa;
    @Column(name = "qtde_usuario")
    public Integer qtdeUsuario;
    @Column(name = "id_prox_status_compromisso")
    public Long proxStatusCompromissoId;  // referencia a StatusCompromisso (id, cross-service)
    @Column(name = "id_status_troca_auto")
    public Long statusCompromissoTrocaAutoId;  // referencia a StatusCompromisso (id, cross-service)
}
