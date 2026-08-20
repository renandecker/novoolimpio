package br.com.sol7.olimpio.relatorios.organograma;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "rel_organograma")
public class Organograma extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "data_criacao")
    public Date dataCadastro;
    @Column(name = "data_atualizacao")
    public Date dataAlteracao;
}
