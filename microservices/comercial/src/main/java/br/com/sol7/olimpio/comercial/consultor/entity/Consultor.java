package br.com.sol7.olimpio.comercial.consultor;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import java.util.List;
import br.com.sol7.olimpio.comercial.turnotrabalho.TurnoTrabalho;

@Entity
@Table(name = "com_consultor")

public class Consultor extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)

    @ManyToMany
    @JoinTable(name = "com_turnos_consultor", joinColumns = @JoinColumn(name = "id_consultor"), inverseJoinColumns = @JoinColumn(name = "id_turno_trabalho"))
    private List<TurnoTrabalho> turnoTrabalhos;

    public List<TurnoTrabalho> getTurnoTrabalhos() {
        return turnoTrabalhos;
    }

    public void setTurnoTrabalhos(List<TurnoTrabalho> turnoTrabalhos) {
        this.turnoTrabalhos = turnoTrabalhos;
    }
}
