package br.com.sol7.olimpio.financeiro.custoservico;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_custo_servico")
public class CustoServico extends PanacheEntity {

    @Column(name = "valor_email")
    public BigDecimal valorEmail;
    @Column(name = "valor_sms")
    public BigDecimal valorSms;
    @Column(name = "valor_ligacao")
    public BigDecimal valorLigacao;
    @Column(name = "valor_carta")
    public BigDecimal valorCarta;
    @Column(name = "data_alteracao")
    public Date dataAlteracao;
    @Column(name = "tipo_sms")
    public int tipoSms;
    @Column(name = "tipo_ligacao")
    public int tipoLigacao;
    @Column(name = "tipo_carta")
    public int tipoCarta;
    @Column(name = "tipo_email")
    public int tipoEmail;
}
