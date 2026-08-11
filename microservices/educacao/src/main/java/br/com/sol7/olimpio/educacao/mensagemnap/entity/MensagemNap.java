package br.com.sol7.olimpio.educacao.mensagemnap;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_mensagem_nap")
public class MensagemNap extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "assunto")
    public String assunto;
    @Column(name = "mensagem")
    public String mensagem;
    @Column(name = "fl_email")
    public Boolean flagEmail;
}
