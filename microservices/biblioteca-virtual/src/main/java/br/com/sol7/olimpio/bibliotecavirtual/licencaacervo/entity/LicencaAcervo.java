package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.entity;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.entity.LivroDigital;
import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bib_licenca_acervo")
public class LicencaAcervo extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livro_digital_id", nullable = false, unique = true)
    public LivroDigital livroDigital;

    @Enumerated(EnumType.STRING)
    @Column(name = "modelo_licenca", nullable = false, length = 30)
    public ModeloLicenca modeloLicenca;

    @Column(name = "total_licencas_contratadas", nullable = false)
    public Integer totalLicencasContratadas = 1;

    @Column(name = "licencas_em_uso", nullable = false)
    public Integer licencasEmUso = 0;

    @Column(name = "data_inicio_vigencia")
    public LocalDate dataInicioVigencia;

    @Column(name = "data_fim_vigencia")
    public LocalDate dataFimVigencia;

    @Column(name = "max_acessos_contados")
    public Integer maxAcessosContados;

    @Column(name = "acessos_realizados", nullable = false)
    public Integer acessosRealizados = 0;

    @Column(name = "data_cadastro", nullable = false)
    public LocalDate dataCadastro;

    @Column(name = "fl_ativo", nullable = false)
    public Boolean flAtivo = true;

    @Version
    @Column(name = "version")
    public Long version;

    public enum ModeloLicenca {
        USO_SIMULTANEO_ILIMITADO,
        COPIA_UNICA,
        METERED_ACCESS
    }

    public boolean hasLicencasDisponiveis() {
        return switch (modeloLicenca) {
            case USO_SIMULTANEO_ILIMITADO -> true;
            case COPIA_UNICA -> licencasEmUso < totalLicencasContratadas;
            case METERED_ACCESS -> maxAcessosContados == null || acessosRealizados < maxAcessosContados;
        };
    }
}