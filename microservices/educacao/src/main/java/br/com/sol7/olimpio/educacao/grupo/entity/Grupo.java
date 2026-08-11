package br.com.sol7.olimpio.educacao.grupo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_grupo")
public class Grupo extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "nome")
    public String nome;
}
