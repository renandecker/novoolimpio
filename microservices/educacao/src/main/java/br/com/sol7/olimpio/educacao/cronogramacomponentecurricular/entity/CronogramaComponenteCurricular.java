package br.com.sol7.olimpio.educacao.cronogramacomponentecurricular;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_cronograma_componente_curricular")
public class CronogramaComponenteCurricular extends PanacheEntity {

    @Column(name = "id_componente_curricular")
    public Long componenteCurricularId;  // referencia a ComponenteCurricular (id, cross-service)
    @Column(name = "assunto")
    public String assunto;
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "ordem")
    public Integer ordem;
    @Column(name = "numero_aula")
    public int numeroAula;
}
