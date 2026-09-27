package br.com.sol7.olimpio.bibliotecavirtual.provedor.dto;

import br.com.sol7.olimpio.bibliotecavirtual.provedor.entity.ProvedorDigital;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ProvedorDigitalRequest {

    @NotBlank
    @Size(max = 200)
    public String nome;

    public String descricao;

    @Size(max = 500)
    public String urlApi;

    public Boolean suportaLti = false;

    public Boolean suportaSso = false;

    @Size(max = 100)
    public String publicoAlvo;

    public String areaConhecimento;

    @Size(max = 500)
    public String logoUrl;

    @Size(max = 500)
    public String documentacaoUrl;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public ProvedorDigital toEntity() {
        ProvedorDigital provedor = new ProvedorDigital();
        provedor.nome = this.nome;
        provedor.descricao = this.descricao;
        provedor.urlApi = this.urlApi;
        provedor.suportaLti = this.suportaLti;
        provedor.suportaSso = this.suportaSso;
        provedor.publicoAlvo = this.publicoAlvo;
        provedor.areaConhecimento = this.areaConhecimento;
        provedor.logoUrl = this.logoUrl;
        provedor.documentacaoUrl = this.documentacaoUrl;
        provedor.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        provedor.flAtivo = this.flAtivo;
        return provedor;
    }

    public void updateEntity(ProvedorDigital provedor) {
        provedor.nome = this.nome;
        provedor.descricao = this.descricao;
        provedor.urlApi = this.urlApi;
        provedor.suportaLti = this.suportaLti;
        provedor.suportaSso = this.suportaSso;
        provedor.publicoAlvo = this.publicoAlvo;
        provedor.areaConhecimento = this.areaConhecimento;
        provedor.logoUrl = this.logoUrl;
        provedor.documentacaoUrl = this.documentacaoUrl;
        provedor.flAtivo = this.flAtivo;
    }
}