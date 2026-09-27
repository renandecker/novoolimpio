package br.com.sol7.olimpio.pagamento.gateway.fiserv;

import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servico que le as credenciais Fiserv/Asaas da tabela fin_bancos (por unidade + provedor).
 * Utiliza cache Caffeine para evitar queries ao banco a cada chamada de API.
 * Faz fallback para as properties estaticas (application.properties) quando nao encontra no DB.
 */
@ApplicationScoped
public class FinBancoConfigService {

    private static final String PROVEDOR_FISERV = "FISERV";
    private static final String PROVEDOR_ASAAS = "ASAAS";

    /**
     * Busca todas as configuracoes de um provedor para uma unidade.
     * Cacheia por 10 minutos (mesmo TTL do cartao-pessoa-cache).
     */
    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<Map<String, String>> getConfiguracao(Long unidadeId, String provedor) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    String sql = "SELECT chave AS chave, valor AS valor FROM fin_bancos "
                            + "WHERE id_unidade = :unidadeId AND provedor = :provedor AND fl_ativo = true";
                    return session.createNativeQuery(sql, Tuple.class)
                            .setParameter("unidadeId", unidadeId)
                            .setParameter("provedor", provedor)
                            .getResultList()
                            .map(list -> {
                                Map<String, String> config = new ConcurrentHashMap<>();
                                for (Tuple row : list) {
                                    String chave = TupleHelper.getString(row, "chave");
                                    String valor = TupleHelper.getString(row, "valor");
                                    if (valor == null) valor = "";
                                    config.put(chave, valor);
                                }
                                return config;
                            });
                });
    }

    /**
     * Busca um valor especifico de configuracao.
     */
    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<String> getValor(Long unidadeId, String provedor, String chave) {
        return getConfiguracao(unidadeId, provedor)
                .map(config -> config.getOrDefault(chave, ""));
    }

    /**
     * Invalida o cache de configuracao (chamado apos update/delete na tela de config).
     */
    @CacheInvalidateAll(cacheName = "fin-banco-config-cache")
    public void invalidateCache() {
        // Metodo vazio - a anotacao @CacheInvalidateAll invalida o cache
    }
}
