package br.com.sol7.olimpio.educacao.apresentacao;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ApresentacaoRepository implements PanacheRepository<Apresentacao> {

    // Migrado de ApresentacaoRepository.maiorOrdem (legado) - HQL original:
    // Select max(a.ordem) from Apresentacao a
    public static final String SQL_MAIOR_ORDEM =
            "SELECT max(a.ordem) FROM bas_apresentacao a";

    public Uni<java.util.List<Object>> maiorOrdem() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MAIOR_ORDEM)

                        .getResultList());
    }


    // Migrado de ApresentacaoRepository.listarApresentacoesOrdenado (legado) - HQL original:
    // Select a from Apresentacao a order by a.ordem
    public static final String SQL_LISTAR_APRESENTACOES_ORDENADO =
            "SELECT a.* FROM bas_apresentacao a ORDER BY a.ordem";

    public Uni<java.util.List<Apresentacao>> listarApresentacoesOrdenado() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_APRESENTACOES_ORDENADO, Apresentacao.class)

                        .getResultList());
    }

}