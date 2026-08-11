package br.com.sol7.olimpio.financeiro.resultadoligacaocobranca;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_resultado_ligacao_cobranca")
public class ResultadoLigacaoCobranca extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "tela")
    public int tela;
    @Column(name = "ordem")
    public int ordem;
    @Column(name = "dias_retorno")
    public int diasRetorno;
}
