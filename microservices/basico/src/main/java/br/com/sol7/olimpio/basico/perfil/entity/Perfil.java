package br.com.sol7.olimpio.basico.perfil.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_perfil")
public class Perfil extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "exibir_favoritos")
    public Boolean exibirFavorito;
    @Column(name = "ajustar_favoritos")
    public Boolean ajustarFavoritos;
    @Column(name = "exibir_foto")
    public Boolean exibirFoto;
    @Column(name = "exibir_senha")
    public Boolean exibirSenha;
    @Column(name = "exibir_menu")
    public Boolean exibirMenu;
    @Column(name = "comunicar")
    public Boolean comunicar;
    @Column(name = "id_modulo")
    public Long moduloId;  // referencia a Modulo (id, cross-service)
    @Column(name = "hierarquia")
    public String hierarquia;  // era HierarquiaPerfil (enum/embeddable) no legado
}
