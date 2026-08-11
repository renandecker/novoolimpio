package br.com.sol7.olimpio.basico.feriado.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "bas_feriado")
public class Feriado extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "tipo_feriao")
    public String tipoFeriao;
    @Column(name = "dt_feriado")
    public Date dataFeriado;
    @Column(name = "dt_criacao")
    public Date dataCriacao;
    @Column(name = "fl_nacional")
    public Boolean nacional;
    @Column(name = "fl_tipo_curso")
    public Boolean todosCursos;
    @Column(name = "fl_feriado_fixo")
    public Boolean feriadoFixo;
}
