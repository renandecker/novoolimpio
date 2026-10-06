package br.com.sol7.olimpio.basico.acesso.service;

import br.com.sol7.olimpio.basico.acesso.dto.VerificarAcessoResponse;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Resolve o acesso do usuario autenticado por tela do menu. O caminho da tela e o
 * campo outcome de bas_modulo; as permissoes por tela sao os booleanos de
 * bas_perfil_modulo dos perfis vinculados em bas_usuario_perfil.
 *
 * A resolucao espelha a regra aplicada no login ao montar o claim modulePermissions
 * do JWT, para que a resposta deste endpoint e o token nunca divirjam.
 */
@ApplicationScoped
public class VerificarAcessoService {

    private static final String SQL_PERMISSOES_DO_USUARIO = """
            SELECT m.outcome AS outcome, pm.novo AS novo, pm.editar AS editar,
                   pm.remover AS remover, pm.relatorio AS relatorio
            FROM bas_usuario u
            INNER JOIN bas_usuario_perfil up ON up.id_usuario = u.id
            INNER JOIN bas_perfil p ON p.id = up.id_perfil
            INNER JOIN bas_perfil_modulo pm ON pm.id_perfil = p.id
            INNER JOIN bas_modulo m ON m.id = pm.id_modulo
            WHERE lower(u.login) = lower(?1)
              AND m.outcome IS NOT NULL AND m.outcome <> ''
            """;

    private static final String SQL_HIERARQUIAS_DO_USUARIO = """
            SELECT p.hierarquia AS hierarquia
            FROM bas_usuario u
            INNER JOIN bas_usuario_perfil up ON up.id_usuario = u.id
            INNER JOIN bas_perfil p ON p.id = up.id_perfil
            WHERE lower(u.login) = lower(?1)
            """;

    private static final String SQL_TODOS_OS_OUTCOMES = """
            SELECT m.outcome AS outcome
            FROM bas_modulo m
            WHERE m.outcome IS NOT NULL AND m.outcome <> ''
            """;

    private static final Set<String> TODAS_PERMISSOES =
            Set.of("READ", "CREATE", "UPDATE", "DELETE", "EXECUTE");

    private record Acesso(boolean admin, Map<String, Set<String>> mapa) {
    }

    /**
     * Mapa outcome normalizado -> permissoes concedidas ao usuario. Perfis de
     * hierarquia ADMIN recebem todas as telas com todas as permissoes. Usuario sem
     * perfil vinculado resulta em mapa vazio.
     */
    @CacheResult(cacheName = "verificar-acesso-cache")
    public Uni<Map<String, Set<String>>> mapaEfetivo(String login) {
        return resolver(login).map(Acesso::mapa);
    }

    /**
     * Mapa completo outcome -> permissoes, no mesmo formato do claim
     * modulePermissions do JWT. Usado pelo PermissionBridge do frontend.
     */
    public Uni<Map<String, Set<String>>> todasAsTelas(String login) {
        return mapaEfetivo(login);
    }

    /**
     * Acesso do usuario na tela informada. Tela sem outcome correspondente em
     * bas_modulo devolve todos os flags desligados e conhecido=false, para o
     * frontend nao habilitar acoes de uma tela que nao existe no menu.
     */
    public Uni<VerificarAcessoResponse> porTela(String login, String outcome) {
        String normalizado = normalizar(outcome);
        return resolver(login).map(acesso -> {
            Set<String> permissoes = acesso.mapa().get(normalizado);
            boolean conhecido = permissoes != null;
            List<String> lista = (conhecido ? permissoes : Set.<String>of()).stream().sorted().toList();
            return new VerificarAcessoResponse(
                    normalizado,
                    acesso.admin(),
                    conhecido,
                    lista.contains("READ"),
                    lista.contains("CREATE"),
                    lista.contains("UPDATE"),
                    lista.contains("DELETE"),
                    lista.contains("EXECUTE"),
                    lista
            );
        });
    }

