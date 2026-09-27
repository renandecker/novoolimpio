package br.com.sol7.olimpio.bibliotecavirtual.provedor.dto;

import br.com.sol7.olimpio.bibliotecavirtual.provedor.entity.ProvedorDigital;
import java.time.LocalDate;

public class ProvedorDigitalResponse {

    public Long id;
    public String nome;
    public String descricao;
    public String urlApi;
    public Boolean suportaLti;
    public Boolean suportaSso;
    public String publicoAlvo;
    public String areaConhecimento;
    public String logoUrl;
    public String documentacaoUrl;
    public LocalDate dataCadastro;
    public Boolean flAtivo;

    public static ProvedorDigitalResponse fromEntity(ProvedorDigital provedor) {
        ProvedorDigitalResponse resp = new ProvedorDigitalResponse();
        resp.id = provedor.id;
        resp.nome = provedor.nome;
        resp.descricao = provedor.descricao;
        resp.urlApi = provedor.urlApi;
        resp.suportaLti = provedor.suportaLti;
        resp.suportaSso = provedor.suportaSso;
        resp.publicoAlvo = provedor.publicoAlvo;
        resp.areaConhecimento = provedor.areaConhecimento;
        resp.logoUrl = provedor.logoUrl;
        resp.documentacaoUrl = provedor.documentacaoUrl;
        resp.dataCadastro = provedor.dataCadastro;
        resp.flAtivo = provedor.flAtivo;
        return resp;
    }
}