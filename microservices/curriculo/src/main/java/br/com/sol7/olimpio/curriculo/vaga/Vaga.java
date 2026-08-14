package br.com.sol7.olimpio.curriculo.vaga;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

@Entity
@Table(name = "cur_vaga")
public class Vaga extends PanacheEntity {

    @Column(name = "nome")
    public String nome;

    @Column(name = "descricao")
    public String descricao;

    @Column(name = "titulo_email")
    public String tituloEmail;

    @Column(name = "assunto_email")
    public String assuntoEmail;

    @Column(name = "data_inicio")
    @Temporal(TemporalType.DATE)
    public Date dataInicio;

    @Column(name = "data_fim")
    @Temporal(TemporalType.DATE)
    public Date dataFim;

    @Column(name = "vagas")
    public Integer vagas;

    @Column(name = "id_usuario")
    public Long usuarioId;

    @Column(name = "fl_ativo")
    public Boolean flAtivo;

    @Column(name = "fl_exibir_vaga")
    public Boolean flExibirVaga;

    @Column(name = "fl_email")
    public Boolean flEmail;

    @Column(name = "data_envio")
    @Temporal(TemporalType.TIMESTAMP)
    public Date dataEnvio;
}
