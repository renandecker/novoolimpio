package br.com.sol7.olimpio.educacao.ligacaonap;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "edc_ligacao_nap")
public class LigacaoNap extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "data_inicial")
    public Date dataInicial;
    @Column(name = "data_final")
    public Date dataFinal;
    @Column(name = "id_resultado_ligacao_nap")
    public Long resultadoLigacaoNapId;  // referencia a ResultadoLigacaoNAP (id, cross-service)
    @Column(name = "telefone")
    public String telefone;
    @Column(name = "observacao", columnDefinition = "text")
    public String observacao;
    @Column(name = "id_compromisso")
    public Long compromissoId;  // referencia a Compromisso (id, cross-service)
    @Column(name = "id_etapas_nap")
    public Long etapasNapId;  // referencia a EtapasNAP (id, cross-service)
    @Column(name = "retorno_aula")
    @Temporal(TemporalType.DATE)
    public Date retornoAula;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "qtde_aula_feita")
    public Integer qtdeAulaFeita;
    @Column(name = "qtde_aula_presente")
    public Integer qtdeAulaPresente;
    @Column(name = "qtde_aula_meia_presente")
    public Integer qtdeAulaMeiaPresente;
    @Column(name = "qtde_falta")
    public Integer qtdeFalta;
    @Column(name = "media_nota", columnDefinition = "numeric(10,2)")
    public BigDecimal mediaNota;
    @Column(name = "nota_total", columnDefinition = "numeric(10,2)")
    public BigDecimal notaTotal;
    @Column(name = "nota_executadas", columnDefinition = "numeric(10,2)")
    public BigDecimal notaExecutadas;
    @Column(name = "nota_obtida", columnDefinition = "numeric(10,2)")
    public BigDecimal notaObtida;
    @Column(name = "qtde_aula")
    public Integer qtdeAula;
    @Column(name = "id_contrato")
    public Long contratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_caderno_retorno")
    public Long cadernoRetornoId;  // referencia a Caderno (id, cross-service)
    @Column(name = "qtde_aula_atrasado")
    public Integer qtdeAulaAtrasado;
}
