package br.com.sol7.olimpio.bibliotecavirtual.provedor.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity
@Table(name = "bib_provedor_digital")
public class ProvedorDigital extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "nome", nullable = false, length = 200, unique = true)
    public String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    public String descricao;

    @Column(name = "url_api", length = 500)
    public String urlApi;

    @Column(name = "suporta_lti", nullable = false)
    public Boolean suportaLti = false;

    @Column(name = "suporta_sso", nullable = false)
    public Boolean suportaSso = false;

    @Column(name = "publico_alvo", length = 100)
    public String publicoAlvo;

    @Column(name = "area_conhecimento", columnDefinition = "TEXT")
    public String areaConhecimento;

    @Column(name = "logo_url", length = 500)
    public String logoUrl;

    @Column(name = "documentacao_url", length = 500)
    public String documentacaoUrl;

    @Column(name = "data_cadastro", nullable = false)
    public java.time.LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;
}