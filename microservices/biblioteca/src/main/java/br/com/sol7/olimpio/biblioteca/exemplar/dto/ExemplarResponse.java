package br.com.sol7.olimpio.biblioteca.exemplar.dto;

import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import br.com.sol7.olimpio.biblioteca.obra.dto.ObraResponse;
import java.time.LocalDate;

public class ExemplarResponse {

    public Long id;
    public String codigoBarras;
    public String tombo;
    public ObraResponse obra;
    public Exemplar.StatusExemplar status;
    public String localizacao;
    public String estante;
    public String corredor;
    public String prateleira;
    public Exemplar.CondicaoFisica condicaoFisica;
    public Integer quantidade;
    public LocalDate dataAquisicao;
    public String observacoes;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static ExemplarResponse fromEntity(Exemplar exemplar) {
        ExemplarResponse resp = new ExemplarResponse();
        resp.id = exemplar.id;
        resp.codigoBarras = exemplar.codigoBarras;
        resp.tombo = exemplar.tombo;
        resp.obra = exemplar.obra != null ? ObraResponse.fromEntity(exemplar.obra) : null;
        resp.status = exemplar.status;
        resp.localizacao = exemplar.localizacao;
        resp.estante = exemplar.estante;
        resp.corredor = exemplar.corredor;
        resp.prateleira = exemplar.prateleira;
        resp.condicaoFisica = exemplar.condicaoFisica;
        resp.quantidade = exemplar.quantidade;
        resp.dataAquisicao = exemplar.dataAquisicao;
        resp.observacoes = exemplar.observacoes;
        resp.dataCadastro = exemplar.dataCadastro;
        resp.flAtivo = exemplar.flAtivo;
        return resp;
    }
}