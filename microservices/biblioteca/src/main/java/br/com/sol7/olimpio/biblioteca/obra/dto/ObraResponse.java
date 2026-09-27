package br.com.sol7.olimpio.biblioteca.obra.dto;

import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import java.time.LocalDate;

public class ObraResponse {

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
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static ObraResponse fromEntity(Obra obra) {
        ObraResponse resp = new ObraResponse();
        resp.id = obra.id;
        resp.titulo = obra.titulo;
        resp.subtitulo = obra.subtitulo;
        resp.autores = obra.autores;
        resp.editora = obra.editora;
        resp.isbn = obra.isbn;
        resp.edicao = obra.edicao;
        resp.anoPublicacao = obra.anoPublicacao;
        resp.categoria = obra.categoria;
        resp.genero = obra.genero;
        resp.idioma = obra.idioma;
        resp.sinopse = obra.sinopse;
        resp.capaUrl = obra.capaUrl;
        resp.classificacaoDecimal = obra.classificacaoDecimal;
        resp.dataCadastro = obra.dataCadastro;
        resp.flAtivo = obra.flAtivo;
        return resp;
    }
}