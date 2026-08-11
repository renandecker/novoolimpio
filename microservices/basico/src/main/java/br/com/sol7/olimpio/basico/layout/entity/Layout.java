package br.com.sol7.olimpio.basico.layout.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_layout")
public class Layout extends PanacheEntity {

    @Column(name = "key_feriado")
    public String keyFeriado;
    @Column(name = "icon")
    public String icon;
    @Column(name = "folder_login")
    public String folderLogin;
    @Column(name = "folder_doc")
    public String folderDocumento;
    @Column(name = "fl_default")
    public Boolean temaPadrao;
    @Column(name = "forder_backgound")
    public String folderBackgound;
    @Column(name = "login_posicao")
    public String loginPosicao;
    @Column(name = "tema_email")
    public String temaEmail;
    @Column(name = "tema")
    public String tema;
    @Column(name = "forder_barra")
    public String forderBarra;
    @Column(name = "url")
    public String url;
    @Column(name = "titulo")
    public String titulo;
    @Column(name = "posicao_logo")
    public String posicaoLogo;
    @Column(name = "repositio_arquivos")
    public String repositorio;
    @Column(name = "imagem_email")
    public String imagemEmail;
}
