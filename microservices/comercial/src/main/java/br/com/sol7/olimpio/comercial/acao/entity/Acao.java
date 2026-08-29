package br.com.sol7.olimpio.comercial.acao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "com_acao")
public class Acao extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "data_coleta")
    @Temporal(TemporalType.DATE)
    public Date dataColeta;
    @Column(name = "id_tipo_acao")
    public Long tipoAcaoId;  // referencia a TipoAcao (id, cross-service)
    @Column(name = "data_inicial")
    @Temporal(TemporalType.DATE)
    public Date dataInicial;
    @Column(name = "data_final_captacao")
    @Temporal(TemporalType.DATE)
    public Date dataFinalCaptacao;
    @Column(name = "data_final")
    @Temporal(TemporalType.DATE)
    public Date dataFinal;
    @Column(name = "prev_meta")
    public Integer meta;
    @Column(name = "prev_custo")
    public BigDecimal custo;
    @Column(name = "id_responsavel")
    public Long responsavelId;  // referencia a Pessoa (id, cross-service)
}
