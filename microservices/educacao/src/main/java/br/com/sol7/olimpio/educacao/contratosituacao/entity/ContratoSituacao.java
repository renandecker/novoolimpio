package br.com.sol7.olimpio.educacao.contratosituacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_contrato_situacao")
public class ContratoSituacao extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "fl_aprovado")
    public boolean fl_aprovado;
}
