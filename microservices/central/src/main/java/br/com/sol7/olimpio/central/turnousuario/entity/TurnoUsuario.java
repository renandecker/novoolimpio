package br.com.sol7.olimpio.central.turnousuario;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "cen_turno_usuario")
@IdClass(TurnoUsuario.TurnoUsuarioId.class)
public class TurnoUsuario extends PanacheEntityBase {

    @Id
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Id
    @Column(name = "id_turno")
    public Long turnoTrabalhoId;  // referencia a TurnoTrabalho (id, cross-service)

    public static class TurnoUsuarioId implements Serializable {
        public Long usuarioId;
        public Long turnoTrabalhoId;

        public TurnoUsuarioId() {
        }

        public TurnoUsuarioId(Long usuarioId, Long turnoTrabalhoId) {
            this.usuarioId = usuarioId;
            this.turnoTrabalhoId = turnoTrabalhoId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TurnoUsuarioId that = (TurnoUsuarioId) o;
            return Objects.equals(usuarioId, that.usuarioId) && Objects.equals(turnoTrabalhoId, that.turnoTrabalhoId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(usuarioId, turnoTrabalhoId);
        }
    }
}
