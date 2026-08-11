package br.com.sol7.olimpio.educacao.gerirnap;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "gerir_nap")
public class GerirNap extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "qtd_emails")
    public long qtdEmails;
    @Column(name = "qtd_cartas")
    public long qtdCartas;
    @Column(name = "qtd_ligacoes")
    public long qtdLigacoes;
    @Column(name = "qtd_presente")
    public long qtdPresente;
    @Column(name = "qtd_ausente")
    public long qtdAusente;
    @Column(name = "qtd_atestado")
    public long qtdAtestado;
    @Column(name = "qtd_meia_presenca")
    public long qtdMeiaPresenca;
    @Column(name = "qtd_sem_registro")
    public long qtdSemRegistro;
    @Column(name = "qtd_cancelado")
    public long qtdCancelado;
    @Column(name = "qtd_troca_turma")
    public long qtdTrocaTurma;
    @Column(name = "qtd_prorrogado")
    public long qtdProrrogado;
    @Column(name = "qtd_desistente")
    public long qtdDesistente;
    @Column(name = "qtd_atrasado")
    public long qtdAtrasado;
}
