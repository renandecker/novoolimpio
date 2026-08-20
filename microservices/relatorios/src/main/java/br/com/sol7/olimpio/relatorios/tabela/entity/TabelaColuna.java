package br.com.sol7.olimpio.relatorios.tabela.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_tabela_colunas")
public class TabelaColuna extends PanacheEntity {
    @Column(name = "id_tabela")
    public Long tabelaId;
    @Column(name = "id_dimensao")
    public Long dimensaoId;
    @Column(name = "id_medida")
    public Long medidaId;
    @Column(name = "ordem")
    public Integer ordem;
}
