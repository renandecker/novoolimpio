package br.com.sol7.olimpio.educacao.tipocurso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_tipo_curso")
public class TipoCurso extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
