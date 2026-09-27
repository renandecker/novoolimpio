package br.com.sol7.olimpio.biblioteca.exemplar.dto;

import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ExemplarRequest {

    @Size(max = 50)
    public String codigoBarras;

    @Size(max = 50)
    public String tombo;

    @NotNull
    public Long obraId;

    public Exemplar.StatusExemplar status = Exemplar.StatusExemplar.DISPONIVEL;

    @Size(max = 200)
    public String localizacao;

    @Size(max = 100)
    public String estante;

    @Size(max = 100)
    public String corredor;

    @Size(max = 100)
    public String prateleira;

    public Exemplar.CondicaoFisica condicaoFisica = Exemplar.CondicaoFisica.BOM;

    @jakarta.validation.constraints.Min(1)
    public Integer quantidade = 1;

    public LocalDate dataAquisicao;

    public String observacoes;

    public LocalDate dataCadastro;

    public Boolean flAtivo = true;

    public Exemplar toEntity() {
        Exemplar exemplar = new Exemplar();
        exemplar.codigoBarras = this.codigoBarras;
        exemplar.tombo = this.tombo;
        exemplar.status = this.status;
        exemplar.localizacao = this.localizacao;
        exemplar.estante = this.estante;
        exemplar.corredor = this.corredor;
        exemplar.prateleira = this.prateleira;
        exemplar.condicaoFisica = this.condicaoFisica;
        exemplar.quantidade = this.quantidade;
        exemplar.dataAquisicao = this.dataAquisicao;
        exemplar.observacoes = this.observacoes;
        exemplar.dataCadastro = this.dataCadastro != null ? this.dataCadastro : LocalDate.now();
        exemplar.flAtivo = this.flAtivo;
        return exemplar;
    }

    public void updateEntity(Exemplar exemplar) {
        exemplar.codigoBarras = this.codigoBarras;
        exemplar.tombo = this.tombo;
        exemplar.status = this.status;
        exemplar.localizacao = this.localizacao;
        exemplar.estante = this.estante;
        exemplar.corredor = this.corredor;
        exemplar.prateleira = this.prateleira;
        exemplar.condicaoFisica = this.condicaoFisica;
        exemplar.quantidade = this.quantidade;
        exemplar.dataAquisicao = this.dataAquisicao;
        exemplar.observacoes = this.observacoes;
        exemplar.flAtivo = this.flAtivo;
    }
}