package br.com.sol7.olimpio.estoque.entrega;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "est_entrega")
public class Entrega extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "area")
    public String area;
    @Column(name = "zoom")
    public String zoom;
    @Column(name = "longitude")
    public double longitude;
    @Column(name = "latitude")
    public double latitude;
    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
}
