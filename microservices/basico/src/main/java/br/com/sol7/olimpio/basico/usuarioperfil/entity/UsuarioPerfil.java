package br.com.sol7.olimpio.basico.usuarioperfil.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "bas_usuario_perfil")
@IdClass(UsuarioPerfil.UsuarioPerfilId.class)
public class UsuarioPerfil extends PanacheEntityBase {
    @Id
    @Column(name = "id_usuario")
    public Long usuarioId;
    @Id
    @Column(name = "id_perfil")
    public Long perfilId;

    public static class UsuarioPerfilId implements Serializable {
        public Long usuarioId;
        public Long perfilId;

        @Override
        public boolean equals(Object other) {
            if (this == other) return true;
            if (!(other instanceof UsuarioPerfilId that))return false;
            return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(perfilId, that.perfilId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(usuarioId, perfilId);
        }
    }
}
