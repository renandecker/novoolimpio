package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;

import br.com.sol7.olimpio.educacao.diaaula.DiaAula;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "edc_oferecimento_componente_curricular")
public class OferecimentoComponenteCurricular extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "id_periodo")
    public Long periodoId;  // referencia a Periodo (id, cross-service)
    @Column(name = "id_grupo")
    public Long grupoId;  // referencia a Grupo (id, cross-service)
    @Column(name = "id_sala")
    public Long salaId;  // referencia a Sala (id, cross-service)
    @Column(name = "data_inicio")
    @Temporal(TemporalType.DATE)
    public Date dataInicio;
    @Column(name = "data_fim")
    @Temporal(TemporalType.DATE)
    public Date dataFim;
    @Column(name = "data_alteracao")
    public Date dataAlteracao;
    @Column(name = "tipo_replicacao")
    public int tipoReplicacao;
    @Column(name = "tipo_planejamento")
    public String tipoPlanejamento;  // era TipoPlanejamentoAula (enum) no legado; armazena o name()
    @Column(name = "qtde_dias_replicar")
    public int diasReplicar;
    @Column(name = "qtde_sequencia")
    public int qtdeSequencia;
    @Column(name = "qtde_espaco_caderno")
    public int qtdeEspacoCaderno;
    @Column(name = "id_curso")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "id_professor")
    public Long professorId;  // referencia a Professor (id, cross-service)
    @Column(name = "id_componente_curricular")
    public Long componenteCurricularId;  // referencia a ComponenteCurricular (id, cross-service)
    @Column(name = "id_componente_replicar")
    public Long componenteCurricularReplicarId;  // referencia a ComponenteCurricular (id, cross-service)
    @Column(name = "vagas")
    public Integer vagas;
    @Column(name = "inscritos")
    public Integer inscritos;
    @Column(name = "data_cancelamento")
    @Temporal(TemporalType.DATE)
    public Date dataCancelamento;
    @Column(name = "fl_registra_frequencia")
    public Boolean registraFrequencia;
    @Column(name = "fl_possui_avaliacao")
    public Boolean possuiAvaliacao;
    @Column(name = "fl_replicar")
    public boolean replicar;
    @Column(name = "fl_replicado")
    public Boolean replicado;
    @Column(name = "fl_detalhar_replicacao")
    public boolean detalharReplicacao;
    @Column(name = "salas")
    public String salas;
    @Column(name = "status")
    public String status;  // era StatusOferecimento (enum/embeddable) no legado
    @Column(name = "sequencia")
    public int sequencia;

    @ManyToMany
    @JoinTable(name = "edc_oferecimento_dias_aula",
            joinColumns = @JoinColumn(name = "id_oferecimento_componente_curricular"),
            inverseJoinColumns = @JoinColumn(name = "id_dia_aula"))
    public Set<DiaAula> diasAula = new LinkedHashSet<>();
}
