package br.com.sol7.olimpio.educacao.componentecurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_componente_curricular")
public class ComponenteCurricular extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "ementa", columnDefinition = "text")
    public String ementa;
    @Column(name = "carga_horaria")
    public Integer cargaHoraria;
    @Column(name = "qtde_corringa")
    public int qtdeCoringa;
    @Column(name = "creditos")
    public Integer creditos;
    @Column(name = "id_tipo_sala")
    public Long tipoSalaId;  // referencia a TipoSala (id, cross-service)
    @Column(name = "habilidade_competencia", columnDefinition = "text")
    public String habilidadeCompetencia;
    @Column(name = "base_tecnologica", columnDefinition = "text")
    public String baseTecnologica;
}
