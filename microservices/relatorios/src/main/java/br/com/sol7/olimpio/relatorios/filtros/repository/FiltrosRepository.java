package br.com.sol7.olimpio.relatorios.filtros.repository;

import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroPermissaoItem;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroRelatorioItem;
import br.com.sol7.olimpio.relatorios.filtros.entity.Filtros;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@ApplicationScoped
public class FiltrosRepository implements PanacheRepository<Filtros> {

    public Uni<List<Filtros>> criarFiltros(List<Integer> ids) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> criarFiltrosTabela(Long tabelaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> criarFiltrosGrafico(Long graficoId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> criarFiltrosMapa(Long mapaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> criarFiltrosOrganograma(Long organogramaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosTabelaDesmarcado(Long tabelaId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosGraficoDesmarcado(Long graficoId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosMapaDesmarcado(Long mapaId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosOrganogramaDesmarcado(Long organogramaId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosTabelas() {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosTabela(Long tabelaId) {
        return findByTabela(tabelaId);
    }

    public Uni<List<Filtros>> buscarFiltrosGrafico(Long graficoId) {
        return findByGrafico(graficoId);
    }

    public Uni<List<Filtros>> buscarFiltrosMapa(Long mapaId) {
        return findByMapa(mapaId);
    }

    public Uni<List<Filtros>> buscarFiltrosOrganograma(Long organogramaId) {
        return findByOrganograma(organogramaId);
    }

    public Uni<List<Filtros>> findByTabela(Long tabelaId) {
        String sql = "SELECT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_tabela ft ON ft.id_filtro = f.id "
                + "WHERE ft.id_tabela = :tabelaId "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .setParameter("tabelaId", tabelaId)
                .getResultList());
    }

    public Uni<List<Filtros>> findByGrafico(Long graficoId) {
        String sql = "SELECT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_grafico fg ON fg.id_filtro = f.id "
                + "WHERE fg.id_grafico = :graficoId "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .setParameter("graficoId", graficoId)
                .getResultList());
    }

    public Uni<List<Filtros>> findByMapa(Long mapaId) {
        String sql = "SELECT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_mapa fm ON fm.id_filtro = f.id "
                + "WHERE fm.id_mapa = :mapaId "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .setParameter("mapaId", mapaId)
                .getResultList());
    }

    public Uni<List<Filtros>> findByOrganograma(Long organogramaId) {
        String sql = "SELECT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_organograma fo ON fo.id_filtro = f.id "
                + "WHERE fo.id_organograma = :organogramaId "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .setParameter("organogramaId", organogramaId)
                .getResultList());
    }

    public Uni<List<Filtros>> findAllForListTabela() {
        String sql = "SELECT DISTINCT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_tabela ft ON ft.id_filtro = f.id "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .getResultList());
    }

    public Uni<List<Filtros>> findAllForListGrafico() {
        String sql = "SELECT DISTINCT f.* FROM rel_filtro f "
                + "JOIN rel_filtro_grafico fg ON fg.id_filtro = f.id "
                + "ORDER BY f.nome";
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sql, Filtros.class)
                .getResultList());
    }

    public Uni<List<Filtros>> buscarFiltrosTabelaComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosGraficoComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosMapaComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosUnidadeComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosPerfilComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosUsuarioComFiltros(Long filtroRelatorioId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<String>> findInformacoes(Long filtroId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT informacao FROM rel_filtro_informacao WHERE id_filtro = :id ORDER BY id")
                .setParameter("id", filtroId)
                .getResultList())
                .map(list -> list.stream()
                        .map(o -> o == null ? null : String.valueOf(o))
                        .filter(Objects::nonNull)
                        .toList());
    }

    public Uni<List<FiltroRelatorioItem>> findTabelas(Long filtroId) {
        return join("rel_filtro_tabela", "t", "rel_tabela", "id_tabela", filtroId, "t.id", "t.nome");
    }

    public Uni<List<FiltroRelatorioItem>> findGraficos(Long filtroId) {
        return join("rel_filtro_grafico", "g", "rel_grafico", "id_grafico", filtroId, "g.id", "g.nome");
    }

    public Uni<List<FiltroRelatorioItem>> findMapas(Long filtroId) {
        return join("rel_filtro_mapa", "m", "rel_mapa", "id_mapa", filtroId, "m.id", "m.nome");
    }

    public Uni<List<FiltroRelatorioItem>> findOrganogramas(Long filtroId) {
        return join("rel_filtro_organograma", "o", "rel_organograma", "id_organograma", filtroId, "o.id", "o.nome");
    }

    public Uni<List<FiltroPermissaoItem>> findUsuarios(Long filtroId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT u.id, u.login FROM rel_filtro_usuario fu "
                        + "JOIN bas_usuario u ON u.id = fu.id_usuario "
                        + "WHERE fu.id_filtro = :id ORDER BY u.login")
                .setParameter("id", filtroId)
                .getResultList())
                .map(FiltrosRepository::toPermissaoItems);
    }

