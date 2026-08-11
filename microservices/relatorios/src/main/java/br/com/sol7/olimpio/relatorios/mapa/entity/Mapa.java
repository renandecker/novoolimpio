package br.com.sol7.olimpio.relatorios.mapa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "rel_mapa")
public class Mapa extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "fl_todos_unidades")
    public boolean todosUnidades;
    @Column(name = "fl_todos_perfis")
    public boolean todosPerfis;
    @Column(name = "fl_todos_usuarios")
    public boolean todosUsuarios;
    @Column(name = "zoom")
    public String zoom;
    @Column(name = "coordenada")
    public String coordenada;
    @Column(name = "utilizando")
    public boolean utilizando;
    @Column(name = "altura")
    public Integer altura;
    @Column(name = "marker_tamanho")
    public Integer markerTamanho;
    @Column(name = "data_atualizacao")
    public Date dataAlteracao;
    @Column(name = "id_georeferencia")
    public Long georeferenciaId;  // referencia a Georeferencia (id, cross-service)
    @Column(name = "id_dimensao")
    public Long dimensaoId;  // referencia a Dimensao (id, cross-service)
    @Column(name = "id_medida")
    public Long medidaId;  // referencia a Medida (id, cross-service)
    @Column(name = "id_estrutura")
    public Long estruturaId;  // referencia a Estrutura (id, cross-service)
}
