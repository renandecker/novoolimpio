package br.com.sol7.olimpio.comercial.turnotrabalho;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cen_turno_trabalho")
public class TurnoTrabalho extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "inicio")
    public String inicio;
    @Column(name = "fim")
    public String fim;
    @Column(name = "id_dia_semana")
    public Long diaSemanaId;  // referencia a DiaSemana (id, cross-service)
}
