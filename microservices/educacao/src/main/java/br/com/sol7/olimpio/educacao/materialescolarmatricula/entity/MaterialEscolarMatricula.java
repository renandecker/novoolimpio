package br.com.sol7.olimpio.educacao.materialescolarmatricula;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_material_escolar_matricula")
public class MaterialEscolarMatricula extends PanacheEntity {

    @Column(name = "id_produto")
    public Long controleEstoqueId;  // referencia a ControleEstoque (id, cross-service)
    @Column(name = "id_matricula")
    public Long matriculaId;  // referencia a Matricula (id, cross-service)
    @Column(name = "quantidade_curso")
    public int quantidadeCurso;
    @Column(name = "quantidade_compra")
    public int quantidadeCompra;
}
