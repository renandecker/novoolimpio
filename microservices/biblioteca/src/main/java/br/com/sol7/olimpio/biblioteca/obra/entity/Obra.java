package br.com.sol7.olimpio.biblioteca.obra.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bib_obra")
public class Obra extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "titulo", nullable = false, length = 500)
    public String titulo;

    @Column(name = "subtitulo", length = 500)
    public String subtitulo;

    @Column(name = "autores", columnDefinition = "TEXT")
    public String autores;

    @Column(name = "editora", length = 200)
    public String editora;

    @Column(name = "isbn", length = 13, unique = true)
    public String isbn;

    @Column(name = "edicao", length = 50)
    public String edicao;

    @Column(name = "ano_publicacao")
    public Integer anoPublicacao;

    @Column(name = "categoria", length = 100)
    public String categoria;

    @Column(name = "genero", length = 100)
    public String genero;

    @Column(name = "idioma", length = 50)
    public String idioma;

    @Column(name = "sinopse", columnDefinition = "TEXT")
    public String sinopse;

    @Column(name = "capa_url", length = 500)
    public String capaUrl;

    @Column(name = "classificacao_decimal", length = 50)
    public String classificacaoDecimal;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;
}