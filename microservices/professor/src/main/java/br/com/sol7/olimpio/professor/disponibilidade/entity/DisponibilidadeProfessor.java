package br.com.sol7.olimpio.professor.disponibilidade.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalTime;

@Entity
@Table(name = "edc_professor_unidade")
public class DisponibilidadeProfessor extends PanacheEntity {

    @Column(name = "id_professor")
    public Long professorId;  // referencia a Professor (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_tipo_contrato")
    public Long tipoContratoId;  // referencia a TipoContrato (id, cross-service)
    @Column(name = "inicio")
    public LocalTime inicio;
    @Column(name = "fim")
    public LocalTime fim;
    @Column(name = "pre_autorizado")
    public Boolean preAutorizado;
}
