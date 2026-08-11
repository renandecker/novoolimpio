package br.com.sol7.olimpio.educacao.referenciabibliografica;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_referencia_bibliografica")
public class ReferenciaBibliografica extends PanacheEntity {

    @Column(name = "autor")
    public String autor;
    @Column(name = "titulo")
    public String titulo;
    @Column(name = "volume")
    public String volume;
}