    public Uni<List<FiltroPermissaoItem>> findUnidades(Long filtroId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT u.id, COALESCE(NULLIF(u.sucinto, ''), NULLIF(u.nome_fantasia, ''), u.razao_social) "
                        + "FROM rel_filtro_unidade fu "
                        + "JOIN bas_unidade u ON u.id = fu.id_unidade "
                        + "WHERE fu.id_filtro = :id ORDER BY 2")
                .setParameter("id", filtroId)
                .getResultList())
                .map(FiltrosRepository::toPermissaoItems);
    }

    public Uni<List<FiltroPermissaoItem>> findPerfis(Long filtroId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT p.id, p.descricao FROM rel_filtro_perfil fp "
                        + "JOIN bas_perfil p ON p.id = fp.id_perfil "
                        + "WHERE fp.id_filtro = :id ORDER BY p.descricao")
                .setParameter("id", filtroId)
                .getResultList())
                .map(FiltrosRepository::toPermissaoItems);
    }

    /** Resolve uma tabela para armazenar em rel_filtro_grafico.id_tabela (coluna NOT NULL sem FK). */
    public Uni<Long> resolveTabelaIdParaGrafico(Long filtroId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT t.id FROM rel_tabela t "
                        + "LEFT JOIN rel_filtro f ON f.id = :fid "
                        + "WHERE (t.id_estrutura = f.id_estrutura OR f.id_estrutura IS NULL) "
                        + "ORDER BY t.id LIMIT 1")
                .setParameter("fid", filtroId)
                .getSingleResultOrNull())
                .map(o -> o == null ? null : ((Number) o).longValue());
    }

    public Uni<Void> replaceRelacoes(Long filtroId, List<String> informacoes, List<Long> tabelasIds,
                                     List<Long> graficosIds, List<Long> mapasIds, List<Long> organogramasIds,
                                     List<Long> usuariosIds, List<Long> unidadesIds, List<Long> perfisIds) {
        return Panache.getSession().chain(session -> {
            Uni<Integer>[] deletes = deleteQueries(session, filtroId);
            return Uni.combine().all().unis(
                            deletes[0], deletes[1], deletes[2], deletes[3], deletes[4], deletes[5], deletes[6], deletes[7])
                    .asTuple()
                    .replaceWithVoid()
                    .flatMap(v -> resolveTabelaIdParaGrafico(filtroId)
                            .flatMap(graficoTabelaId -> insertAll(session, filtroId, informacoes, tabelasIds, graficosIds,
                                    mapasIds, organogramasIds, usuariosIds, unidadesIds, perfisIds, graficoTabelaId)))
                    .replaceWithVoid();
        });
    }

    private static Uni<Integer>[] deleteQueries(Mutiny.Session session, Long filtroId) {
        return new Uni[]{
                session.createNativeQuery("DELETE FROM rel_filtro_informacao WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_tabela WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_grafico WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_mapa WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_organograma WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_usuario WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_unidade WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate(),
                session.createNativeQuery("DELETE FROM rel_filtro_perfil WHERE id_filtro = :id").setParameter("id", filtroId).executeUpdate()
        };
    }

    private static Uni<?> insertAll(Mutiny.Session session, Long filtroId, List<String> informacoes,
                                    List<Long> tabelasIds, List<Long> graficosIds, List<Long> mapasIds,
                                    List<Long> organogramasIds, List<Long> usuariosIds, List<Long> unidadesIds,
                                    List<Long> perfisIds, Long graficoTabelaId) {
        Uni<?> chain = Uni.createFrom().voidItem();
        for (String info : nullSafeStrings(informacoes)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_informacao (informacao, id_filtro) VALUES (:info, :id)")
                    .setParameter("info", info)
                    .setParameter("id", filtroId)
                    .executeUpdate()
                    .replaceWithVoid());
        }
        for (Long id : nullSafe(tabelasIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_tabela (id_tabela, id_filtro) VALUES (:rid, :id)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(graficosIds)) {
            final long tabelaId = graficoTabelaId == null ? 0L : graficoTabelaId;
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_grafico (id_grafico, id_filtro, id_tabela) VALUES (:rid, :id, :tid)")
                    .setParameter("rid", id).setParameter("id", filtroId).setParameter("tid", tabelaId)
                    .executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(mapasIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_mapa (id_mapa, id_filtro) VALUES (:rid, :id)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(organogramasIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_organograma (id_organograma, id_filtro) VALUES (:rid, :id)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(usuariosIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_usuario (id_usuario, id_filtro) VALUES (:rid, :id)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(unidadesIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_unidade (id_filtro, id_unidade) VALUES (:id, :rid)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        for (Long id : nullSafe(perfisIds)) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_perfil (id_filtro, id_perfil) VALUES (:id, :rid)")
                    .setParameter("rid", id).setParameter("id", filtroId).executeUpdate().replaceWithVoid());
        }
        return chain;
    }

    private static List<Long> nullSafe(List<Long> list) {
        return list == null ? List.of() : list;
    }

    private static List<String> nullSafeStrings(List<String> list) {
        return list == null ? List.of() : list;
    }

    private static Uni<List<FiltroRelatorioItem>> join(String joinTable, String joinedAlias, String targetTable,
                                                       String joinColumn, Long filtroId,
                                                       String idSql, String nomeSql) {
        String sql = "SELECT " + idSql + ", " + nomeSql + " FROM " + joinTable + " ft "
                + "JOIN " + targetTable + " " + joinedAlias + " ON " + joinedAlias + ".id = ft." + joinColumn
                + " WHERE ft.id_filtro = :id ORDER BY " + nomeSql;
        return Panache.getSession().chain(session -> session.createNativeQuery(sql).setParameter("id", filtroId).getResultList())
                .map(FiltrosRepository::toRelatorioItems);
    }

    private static List<FiltroRelatorioItem> toRelatorioItems(List<?> rows) {
        List<FiltroRelatorioItem> out = new ArrayList<>();
        for (Object row : rows) {
            Object[] arr = (Object[]) row;
            if (arr == null || arr.length < 2) continue;
            Object id = arr[0];
            Object nome = arr[1];
            out.add(new FiltroRelatorioItem(id == null ? null : ((Number) id).longValue(),
                    nome == null ? null : String.valueOf(nome)));
        }
        return out;
    }

    private static List<FiltroPermissaoItem> toPermissaoItems(List<?> rows) {
        List<FiltroPermissaoItem> out = new ArrayList<>();
        for (Object row : rows) {
            Object[] arr = (Object[]) row;
            if (arr == null || arr.length < 2) continue;
            Object id = arr[0];
            Object label = arr[1];
            out.add(new FiltroPermissaoItem(id == null ? null : ((Number) id).longValue(),
                    label == null ? null : String.valueOf(label)));
        }
        return out;
    }
}