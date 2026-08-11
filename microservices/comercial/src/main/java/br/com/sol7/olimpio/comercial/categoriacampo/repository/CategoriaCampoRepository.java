package br.com.sol7.olimpio.comercial.categoriacampo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class CategoriaCampoRepository implements PanacheRepository<CategoriaCampo> {

    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'descricaocompleta' nao encontrado em Categoria)
    // Migrado de CategoriaCampoRepository.autoComplete (legado) - HQL original:
    public static final String SQL_AUTO_COMPLETE_HQL_ORIGINAL =
            "select u from Categoria u where (lower(u.descricaocompleta) like '%' || ?1 || '%' or str(u.id) = ?1) order by u.descricaocompleta";

}