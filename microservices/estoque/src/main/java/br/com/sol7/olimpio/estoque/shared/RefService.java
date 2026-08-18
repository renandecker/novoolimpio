package br.com.sol7.olimpio.estoque.shared;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Resolve as opcoes (id + label) de colunas que sao chave estrangeira (FK) para
 * o frontend (DataTable -> RecordModal -> GET /api/curriculo/<feature>/refs).
 * Recebe um mapa coluna -> SQL nativo que retorna (id, label) e devolve
 * { coluna: [{id, label}] }.
 */
@ApplicationScoped
public class RefService {

    public Uni<Map<String, List<RefOption>>> resolve(Map<String, String> sqlByColumn) {
        Uni<Map<String, List<RefOption>>> chain = Uni.createFrom().item(new HashMap<>());
        for (Map.Entry<String, String> entry : sqlByColumn.entrySet()) {
            chain = chain.chain(map -> query(entry.getValue())
                    .map(options -> {
                        map.put(entry.getKey(), options);
                        return map;
                    }));
        }
        return chain;
    }

    private Uni<List<RefOption>> query(String sql) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql).setMaxResults(200).getResultList())
                .map(rows -> rows.stream().map(row -> {
                    Object[] values = (Object[]) row;
                    Long id = ((Number) values[0]).longValue();
                    String label = values.length > 1 && values[1] != null ? String.valueOf(values[1]) : null;
                    return new RefOption(id, label);
                }).toList());
    }
}

