package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "cur_curriculo_trabalho")
public class CurriculoTrabalho extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;

    @Column(name = "dt_inicio")
    @Temporal(TemporalType.DATE)
    public Date dtInicio;

    @Column(name = "dt_fim")
    @Temporal(TemporalType.DATE)
    public Date dtFim;

    @Column(name = "fl_ativo")
    public Boolean flAtivo;
}
