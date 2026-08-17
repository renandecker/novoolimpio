package br.com.sol7.olimpio.educacao.criterio;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "edc_criterio")
public class Criterio extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "fl_mes")
    public boolean mes;
    @Column(name = "periodo")
    public int periodo;
    @Column(name = "qtd_turma_abertas")
    public int qtdTurmaAbertas;
    @Column(name = "qtd_aulas_tolerancia_matricula")
    public int qtdAulasToleraciaMatricula;
    @Column(name = "data_inicio")
    @Temporal(TemporalType.DATE)
    public Date dataInicio;
    @Column(name = "data_fim")
    @Temporal(TemporalType.DATE)
    public Date dataFim;
    @Column(name = "tipo_matricula")
    public String tipoMatricula;  // era TipoMatricula (enum/embeddable) no legado
}
