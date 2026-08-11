package br.com.sol7.olimpio.relatorios.estrutura;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "rel_estrutura")
public class Estrutura extends PanacheEntity {

    @Column(name = "tabela", columnDefinition = "text")
    public String tabela;
    @Column(name = "condicao")
    public String condicao;
    @Column(name = "nome")
    public String nome;
    @Column(name = "zoom")
    public String zoom;
    @Column(name = "id_email")
    public Long configuracaoEmailId;  // referencia a ConfiguracaoEmail (id, cross-service)
    @Column(name = "data_atualizacao")
    public Date dataAtualizacao;
    @Column(name = "coordenada")
    public String coordenada;
    @Column(name = "nome_banco")
    public String nomeBanco;
}
