package br.com.sol7.olimpio.estoque.configuracaoestoque;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "est_configuracao_estoque")
public class ConfiguracaoEstoque extends PanacheEntity {

    @Column(name = "fl_estoque_central")
    public boolean central;
    @Column(name = "dias_previsao")
    public int diasPrevisao;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "email")
    public String email;
    @Column(name = "zoom")
    public String zoom;
    @Column(name = "area")
    public String area;
}
