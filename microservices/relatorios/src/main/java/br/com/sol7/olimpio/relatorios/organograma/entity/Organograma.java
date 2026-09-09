package br.com.sol7.olimpio.relatorios.organograma.entity;
import br.com.sol7.olimpio.relatorios.tabela.entity.Tabela;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_organograma")
public class Organograma extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "data_criacao")
    public Date dataCadastro;
    @Column(name = "data_atualizacao")
    public Date dataAlteracao;

    /**
     * Direção de desenho do organograma no AG Charts Org Chart.
     * Valores aceitos: HORIZONTAL, VERTICAL, TOGGLE_REVERSE.
     */
    @Column(name = "direcao", length = 30)
    public String direcao;

    /**
     * SQL livre cadastrado pelo usuário, usado em tempo real (sem persistir o resultado)
     * para montar os nós do organograma. Deve retornar, no mínimo, as colunas
     * id, parentId, name, job, department, location, status, avatar.
     * Ex.: select id, parentId, name, job, department, location, status, avatar from <Tabela> where <condição>
     */
    @Column(name = "sql_consulta", columnDefinition = "text")
    public String sql;
}