    private Uni<Acesso> resolver(String login) {
        if (login == null || login.isBlank()) {
            return Uni.createFrom().item(new Acesso(false, Map.of()));
        }
        return hierarquias(login).chain(linhas -> {
            if (isAdmin(linhas)) {
                return todosOsOutcomes().map(mapa -> new Acesso(true, mapa));
            }
            return permissoes(login).map(linhasPermissao -> new Acesso(false, montarMapa(linhasPermissao)));
        });
    }

    private boolean isAdmin(List<Object> hierarquias) {
        for (Object item : hierarquias) {
            Object valor = coluna(item, 0, "hierarquia");
            if (valor == null) continue;
            if ("ADMIN".equalsIgnoreCase(String.valueOf(valor).trim())) return true;
        }
        return false;
    }

    /**
     * Le uma coluna de uma linha de native query. O driver pode devolver a linha
     * como Tuple (por alias) ou como Object[] (por posicao). A posicao e
     * obrigatoria no segundo caso: ler por alias cairia sempre na primeira coluna e
     * corromperia o mapa de permissoes em silencio.
     */
    private Object coluna(Object linha, int indice, String alias) {
        if (linha instanceof Tuple tuple) return tuple.get(alias);
        if (linha instanceof Object[] valores) return indice >= 0 && indice < valores.length ? valores[indice] : null;
        return linha;
    }

    private Uni<List<Object>> hierarquias(String login) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_HIERARQUIAS_DO_USUARIO)
                        .setParameter(1, login)
                        .getResultList());
    }

    private Uni<List<Object>> permissoes(String login) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PERMISSOES_DO_USUARIO)
                        .setParameter(1, login)
                        .getResultList());
    }

    private Uni<Map<String, Set<String>>> todosOsOutcomes() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TODOS_OS_OUTCOMES)
                        .getResultList())
                .map(linhas -> {
                    Map<String, Set<String>> mapa = new LinkedHashMap<>();
                    for (Object linha : linhas) {
                        Object bruto = coluna(linha, 0, "outcome");
                        String outcome = normalizar(bruto == null ? null : String.valueOf(bruto));
                        if (outcome.isEmpty()) continue;
                        mapa.put(outcome, new LinkedHashSet<>(TODAS_PERMISSOES));
                    }
                    return mapa;
                });
    }

    private Map<String, Set<String>> montarMapa(List<Object> linhas) {
        Map<String, Set<String>> mapa = new LinkedHashMap<>();
        for (Object item : linhas) {
            String outcome = normalizar(valorDaColuna(item, 0, "outcome"));
            if (outcome.isEmpty()) continue;
            Set<String> permissoes = mapa.computeIfAbsent(outcome, chave -> new LinkedHashSet<>(Set.of("READ")));
            if (booleano(item, 1, "novo")) permissoes.add("CREATE");
            if (booleano(item, 2, "editar")) permissoes.add("UPDATE");
            if (booleano(item, 3, "remover")) permissoes.add("DELETE");
            if (booleano(item, 4, "relatorio")) permissoes.add("EXECUTE");
        }
        return mapa;
    }

    private String valorDaColuna(Object linha, int indice, String alias) {
        Object valor = coluna(linha, indice, alias);
        return valor == null ? null : String.valueOf(valor);
    }

    private boolean booleano(Object linha, int indice, String alias) {
        Object valor = coluna(linha, indice, alias);
        if (valor instanceof Boolean b) return b;
        if (valor instanceof Number n) return n.intValue() != 0;
        return valor != null && Boolean.parseBoolean(String.valueOf(valor));
    }

    /**
     * Normaliza o outcome da mesma forma que o frontend e o login: sem extensao
     * .xhtml e sem barras nas pontas, para o valor enviado na URL da tela casar
     * com o gravado em bas_modulo.
     */
    private String normalizar(String outcome) {
        if (outcome == null) return "";
        String valor = outcome.trim();
        if (valor.toLowerCase(Locale.ROOT).endsWith(".xhtml")) {
            valor = valor.substring(0, valor.length() - ".xhtml".length());
        }
        while (valor.startsWith("/")) valor = valor.substring(1);
        while (valor.endsWith("/")) valor = valor.substring(0, valor.length() - 1);
        return valor;
    }
}