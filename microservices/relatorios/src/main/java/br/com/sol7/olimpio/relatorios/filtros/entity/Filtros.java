package br.com.sol7.olimpio.relatorios.filtros.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_filtro")
public class Filtros extends PanacheEntity {
    public String nome;

    @Column(name = "informacao")
    public String informacao;

    @Column(name = "fl_fixo")
    public Boolean flFixo;

    @Column(name = "fl_exibir")
    public Boolean flExibir;

    @Column(name = "fl_todos_grafico")
    public Boolean flTodosGrafico;

    @Column(name = "fl_todos_tabela")
    public Boolean flTodosTabela;

    @Column(name = "fl_todos_mapa")
    public Boolean flTodosMapa;

    @Column(name = "fl_todos_organograma")
    public Boolean flTodosOrganograma;

    @Column(name = "id_estrutura")
    public Long idEstrutura;

    @Column(name = "id_dimensao")
    public Long idDimensao;

    @Column(name = "tipo_filtro")
    public String tipoFiltro;

    @Column(name = "fl_hierarquia")
    public Boolean flHierarquia;

    @Column(name = "fl_rede")
    public Boolean flRede;

    @Column(name = "hierarquia")
    public String hierarquia;

    @Column(name = "data_inicio")
    public Date dataInicio;

    @Column(name = "data_fim")
    public Date dataFim;

    @Column(name = "operacao")
    public String operacao;

    @Column(name = "periodo_dinamico")
    public String periodoDinamico;

    @Column(name = "fl_todos_unidades")
    public Boolean flTodosUnidades;

    @Column(name = "fl_todos_perfis")
    public Boolean flTodosPerfis;

    @Column(name = "fl_todos_usuarios")
    public Boolean flTodosUsuarios;

    @Column(name = "valor_fixo")
    public String valorFixo;

    @Column(name = "dados_json")
    public String dadosJson;
}
