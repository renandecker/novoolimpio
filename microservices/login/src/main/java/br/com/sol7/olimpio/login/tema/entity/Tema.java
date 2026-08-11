package br.com.sol7.olimpio.login.tema.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_temas")
public class Tema extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(name = "tema", nullable = false, unique = true)
    public String tema;
    @Column(name = "titulo")
    public String titulo;
    @Column(name = "id_layout")
    public Long idLayout;
    @Column(name = "folder_css")
    public String folderCss;
    @Column(name = "cor_primaria")
    public String corPrimaria;
    @Column(name = "cor_secundaria")
    public String corSecundaria;
    @Column(name = "cor_barra")
    public String corBarra;
    @Column(name = "cor_fundo")
    public String corFundo;
    @Column(name = "cor_texto")
    public String corTexto;
    @Column(name = "cor_borda")
    public String corBorda;
    @Column(name = "cor_destaque")
    public String corDestaque;
    @Column(name = "cor_email")
    public String corEmail;
    @Column(name = "posicao_logo")
    public String posicaoLogo;
    @Column(name = "login_posicao")
    public String loginPosicao;
    @Column(name = "fl_default")
    public Boolean temaPadrao;
    @Column(name = "ativo")
    public Boolean ativo;
}
