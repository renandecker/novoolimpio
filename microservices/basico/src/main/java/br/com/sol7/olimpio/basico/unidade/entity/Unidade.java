package br.com.sol7.olimpio.basico.unidade.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_unidade")
public class Unidade extends PanacheEntity {

    @Column(name = "razao_social")
    public String razaoSocial;
    @Column(name = "nome_fantasia")
    public String nomeFantasia;
    @Column(name = "c_n_p_j")
    public String CNPJ;
    @Column(name = "inscricao_estadual")
    public String inscricaoEstadual;
    @Column(name = "id_logradouro")
    public Long logradouroId;  // referencia a Logradouro (id, cross-service)
    @Column(name = "email")
    public String email;
    @Column(name = "numero")
    public String numero;
    @Column(name = "area")
    public String area;
    @Column(name = "email_rh")
    public String emailRH;
    @Column(name = "id_tipo_unidade")
    public Long tipoUnidadeId;  // referencia a TipoUnidade (id, cross-service)
    @Column(name = "id_regiao")
    public Long regiaoId;  // referencia a Regiao (id, cross-service)
    @Column(name = "id_responsavel")
    public Long responsavelId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "id_tema")
    public Long layoutId;  // referencia a Layout (id, cross-service)
    @Column(name = "ponto_referencia")
    public String pontoReferencia;
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "diretor_ensino")
    public String diretorEnsino;
    @Column(name = "coordenador")
    public String coordenador;
    @Column(name = "cep")
    public String cep;
    @Column(name = "registro")
    public String registro;
    @Column(name = "fl_ativo")
    public Boolean ativo;
}
