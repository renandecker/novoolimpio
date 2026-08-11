package br.com.sol7.olimpio.central.resultadocontato;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cen_resultado_contato")
public class ResultadoContato extends PanacheEntity {

    @Column(name = "nota")
    public int nota;
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "fl_voltar")
    public boolean voltar;
    @Column(name = "fl_relato")
    public boolean relato;
    @Column(name = "fl_visivel")
    public boolean visivel;
    @Column(name = "qtde_retorno")
    public int qtdeRetorno;
    @Column(name = "fl_outro")
    public boolean outro;
    @Column(name = "tela")
    public int tela;
}
