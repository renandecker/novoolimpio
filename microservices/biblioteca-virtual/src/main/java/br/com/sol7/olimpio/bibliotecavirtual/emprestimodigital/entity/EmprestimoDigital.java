package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.entity;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bib_emprestimo_digital")
public class EmprestimoDigital extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "usuario_id", nullable = false)
    public Long usuarioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_digital_id", nullable = false)
    public LivroDigital livroDigital;

    @Column(name = "data_inicio", nullable = false)
    public LocalDateTime dataInicio;

    @Column(name = "data_expiracao", nullable = false)
    public LocalDateTime dataExpiracao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_acesso", nullable = false, length = 30)
    public TipoAcesso tipoAcesso;

    @Column(name = "token_drm", length = 500)
    public String tokenDrm;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    public StatusEmprestimoDigital status = StatusEmprestimoDigital.ATIVO;

    @Column(name = "progresso_leitura")
    public Integer progressoLeitura = 0;

    @Column(name = "ultima_pagina_lida")
    public Integer ultimaPaginaLida;

    @Column(name = "data_devolucao_antecipada")
    public LocalDateTime dataDevolucaoAntecipada;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum TipoAcesso {
        DOWNLOAD_OFFLINE,
        LEITURA_ONLINE_STREAMING
    }

    public enum StatusEmprestimoDigital {
        ATIVO,
        EXPIRADO,
        DEVOLVIDO_ANTECIPADAMENTE
    }

    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(dataExpiracao);
    }
}