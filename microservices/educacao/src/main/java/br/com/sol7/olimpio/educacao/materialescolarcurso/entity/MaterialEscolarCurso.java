package br.com.sol7.olimpio.educacao.materialescolarcurso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_material_escolar_curso")
public class MaterialEscolarCurso extends PanacheEntity {

    @Column(name = "id_produto")
    public Long produtoId;  // referencia a Produto (id, cross-service)
    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "quantidade")
    public int quantidade;
}
