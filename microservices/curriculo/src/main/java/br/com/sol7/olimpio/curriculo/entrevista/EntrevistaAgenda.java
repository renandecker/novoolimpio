package br.com.sol7.olimpio.curriculo.entrevista;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cur_entrevista_vaga_empresa_agenda")
public class EntrevistaAgenda extends PanacheEntity {

    @Column(name = "id_entrevista_vaga_empresa")
    public Long entrevistaId;

    @Column(name = "id_agenda")
    public Long agendaId;
}
