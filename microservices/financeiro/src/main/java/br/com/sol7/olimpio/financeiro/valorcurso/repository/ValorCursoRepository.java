package br.com.sol7.olimpio.financeiro.valorcurso;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ValorCursoRepository implements PanacheRepository<ValorCurso> {

    public Uni<List<Integer>> listarVinculos(String tabela, String colunaVinculo, Long valorCursoId) {
        return Panache.getSession()
                .chain(session -> session
                        .createNativeQuery("SELECT " + colunaVinculo + " FROM " + tabela + " WHERE id_valor_curso = ?1")
                        .setParameter(1, valorCursoId.intValue())
                        .getResultList()
                        .map(list -> list.stream().map(o -> ((Number) o).intValue()).toList()));
    }

    public Uni<Void> substituirVinculos(String tabela, String colunaVinculo, Long valorCursoId, List<Integer> ids) {
        return Panache.getSession()
                .chain(session -> session
                        .createNativeQuery("DELETE FROM " + tabela + " WHERE id_valor_curso = ?1")
                        .setParameter(1, valorCursoId.intValue())
                        .executeUpdate()
                        .chain(() -> {
                            Uni<Void> chain = Uni.createFrom().voidItem();
                            if (ids != null) {
                                for (Integer id : ids) {
                                    final Integer vinculo = id;
                                    chain = chain.chain(() -> session
                                            .createNativeQuery("INSERT INTO " + tabela + " (id_valor_curso, "
                                                    + colunaVinculo + ") VALUES (?1, ?2)")
                                            .setParameter(1, valorCursoId.intValue())
                                            .setParameter(2, vinculo)
                                            .executeUpdate()
                                            .replaceWithVoid());
                                }
                            }
                            return chain;
                        }));
    }
}
