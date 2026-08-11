package br.com.sol7.olimpio.basico.categoria.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_categoria")
public class Categoria extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "descricaocompleta")
    public String descricaocompleta;
    @Column(name = "id_categoria_livros")
    public Long categoriaId;  // referencia a Categoria (id, cross-service)
}
