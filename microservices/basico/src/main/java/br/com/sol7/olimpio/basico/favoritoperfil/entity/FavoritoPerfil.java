package br.com.sol7.olimpio.basico.favoritoperfil.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_favorito_perfil")
public class FavoritoPerfil extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "icon")
    public String icon;
    @Column(name = "id_perfil")
    public Long perfilId;  // referencia a Perfil (id, cross-service)
    @Column(name = "id_modulo")
    public Long moduloId;  // referencia a Modulo (id, cross-service)
}
