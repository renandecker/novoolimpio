package br.com.sol7.olimpio.curriculo.empresa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "cur_empresa")
public class Empresa extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;

    @Column(name = "dt_inicio")
    public Date dtInicio;

    @Column(name = "dt_fim")
    public Date dtFim;

    @Column(name = "fl_ativo")
    public Boolean flAtivo;
}
