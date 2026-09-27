package br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto.LicencaAcervoResponse;
import java.time.LocalDate;
import java.util.List;

public class LivroDigitalResponse {

    public Long id;
    public String titulo;
    public String subtitulo;
    public String autores;
    public String editora;
    public String isbn;
    public String edicao;
    public Integer anoPublicacao;
    public String categoria;
    public String genero;
    public String idioma;
    public String sinopse;
    public String capaUrl;
    public String classificacaoDecimal;
    public List<String> formatosDisponiveis;
    public Double tamanhoArquivoMb;
    public String urlRecurso;
    public String drmTipo;
    public String previewUrl;
    public LicencaAcervoResponse licenca;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static LivroDigitalResponse fromEntity(LivroDigital livro) {
        LivroDigitalResponse resp = new LivroDigitalResponse();
        resp.id = livro.id;
        resp.titulo = livro.titulo;
        resp.subtitulo = livro.subtitulo;
        resp.autores = livro.autores;
        resp.editora = livro.editora;
        resp.isbn = livro.isbn;
        resp.edicao = livro.edicao;
        resp.anoPublicacao = livro.anoPublicacao;
        resp.categoria = livro.categoria;
        resp.genero = livro.genero;
        resp.idioma = livro.idioma;
        resp.sinopse = livro.sinopse;
        resp.capaUrl = livro.capaUrl;
        resp.classificacaoDecimal = livro.classificacaoDecimal;
        resp.formatosDisponiveis = livro.formatosDisponiveis;
        resp.tamanhoArquivoMb = livro.tamanhoArquivoMb;
        resp.urlRecurso = livro.urlRecurso;
        resp.drmTipo = livro.drmTipo;
        resp.previewUrl = livro.previewUrl;
        resp.dataCadastro = livro.dataCadastro;
        resp.flAtivo = livro.flAtivo;
        return resp;
    }
}