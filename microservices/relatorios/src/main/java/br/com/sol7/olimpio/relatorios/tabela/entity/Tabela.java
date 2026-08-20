package br.com.sol7.olimpio.relatorios.tabela;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_tabela")
public class Tabela extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "data_criacao")
    public Date dataCadastro;
    @Column(name = "data_atualizacao")
    public Date dataAlteracao;
    @Column(name = "fl_todos_unidades")
    public boolean todosUnidades;
    @Column(name = "fl_todos_perfis")
    public boolean todosPerfis;
    @Column(name = "fl_todos_usuarios")
    public boolean todosUsuarios;
    @Column(name = "id_estrutura")
    public Long estruturaId;  // referencia a Estrutura (id, cross-service)
}
