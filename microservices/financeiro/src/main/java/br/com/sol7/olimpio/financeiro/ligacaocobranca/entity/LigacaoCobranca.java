package br.com.sol7.olimpio.financeiro.ligacaocobranca;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_ligacao_cobranca")
public class LigacaoCobranca extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_contrato")
    public Long contratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "data_inicial")
    public Date dataInicial;
    @Column(name = "data_final")
    public Date dataFinal;
    @Column(name = "id_resultado_cobranca")
    public Long resultadoCobrancaId;  // referencia a ResultadoLigacaoCobranca (id, cross-service)
    @Column(name = "telefone")
    public String telefone;
    @Column(name = "observacao", columnDefinition = "text")
    public String observacao;
    @Column(name = "id_compromisso")
    public Long compromissoId;  // referencia a Compromisso (id, cross-service)
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "id_etapa_cobranca")
    public Long etapasCobrancaId;  // referencia a EtapasCobranca (id, cross-service)
    @Column(name = "qtde_parcela")
    public Integer qtdeParcela;
    @Column(name = "valor", columnDefinition = "numeric(10,2)")
    public BigDecimal valor;
}
