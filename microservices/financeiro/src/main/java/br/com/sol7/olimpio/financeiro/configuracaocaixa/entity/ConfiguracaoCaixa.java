package br.com.sol7.olimpio.financeiro.configuracaocaixa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "fin_configuracao_caixa")
public class ConfiguracaoCaixa extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "fundo_caixa")
    public BigDecimal fundoCaixa;
    @Column(name = "dias")
    public int dias;
    @Column(name = "email")
    public String email;
    @Column(name = "impressao")
    public int impressao;
    @Column(name = "pag_propria_unid")
    public Boolean pagPropriaUnid;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_responsavel")
    public Long responsavelId;  // referencia a Usuario (id, cross-service)
    @Column(name = "template_caixa")
    public String templateCaixa;
    @Column(name = "tipo_modelo_caixa")
    public int tipoModeloCaixa;
}
