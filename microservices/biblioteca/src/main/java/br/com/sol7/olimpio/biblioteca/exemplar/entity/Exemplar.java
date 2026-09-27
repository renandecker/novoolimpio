package br.com.sol7.olimpio.biblioteca.exemplar.entity;

import br.com.sol7.olimpio.biblioteca.obra.entity.Obra;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bib_exemplar")
public class Exemplar extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "codigo_barras", length = 50, unique = true)
    public String codigoBarras;

    @Column(name = "tombo", length = 50, unique = true)
    public String tombo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    public Obra obra;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    public StatusExemplar status = StatusExemplar.DISPONIVEL;

    @Column(name = "localizacao", length = 200)
    public String localizacao;

    @Column(name = "estante", length = 100)
    public String estante;

    @Column(name = "corredor", length = 100)
    public String corredor;

    @Column(name = "prateleira", length = 100)
    public String prateleira;

    @Enumerated(EnumType.STRING)
    @Column(name = "condicao_fisica", length = 20)
    public CondicaoFisica condicaoFisica = CondicaoFisica.BOM;

    @Column(name = "quantidade", nullable = false)
    public Integer quantidade = 1;

    @Column(name = "data_aquisicao")
    public LocalDate dataAquisicao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    public String observacoes;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum StatusExemplar {
        DISPONIVEL,
        EMPRESTADO,
        RESERVADO,
        EM_MANUTENCAO,
        PERDIDO
    }

    public enum CondicaoFisica {
        NOVO,
        BOM,
        DANIFICADO
    }
}