package br.com.sol7.olimpio.comercial.consultor;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "com_consultor")
public class Consultor extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
}
