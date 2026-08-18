package br.com.sol7.olimpio.relatorios.disponivel;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class RelatorioDisponivelService {

    static final String SQL_BUSCAR_USUARIO =
            "SELECT u.id FROM bas_usuario u WHERE lower(u.login) = lower(?1)";

    // Regras de visibilidade migradas de RelatorioController.carregarRelatorio
    // (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/RelatorioController.java:34)
    static final String SQL_TABELA =
            "SELECT DISTINCT rel.id, rel.nome FROM rel_tabela rel " +
            "INNER JOIN bas_usuario usu ON (usu.id = ?1) " +
            "INNER JOIN bas_usuario_perfil per ON (per.id_usuario = usu.id) " +
            "INNER JOIN bas_usuario_unidade uni ON (uni.id_usuario = usu.id) " +
            "LEFT JOIN rel_tabela_perfil relperfil ON (relperfil.id_tabela = rel.id AND per.id_perfil = relperfil.id_perfil) " +
            "LEFT JOIN rel_tabela_unidade relunidade ON (relunidade.id_tabela = rel.id AND uni.id_unidade = relunidade.id_unidade) " +
            "LEFT JOIN rel_tabela_usuario relusuario ON (relusuario.id_tabela = rel.id AND usu.id = relusuario.id_usuario) " +
            "WHERE (rel.fl_todos_perfis = false AND relperfil.id_perfil = per.id_perfil) " +
            "   OR (rel.fl_todos_unidades = false AND relunidade.id_unidade = uni.id_unidade) " +
            "   OR (rel.fl_todos_usuarios = false AND relusuario.id_usuario = usu.id) " +
            "   OR usu.hierarquia = 'ADMIN' " +
            "ORDER BY rel.nome";

    static final String SQL_GRAFICO =
            "SELECT DISTINCT rel.id, rel.nome FROM rel_grafico rel " +
            "INNER JOIN bas_usuario usu ON (usu.id = ?1) " +
            "INNER JOIN bas_usuario_perfil per ON (per.id_usuario = usu.id) " +
            "INNER JOIN bas_usuario_unidade uni ON (uni.id_usuario = usu.id) " +
            "LEFT JOIN rel_grafico_perfil relperfil ON (relperfil.id_grafico = rel.id AND per.id_perfil = relperfil.id_perfil) " +
            "LEFT JOIN rel_grafico_unidade relunidade ON (relunidade.id_grafico = rel.id AND uni.id_unidade = relunidade.id_unidade) " +
            "LEFT JOIN rel_grafico_usuario relusuario ON (relusuario.id_grafico = rel.id AND usu.id = relusuario.id_usuario) " +
            "WHERE (rel.fl_todos_perfis = false AND relperfil.id_perfil = per.id_perfil) " +
            "   OR (rel.fl_todos_unidades = false AND relunidade.id_unidade = uni.id_unidade) " +
            "   OR (rel.fl_todos_usuarios = false AND relusuario.id_usuario = usu.id) " +
            "   OR usu.hierarquia = 'ADMIN' " +
            "ORDER BY rel.nome";

    static final String SQL_MAPA =
            "SELECT DISTINCT rel.id, rel.nome FROM rel_mapa rel " +
            "INNER JOIN bas_usuario usu ON (usu.id = ?1) " +
            "INNER JOIN bas_usuario_perfil per ON (per.id_usuario = usu.id) " +
            "INNER JOIN bas_usuario_unidade uni ON (uni.id_usuario = usu.id) " +
            "LEFT JOIN rel_mapa_perfil relperfil ON (relperfil.id_mapa = rel.id AND per.id_perfil = relperfil.id_perfil) " +
            "LEFT JOIN rel_mapa_unidade relunidade ON (relunidade.id_mapa = rel.id AND uni.id_unidade = relunidade.id_unidade) " +
            "LEFT JOIN rel_mapa_usuario relusuario ON (relusuario.id_mapa = rel.id AND usu.id = relusuario.id_usuario) " +
            "WHERE (rel.fl_todos_perfis = false AND relperfil.id_perfil = per.id_perfil) " +
            "   OR (rel.fl_todos_unidades = false AND relunidade.id_unidade = uni.id_unidade) " +
            "   OR (rel.fl_todos_usuarios = false AND relusuario.id_usuario = usu.id) " +
            "   OR usu.hierarquia = 'ADMIN' " +
            "ORDER BY rel.nome";

    public Uni<List<RelatorioDisponivelResponse>> listarDisponiveis(String username) {
        if (username == null || username.isBlank()) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO)
                        .setParameter(1, username)
                        .getSingleResultOrNull())
                .onItem().transformToUni(usuarioId -> {
                    if (usuarioId == null) {
                        return Uni.createFrom().item(List.of());
                    }
                    Long id = ((Number) usuarioId).longValue();
                    return consultar(SQL_TABELA, id, "TABELA")
                            .chain(tabelas -> consultar(SQL_GRAFICO, id, "GRAFICO").map(graficos -> {
                                List<RelatorioDisponivelResponse> todos = new ArrayList<>(tabelas);
                                todos.addAll(graficos);
                                return todos;
                            }))
                            .chain(todos -> consultar(SQL_MAPA, id, "MAPA").map(mapas -> {
                                todos.addAll(mapas);
                                todos.sort(Comparator.comparing(RelatorioDisponivelResponse::nome,
                                        Comparator.nullsLast(String::compareTo)));
                                return todos;
                            }));
                });
    }

    public Uni<PagedResponse<RelatorioDisponivelResponse>> listarDisponiveisPaged(String username, int page, int size, String busca) {
        if (username == null || username.isBlank()) {
            return Uni.createFrom().item(new PagedResponse<>(List.of(), 0, page, size));
        }
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        String filtro = (busca == null || busca.isBlank()) ? null : busca.trim().toLowerCase();
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO)
                        .setParameter(1, username)
                        .getSingleResultOrNull())
                .onItem().transformToUni(usuarioId -> {
                    if (usuarioId == null) {
                        return Uni.createFrom().item(new PagedResponse<>(List.of(), 0, p, s));
                    }
                    Long id = ((Number) usuarioId).longValue();
                    return consultar(SQL_TABELA, id, "TABELA")
                            .chain(tabelas -> consultar(SQL_GRAFICO, id, "GRAFICO").map(graficos -> {
                                List<RelatorioDisponivelResponse> todos = new ArrayList<>(tabelas);
                                todos.addAll(graficos);
                                return todos;
                            }))
                            .chain(todos -> consultar(SQL_MAPA, id, "MAPA").map(mapas -> {
                                todos.addAll(mapas);
                                todos.sort(Comparator.comparing(RelatorioDisponivelResponse::nome,
                                        Comparator.nullsLast(String::compareTo)));
                                return todos;
                            }))
                            .map(todos -> {
                                List<RelatorioDisponivelResponse> filtrados = filtro == null
                                        ? todos
                                        : todos.stream()
                                                .filter(r -> r.nome() != null && r.nome().toLowerCase().contains(filtro))
                                                .toList();
                                long total = filtrados.size();
                                int from = Math.min(p * s, filtrados.size());
                                int to = Math.min(from + s, filtrados.size());
                                List<RelatorioDisponivelResponse> pageContent = filtrados.subList(from, to);
                                return new PagedResponse<>(pageContent, total, p, s);
                            });
                });
    }

    /**
     * Confere a mesma regra usada pelo menu antes de abrir o relatório. Isso evita
     * que um usuário contorne o filtro do botão acessando uma URL com outro id.
     */
    public Uni<Boolean> podeAcessar(String username, String tipo, Long relatorioId) {
        if (username == null || username.isBlank() || relatorioId == null) {
            return Uni.createFrom().item(false);
        }
        String sql = switch (tipo == null ? "" : tipo.toUpperCase()) {
            case "TABELA" -> SQL_TABELA;
            case "GRAFICO" -> SQL_GRAFICO;
            case "MAPA" -> SQL_MAPA;
            default -> null;
        };
        if (sql == null) return Uni.createFrom().item(false);

        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO)
                        .setParameter(1, username)
                        .getSingleResultOrNull())
                .onItem().transformToUni(usuarioId -> {
                    if (usuarioId == null) return Uni.createFrom().item(false);
                    return consultar(sql, ((Number) usuarioId).longValue(), tipo.toUpperCase())
                            .map(relatorios -> relatorios.stream().anyMatch(relatorio -> relatorio.id().equals(relatorioId)));
                });
    }

    private Uni<List<RelatorioDisponivelResponse>> consultar(String sql, Long usuarioId, String tipo) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, usuarioId)
                        .getResultList())
                .map(linhas -> linhas.stream()
                        .map(linha -> (Object[]) linha)
                        .map(linha -> new RelatorioDisponivelResponse(
                                ((Number) linha[0]).longValue(),
                                linha[1] == null ? "" : linha[1].toString(),
                                tipo))
                        .toList());
    }
}
