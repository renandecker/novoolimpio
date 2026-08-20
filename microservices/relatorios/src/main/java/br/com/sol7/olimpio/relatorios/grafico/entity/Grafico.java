package br.com.sol7.olimpio.relatorios.grafico;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_grafico")
public class Grafico extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "fl_todos_unidades")
    public boolean todosUnidades;
    @Column(name = "fl_todos_perfis")
    public boolean todosPerfis;
    @Column(name = "fl_todos_usuarios")
    public boolean todosUsuarios;
    @Column(name = "formato_data")
    public String formatoData;
    @Column(name = "data_atualizacao")
    public Date dataAlteracao;
    @Column(name = "tipo")
    public String tipo;  // era TipoGrafico (enum/embeddable) no legado
    @Column(name = "ordenacao")
    public String ordemGrafico;  // era TipoOrdemGrafico (enum/embeddable) no legado
    @Column(name = "fl_exibir_percentual")
    public boolean exibirPercentual;
    @Column(name = "fl_legenda")
    public boolean exibirLegenda;
    @Column(name = "legenda_coluna")
    public int colunaLegenda;
    @Column(name = "limite")
    public String limite;
    @Column(name = "coluna")
    public int coluna;
    @Column(name = "altura")
    public int altura;
    @Column(name = "margem")
    public int margem;
    @Column(name = "diametro")
    public int diametro;
    @Column(name = "fl_exibir_valor")
    public boolean exibirValor;
    @Column(name = "fl_valor_acumulado")
    public boolean valorAcumulado;
    @Column(name = "tipo_eixo")
    public int tipoEixo;
    @Column(name = "legenda_posicao")
    public String posicao;
    @Column(name = "id_estrutura")
    public Long estruturaId;  // referencia a Estrutura (id, cross-service)
    @Column(name = "id_dimensao_referencia")
    public Long dimensaoReferenciaId;  // referencia a Dimensao (id, cross-service)
    @Column(name = "id_dimensao_informacao")
    public Long dimensaoInformacaoId;  // referencia a Dimensao (id, cross-service)
    @Column(name = "id_medida_informacao")
    public Long medidaInformacaoId;  // referencia a Medida (id, cross-service)
    @Column(name = "id_dimensao_combinado")
    public Long dimensaoCombinadoId;  // referencia a Dimensao (id, cross-service)
    @Column(name = "id_medida_combinado")
    public Long medidaCombinadoId;  // referencia a Medida (id, cross-service)
}
