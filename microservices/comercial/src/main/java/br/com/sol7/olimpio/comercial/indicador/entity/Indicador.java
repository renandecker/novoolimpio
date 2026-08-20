package br.com.sol7.olimpio.comercial.indicador;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "com_indicador")
public class Indicador extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "data_criacao")
    public Date data_criacao;
    @Column(name = "formato_indicador")
    public String formato_indicador;
    @Column(name = "fl_dia")
    public boolean dia;
    @Column(name = "fl_mes")
    public boolean mes;
    @Column(name = "fl_ano")
    public boolean ano;
    @Column(name = "fl_semana")
    public boolean semana;
    @Column(name = "fl_vendedor")
    public boolean vinculadoVendedor;
}
