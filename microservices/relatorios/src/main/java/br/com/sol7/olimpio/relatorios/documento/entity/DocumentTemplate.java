package br.com.sol7.olimpio.relatorios.documento.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rel_document_template")
public class DocumentTemplate extends PanacheEntityBase {

    @Id
    @SequenceGenerator(name = "rel_document_template_seq", sequenceName = "rel_document_template_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "rel_document_template_seq")
    public Long id;

    @Column(name = "nome", nullable = false, length = 255)
    public String nome;

    @Column(name = "descricao", length = 1000)
    public String descricao;

    @Column(name = "arquivo_nome", nullable = false, length = 255)
    public String arquivoNome;

    @Column(name = "arquivo_dados", nullable = false)
    @Lob
    public byte[] arquivoDados;

    @Column(name = "tipo_relatorio", length = 50)
    public String tipoRelatorio;

    @Column(name = "relatorio_id")
    public Long relatorioId;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean ativo = true;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDateTime dataCadastro = LocalDateTime.now();

    @Column(name = "data_alteracao")
    public LocalDateTime dataAlteracao;

    @Column(name = "usuario_id")
    public Long usuarioId;
}