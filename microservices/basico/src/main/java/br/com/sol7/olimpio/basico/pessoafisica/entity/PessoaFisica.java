package br.com.sol7.olimpio.basico.pessoafisica.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "bas_pessoa_fisica")
public class PessoaFisica extends PanacheEntity {

    @Column(name = "id_pessoa")
    public Long pessoaId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "nome_social")
    public String nomeSocial;
    @Column(name = "nome")
    public String nome;
    @Column(name = "cpf")
    public String cpf;
    @Column(name = "rg")
    public String rg;
    @Column(name = "nome_referencia")
    public String nomeReferencia;
    @Column(name = "telefone_referencia")
    public String telefoneReferencia;
    @Column(name = "celular_referencia")
    public String celularReferencia;
    @Column(name = "nome_referencia2")
    public String nomeReferencia2;
    @Column(name = "telefone_referencia2")
    public String telefoneReferencia2;
    @Column(name = "celular_referencia2")
    public String celularReferencia2;
    @Column(name = "data_emissao_rg")
    public Date dataEmissaoRg;
    @Column(name = "orgao_emissor_rg")
    public String orgaoEmissorRg;
    @Column(name = "id_cidade_origem")
    public Long cidadeOrigemId;  // referencia a Cidade (id, cross-service)
    @Column(name = "nome_pai")
    public String nomePai;
    @Column(name = "nome_mae")
    public String nomeMae;
    @Column(name = "data_nascimento")
    public Date dataNascimento;
    @Column(name = "id_genero")
    public Long generoId;  // referencia a Genero (id, cross-service)
    @Column(name = "id_etnia")
    public Long etniaId;  // referencia a Etnia (id, cross-service)
    @Column(name = "id_escolaridade")
    public Long escolaridadeId;  // referencia a Escolaridade (id, cross-service)
    @Column(name = "id_estado_civil")
    public Long estadoCivilId;  // referencia a EstadoCivil (id, cross-service)
    @Column(name = "facebook")
    public String facebook;
    @Column(name = "twitter")
    public String twitter;
    @Column(name = "google_plus")
    public String googlePlus;
    @Column(name = "telefone_comercial")
    public String telefoneComercial;
}
