package br.com.sol7.olimpio.basico.usuariologado.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuario_logado")
public class UsuarioLogado extends PanacheEntity {

    @Column(name = "usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
}
