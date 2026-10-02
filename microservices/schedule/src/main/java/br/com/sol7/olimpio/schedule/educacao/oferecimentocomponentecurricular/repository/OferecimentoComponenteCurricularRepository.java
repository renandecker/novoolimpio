package br.com.sol7.olimpio.schedule.educacao.oferecimentocomponentecurricular.repository;

import java.util.List;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

/**
 * Repository simplificado para uso no schedule service sem dependencia do microservico educacao.
 */
@ApplicationScoped
public class OferecimentoComponenteCurricularRepository {

    public static final String SQL_REPLICAR_OFERECIMENTOS_PADRAO = "SELECT o.* FROM edc_oferecimento_componente_curricular o WHERE o.status in ('LIBERADA', 'EM_ANDAMENTO')";

    /**
     * Verifica status das disciplinas.
     * Originalmente consultava bas_config para SQL de replicacao configurado.
     */
    public Uni<Boolean> verificarDisciplina() {
        return Uni.createFrom().item(true);
    }

    /**
     * Verifica se houve chamada assinada.
     */
    public Uni<Boolean> verificarchamadaAssinada() {
        return Uni.createFrom().item(true);
    }

    /**
     * Busca SQL de configuracao de replicacao.
     * Retorna SQL padrao se nao configurado.
     */
    public Uni<String> buscarSqlConfigReplicacao() {
        return Uni.createFrom().item(SQL_REPLICAR_OFERECIMENTOS_PADRAO);
    }

    /**
     * Lista IDs de oferecimentos para replicacao.
     */
    public Uni<List<Long>> listarIdsParaReplicacao(String sql) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }
}