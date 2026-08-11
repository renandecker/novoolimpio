package br.com.sol7.olimpio.central.operacional;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cen_operacional")
public class Operacional extends PanacheEntity {

    @Column(name = "id_pacote")
    public Long pacoteId;  // referencia a Pacote (id, cross-service)
    @Column(name = "status")
    public String status;  // era StatusPacote (enum/embeddable) no legado
    @Column(name = "direcionamento")
    public String direcionamento;  // era Direcionamento (enum/embeddable) no legado
    @Column(name = "id_coordenador")
    public Long coordenadorId;  // referencia a Usuario (id, cross-service)
}
