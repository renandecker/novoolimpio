package br.com.sol7.olimpio.educacao.disponibilidadeprofessor;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "edc_professor_unidade")
public class DisponibilidadeProfessor extends PanacheEntityBase {

    @Id
    public Long id;

    @Column(name = "id_professor")
    public Long professorId;

    @Column(name = "id_unidade")
    public Long unidadeId;

    @Column(name = "id_tipo_contrato")
    public Long tipoContratoId;

    @Column(name = "data_inicio")
    public LocalDate inicio;

    @Column(name = "data_fim")
    public LocalDate fim;

    @Column(name = "pre_autorizado")
    public Boolean preAutorizado;

    @ElementCollection
    @CollectionTable(name = "edc_disponibilidade_professor_dia_semana", joinColumns = @JoinColumn(name = "id_disponibilidade_professor"))
    @Column(name = "id_dia_semana")
    public List<Long> diasSemanaIds;
}