package br.com.sol7.olimpio.comercial.campo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "com_campo")
public class Campo extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "rotulo")
    public String rotulo;
    @Column(name = "maskara")
    public String maskara;
    @Column(name = "tipo")
    public String tipo;  // era TipoCampo (enum/embeddable) no legado
    @Column(name = "tamanho")
    public Integer tamanho;
    @Column(name = "id_categoria")
    public Long categoriaId;  // referencia a Categoria (id, cross-service)
    @Column(name = "flag_nome")
    public Boolean flagNome;
    @Column(name = "flag_telefone")
    public Boolean flagTelefone;
    @Column(name = "flag_email")
    public Boolean flagEmail;
    @Column(name = "flag_rede_social")
    public Boolean flagRedeSocial;
    @Column(name = "flag_endereco")
    public Boolean flagEndereco;
    @Column(name = "flag_idade")
    public Boolean flagIdade;
    @Column(name = "flag_banco")
    public Boolean flagBanco;
    @Column(name = "flag_maskara")
    public Boolean flagMaskara;
    @Column(name = "flag_data_nascimento")
    public Boolean flagDataNascimento;
    @Column(name = "flag_logradouro")
    public Boolean flagLogradouro;
    @Column(name = "flag_upload")
    public Boolean flagUpload;
}
