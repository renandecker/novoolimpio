package br.com.sol7.olimpio.comercial.atendimentoconsultor;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class AtendimentoConsultorRepository implements PanacheRepository<AtendimentoConsultor> {

    // select o from OferecimentoComponenteCurricular o where o.unidade.ativo = true
    // and (o.status = 'LIBERADA' OR o.status = 'LOTADA' OR o.status = 'EM_ANDAMENTO')
    // and o.componenteCurricular in (componentes da matriz curricular do curso)
    // and o.unidade in (?1) order by o.componenteCurricular
    public static final String SQL_BUSCAR_TURMAS_OFERECIDAS =
            "SELECT DISTINCT o.id AS id, o.status AS status, o.vagas AS vagas, o.inscritos AS inscritos, "
            + "o.data_inicio AS data_inicio, o.data_fim AS data_fim, o.id_unidade AS id_unidade, "
            + "un.sucinto AS unidade, o.id_sala AS id_sala, sla.sucinto AS sala, "
            + "o.id_componente_curricular AS id_componente_curricular, cc.sucinto AS componente, "
            + "o.id_periodo AS id_periodo, o.id_professor AS id_professor "
            + "FROM edc_oferecimento_componente_curricular o "
            + "INNER JOIN bas_unidade un ON un.id = o.id_unidade AND un.fl_ativo = true "
            + "INNER JOIN edc_matriz_curricular mc ON mc.id_componente_curricular = o.id_componente_curricular "
            + "INNER JOIN edc_componente_curricular cc ON cc.id = o.id_componente_curricular "
            + "LEFT JOIN edc_sala sla ON sla.id = o.id_sala "
            + "WHERE mc.id_curriculo = ?1 "
            + "AND (o.status = 'LIBERADA' OR o.status = 'LOTADA' OR o.status = 'EM_ANDAMENTO') "
            + "AND o.id_unidade IN (?2) "
            + "ORDER BY cc.sucinto, o.id";

    public Uni<List<Tuple>> buscarTurmasOferecidas(Long curriculoId, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURMAS_OFERECIDAS, Tuple.class)
                        .setParameter(1, curriculoId)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }

    // select o from OferecimentoComponenteCurricular o join fetch o.diasAula c where o.unidade.ativo = true and o in (?1)
    public static final String SQL_BUSCAR_DIAS_AULA_TURMAS =
            "SELECT oda.id_oferecimento_componente_curricular AS id_oferecimento, da.id AS id_dia_aula, "
            + "ds.id AS id_dia_semana, ds.nome AS dia_semana, t.id AS id_turno, t.sucinto AS turno, "
            + "t.inicio AS turno_inicio, t.fim AS turno_fim "
            + "FROM edc_oferecimento_dias_aula oda "
            + "INNER JOIN edc_dia_aula da ON da.id = oda.id_dia_aula "
            + "LEFT JOIN bas_dia_semana ds ON ds.id = da.id_dia_semana "
            + "LEFT JOIN edc_turno t ON t.id = da.id_turno "
            + "WHERE oda.id_oferecimento_componente_curricular IN (?1) "
            + "ORDER BY oda.id_oferecimento_componente_curricular, ds.nome, t.inicio";

    public Uni<List<Tuple>> buscarDiasAulaTurmas(List<Long> ofertaIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_DIAS_AULA_TURMAS, Tuple.class)
                        .setParameter(1, ofertaIds)
                        .getResultList());
    }

    // select oc from OcorrenciaComponenteCurricular oc where oc.oferecimentoComponenteCurricular in (?1) and oc.ativo = true order by oc.data
    public static final String SQL_BUSCAR_OCORRENCIAS_TURMAS =
            "SELECT occ.id_oferecimento_componente_curricular AS id_oferecimento, occ.id AS id, occ.data AS data, "
            + "occ.id_dia_aula AS id_dia_aula, occ.id_sala AS id_sala, occ.id_professor AS id_professor, "
            + "occ.aula_coringa AS aula_coringa, occ.aula_presencial AS aula_presencial "
            + "FROM edc_ocorrencia_componente_curricular occ "
            + "WHERE occ.id_oferecimento_componente_curricular IN (?1) AND occ.fl_ativo = true "
            + "ORDER BY occ.id_oferecimento_componente_curricular, occ.data";

    public Uni<List<Tuple>> buscarOcorrenciasTurmas(List<Long> ofertaIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIAS_TURMAS, Tuple.class)
                        .setParameter(1, ofertaIds)
                        .getResultList());
    }
}
