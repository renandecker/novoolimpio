package br.com.sol7.olimpio.educacao.tipoatividade;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_tipo_atividade")
public class TipoAtividade extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "carga_horaria_maxima")
    public Integer cargaHorariaMaxima;
    @Column(name = "carga_horaria_minima")
    public Integer cargaHorariaMinima;
}
