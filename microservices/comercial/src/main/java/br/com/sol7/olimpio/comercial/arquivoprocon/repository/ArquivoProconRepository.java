package br.com.sol7.olimpio.comercial.arquivoprocon;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ArquivoProconRepository implements PanacheRepository<ArquivoProcon> {

    // Migrado de ArquivoProconRepository.verificarHash (legado) - HQL original:
    // Select a from ArquivoProcon a where a.hash = ?1
    public static final String SQL_VERIFICAR_HASH =
            "SELECT a.* FROM com_arquivos_procon a WHERE a.hash = ?1";

    public Uni<java.util.List<ArquivoProcon>> verificarHash(String hash) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_HASH, ArquivoProcon.class)
                    .setParameter(1, hash)
                    .getResultList());
    }


    // Migrado de ArquivoProconRepository.listaArquivoProcon (legado) - HQL original:
    // Select ap from ArquivoProcon ap order by ap.data desc
    public static final String SQL_LISTA_ARQUIVO_PROCON =
            "SELECT ap.* FROM com_arquivos_procon ap ORDER BY ap.data desc LIMIT 10";

    public Uni<java.util.List<ArquivoProcon>> listaArquivoProcon() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_ARQUIVO_PROCON, ArquivoProcon.class)

                    .getResultList());
    }

}