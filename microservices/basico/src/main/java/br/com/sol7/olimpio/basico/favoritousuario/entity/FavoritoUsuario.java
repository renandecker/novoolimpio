package br.com.sol7.olimpio.basico.favoritousuario.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_favorito_usuario")
public class FavoritoUsuario extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "icon")
    public String icon;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_modulo")
    public Long moduloId;  // referencia a Modulo (id, cross-service)
}
