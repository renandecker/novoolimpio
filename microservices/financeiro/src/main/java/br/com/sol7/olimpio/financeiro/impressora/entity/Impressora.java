package br.com.sol7.olimpio.financeiro.impressora;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "fin_impressora")
public class Impressora extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "porta")
    public String porta;
    @Column(name = "modelo")
    public int modelo;
    @Column(name = "fl_manual")
    public boolean manual;
    @Column(name = "tamanho")
    public String tamanho;
    @Column(name = "data_alteracao")
    public Date dataAlteracao;
}
