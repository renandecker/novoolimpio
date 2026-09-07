package br.com.sol7.olimpio.financeiro.cobranca;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "fin_cobranca")
public class Cobranca extends PanacheEntity {

    @Column(name = "id_contrato")
    public Long contratoId;  // referencia a Contrato (id, cross-service)
    @Column(name = "id_etapa_cobranca")
    public Long etapasCobrancaId;  // referencia a EtapasCobranca (id, cross-service)
    @Temporal(TemporalType.DATE)
    @Column(name = "devendo_desde")
    public Date devendoDesde;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_ultimo_carta")
    public Date dataUltimaCarta;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_ultimo_retorno")
    public Date dataUltimoRetorno;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_ultimo_sms")
    public Date dataUltimaSms;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_ultimo_ligacao")
    public Date dataUltimaLigacao;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_ultimo_email")
    public Date dataUltimoEmail;
    @Column(name = "id_ligacao_cobranca")
    public Long ligacaoCobrancaId;  // referencia a LigacaoCobranca (id, cross-service)
    @Column(name = "qtde_ligacao")
    public Integer qtdLigacoes;
    @Column(name = "qtde_email")
    public Integer qtdEmails;
    @Column(name = "qtde_carta")
    public Integer qtdCartas;
    @Column(name = "qtde_sms")
    public Integer qtdSms;
}
