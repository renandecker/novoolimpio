package br.com.sol7.olimpio.curriculo.configuracao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cur_configuracao_empresa")
public class Configuracao extends PanacheEntity {

    @Column(name = "arquivo_curriculo")
    public String arquivoCurriculo;

    @Column(name = "sql_variavel")
    public String sqlVariavel;
}
