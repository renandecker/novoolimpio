package br.com.sol7.olimpio.central.resultadocontato;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ResultadoContatoRepository implements PanacheRepository<ResultadoContato> {

    // Select a from ResultadoContato a  order by a.descricao
    public static final String SQL_BUSCAR_RESULTADOS_ORDENADO =
            "SELECT a.* FROM cen_resultado_contato a ORDER BY a.descricao";

    public Uni<java.util.List<ResultadoContato>> buscarResultadosOrdenado() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESULTADOS_ORDENADO, ResultadoContato.class)

                        .getResultList());
    }


    // Select a from ResultadoContato a where a.visivel = true order by a.descricao
    public static final String SQL_BUSCAR_RESULTADOS_ORDENADO_LIGACAO =
            "SELECT a.* FROM cen_resultado_contato a WHERE a.fl_visivel = true ORDER BY a.descricao";

    public Uni<java.util.List<ResultadoContato>> buscarResultadosOrdenadoLigacao() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESULTADOS_ORDENADO_LIGACAO, ResultadoContato.class)

                        .getResultList());
    }

}