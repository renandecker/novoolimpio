package br.com.sol7.olimpio.biblioteca.obra.dto;

import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ObraRequest {

    @NotBlank
    @Size(max = 500)
    public String titulo;

    @Size(max = 500)
    public String subtitulo;

    @Size(max = 5000)
    public String autores;

    @Size(max = 200)
    public String editora;

    @Size(max = 13)
    public String isbn;

    @Size(max = 50)
    public String edicao;

    public Integer anoPublicacao;

    @Size(max = 100)
    public String categoria;

    @Size(max = 100)
    public String genero;

    @Size(max = 50)
    public String idioma;

    public String sinopse;

    @Size(max = 500)
    public String capaUrl;

    @Size(max = 50)
    public String classificacaoDecimal;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public Obra toEntity() {
        Obra obra = new Obra();
        obra.titulo = this.titulo;
        obra.subtitulo = this.subtitulo;
        obra.autores = this.autores;
        obra.editora = this.editora;
        obra.isbn = this.isbn;
        obra.edicao = this.edicao;
        obra.anoPublicacao = this.anoPublicacao;
        obra.categoria = this.categoria;
        obra.genero = this.genero;
        obra.idioma = this.idioma;
        obra.sinopse = this.sinopse;
        obra.capaUrl = this.capaUrl;
        obra.classificacaoDecimal = this.classificacaoDecimal;
        obra.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        obra.flAtivo = this.flAtivo;
        return obra;
    }

    public void updateEntity(Obra obra) {
        obra.titulo = this.titulo;
        obra.subtitulo = this.subtitulo;
        obra.autores = this.autores;
        obra.editora = this.editora;
        obra.isbn = this.isbn;
        obra.edicao = this.edicao;
        obra.anoPublicacao = this.anoPublicacao;
        obra.categoria = this.categoria;
        obra.genero = this.genero;
        obra.idioma = this.idioma;
        obra.sinopse = this.sinopse;
        obra.capaUrl = this.capaUrl;
        obra.classificacaoDecimal = this.classificacaoDecimal;
        obra.flAtivo = this.flAtivo;
    }
}