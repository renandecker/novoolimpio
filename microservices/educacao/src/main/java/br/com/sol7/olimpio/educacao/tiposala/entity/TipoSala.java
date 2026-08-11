package br.com.sol7.olimpio.educacao.tiposala;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_tipo_sala")
public class TipoSala extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
