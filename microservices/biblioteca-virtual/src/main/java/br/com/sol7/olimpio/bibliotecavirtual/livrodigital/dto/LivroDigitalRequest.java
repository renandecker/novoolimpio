package br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class LivroDigitalRequest {

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

    public List<String> formatosDisponiveis;

    public Double tamanhoArquivoMb;

    @Size(max = 500)
    public String urlRecurso;

    @Size(max = 50)
    public String drmTipo;

    @Size(max = 500)
    public String previewUrl;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public LivroDigital toEntity() {
        LivroDigital livro = new LivroDigital();
        livro.titulo = this.titulo;
        livro.subtitulo = this.subtitulo;
        livro.autores = this.autores;
        livro.editora = this.editora;
        livro.isbn = this.isbn;
        livro.edicao = this.edicao;
        livro.anoPublicacao = this.anoPublicacao;
        livro.categoria = this.categoria;
        livro.genero = this.genero;
        livro.idioma = this.idioma;
        livro.sinopse = this.sinopse;
        livro.capaUrl = this.capaUrl;
        livro.classificacaoDecimal = this.classificacaoDecimal;
        livro.formatosDisponiveis = this.formatosDisponiveis;
        livro.tamanhoArquivoMb = this.tamanhoArquivoMb;
        livro.urlRecurso = this.urlRecurso;
        livro.drmTipo = this.drmTipo;
        livro.previewUrl = this.previewUrl;
        livro.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        livro.flAtivo = this.flAtivo;
        return livro;
    }

    public void updateEntity(LivroDigital livro) {
        livro.titulo = this.titulo;
        livro.subtitulo = this.subtitulo;
        livro.autores = this.autores;
        livro.editora = this.editora;
        livro.isbn = this.isbn;
        livro.edicao = this.edicao;
        livro.anoPublicacao = this.anoPublicacao;
        livro.categoria = this.categoria;
        livro.genero = this.genero;
        livro.idioma = this.idioma;
        livro.sinopse = this.sinopse;
        livro.capaUrl = this.capaUrl;
        livro.classificacaoDecimal = this.classificacaoDecimal;
        livro.formatosDisponiveis = this.formatosDisponiveis;
        livro.tamanhoArquivoMb = this.tamanhoArquivoMb;
        livro.urlRecurso = this.urlRecurso;
        livro.drmTipo = this.drmTipo;
        livro.previewUrl = this.previewUrl;
        livro.flAtivo = this.flAtivo;
    }
}