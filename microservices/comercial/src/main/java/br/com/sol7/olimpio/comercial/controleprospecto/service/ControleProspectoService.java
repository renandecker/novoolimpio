package br.com.sol7.olimpio.comercial.controleprospecto;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ControleProspectoService {
    @Inject
    ControleProspectoRepository repository;

    @Inject
    br.com.sol7.olimpio.comercial.campo.CampoRepository campoRepository;

    public Uni<List<ControleProspectoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<ControleProspectoResponse>> list(Long campoId) {
        if (campoId == null) {
            return list();
        }
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ControleProspectoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ControleProspectoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ControleProspecto not found")).map(this::toResponse);
    }

    public Uni<ControleProspectoResponse> create(ControleProspectoRequest r) {
        var e = new ControleProspecto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ControleProspectoResponse> update(Long id, ControleProspectoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ControleProspecto not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("ControleProspecto not found")));
    }

    private void apply(ControleProspecto e, ControleProspectoRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private ControleProspectoResponse toResponse(ControleProspecto e) {
        return new ControleProspectoResponse(e.id, e.nome, e.dadosJson);
    }

    /**
     * Lista os prospectos de um campo agrupados, espelhando a query do
     * ControleProspectoLazyModel (lazy/comercial/ControleProspectoLazyModel.java:71).
     * Cada registro contem id, nome, valor e o texto "outro" que lista os prospectos
     * que possuem o mesmo valor para o mesmo campo.
     */
    public Uni<List<ControleProspectoWapperResponse>> listarPorCampo(Long campoId, int page, int size, String sortField, String sortOrder, String filtroNome, String filtroId, String filtroValor) {
        if (campoId == null) {
            return Uni.createFrom().item(List.of());
        }
        int p = Math.max(0, page);
        int s = size <= 0 ? 10 : size;

        StringBuilder filter = new StringBuilder();
        if (filtroNome != null && !filtroNome.isBlank()) {
            filter.append(" and p.nome LIKE '%").append(filtroNome.replace("'", "''")).append("%'");
        }
        if (filtroId != null && !filtroId.isBlank()) {
            filter.append(" and CAST(p.id AS text) LIKE '%").append(filtroId.replace("'", "''")).append("%'");
        }
        if (filtroValor != null && !filtroValor.isBlank()) {
            filter.append(" and pc.valor LIKE '%").append(filtroValor.replace("'", "''")).append("%'");
        }

        String order;
        if (sortField != null && !sortField.isBlank()) {
            String dir = "DESC".equalsIgnoreCase(sortOrder) ? "desc" : "asc";
            order = " order by " + sortField + " " + dir + " limit " + s + " offset " + p;
        } else {
            order = " order by p.id desc limit " + s + " offset " + p;
        }

        String sql =
                "select p.id as id, p.nome as nome, pc.valor as valor, " +
                " array_to_string(array(select p2.id || ' - ' || p2.nome || ' : ' || pc2.valor " +
                "   from com_prospecto_campo pc2 inner join com_prospecto p2 on (pc2.id_prospecto = p2.id) " +
                "   where pc.id_campo = pc2.id_campo and pc.id_prospecto <> pc2.id_prospecto and pc2.valor = pc.valor " +
                "   order by p2.nome), '  </br> ') as outro " +
                " from com_prospecto p inner join com_prospecto_campo pc on (pc.id_prospecto = p.id) " +
                " where pc.id_campo = " + campoId + filter + order;

        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .getResultList()
                        .map(SQLHelper::rowsToWapper));
    }

    /**
     * Conta quantos prospectos um campo possui (equivalente ao count do LazyModel).
     */
    private Uni<Long> countPorCampo(Long campoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("select count(pc.id) from com_prospecto_campo pc where pc.id_campo = " + campoId)
                        .getSingleResult()
                        .map(o -> o == null ? 0L : ((Number) o).longValue()));
    }

    public Uni<PagedResponse<ControleProspectoWapperResponse>> pagedPorCampo(Long campoId, int page, int size, String sortField, String sortOrder, String filtroNome, String filtroId, String filtroValor) {
        if (campoId == null) {
            return Uni.createFrom().item(new PagedResponse<>(List.of(), 0L, page, size));
        }
        return listarPorCampo(campoId, page, size, sortField, sortOrder, filtroNome, filtroId, filtroValor)
                .onItem().transformToUni(items -> countPorCampo(campoId)
                        .map(count -> new PagedResponse<>(items, count, page, size)));
    }

    /**
     * Migrado de ControleProspectoController.carregarProspectoParaVisualizacao
     * (control/controllers/comercial/ControleProspectoController.java:139)
     * Retorna os campos do prospecto agrupados por categoria para exibicao em detalhe.
     * Cada elemento: {rotulo, valor, tipo, categoria}
     */
    public Uni<List<ProspectoDetalheResponse>> carregarProspectoParaVisualizacao(Integer id) {
        if (id == null) {
            return Uni.createFrom().item(List.of());
        }
        String sql =
                "select c.id as campo_id, c.rotulo as rotulo, c.tipo as tipo, cat.descricao as categoria, " +
                " pc.valor as valor " +
                " from com_prospecto p " +
                " inner join com_prospecto_campo pc on (pc.id_prospecto = p.id) " +
                " inner join com_campo c on (c.id = pc.id_campo) " +
                " left join com_categoria cat on (cat.id = c.id_categoria) " +
                " where p.id = " + id + " order by cat.id, c.rotulo";

        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .getResultList()
                        .map(SQLHelper::rowsToDetalhe));
    }

    public Uni<List<ProspectoDetalheResponse>> carregarProspectoParaVisualizacao2(String id) {
        Integer i = null;
        if (id != null) {
            try {
                i = Integer.valueOf(id);
            } catch (NumberFormatException ignored) {
            }
        }
        return carregarProspectoParaVisualizacao(i);
    }

    /**
     * Migrado de ControleProspectoController.carregarOutrosProspecto
     * (control/controllers/comercial/ControleProspectoController.java:151)
     * Busca outros prospectos com o mesmo valor no mesmo campo.
     */
    public Uni<List<ProspectoSimplesResponse>> carregarOutrosProspecto(String id, String valor) {
        Integer idInt = null;
        if (id != null) {
            try {
                idInt = Integer.valueOf(id);
            } catch (NumberFormatException ignored) {
            }
        }
        if (idInt == null) {
            return Uni.createFrom().item(List.of());
        }
        String sql =
                "select p.id, p.nome, p.id_unidade, un.sucinto as unidade_sucinto, " +
                " (select pc2.valor from com_prospecto_campo pc2 where pc2.id_prospecto = p.id and pc2.id_campo = " +
                "   (select pc.id_campo from com_prospecto_campo pc where pc.id_prospecto = " + idInt + " limit 1)) as valor " +
                " from com_prospecto p " +
                " left join bas_unidade un on (un.id = p.id_unidade) " +
                " where p.ativo = true and p.id <> " + idInt + " " +
                " and exists (select 1 from com_prospecto_campo pc where pc.id_prospecto = p.id and pc.valor = :valor " +
                "   and pc.id_campo = (select pc2.id_campo from com_prospecto_campo pc2 where pc2.id_prospecto = " + idInt + " limit 1)) " +
                " order by p.nome";

        String finalValor = valor == null ? "" : valor;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("valor", finalValor)
                        .getResultList()
                        .map(SQLHelper::rowsToSimples));
    }

    /**
     * Migrado de ControleProspectoController.salvar (..:98)
     * Ajusta um prospecto: atualiza referencias em com_pacote_prospecto e cen_ordem_ligacao
     * e remove o prospecto da tabela com_prospecto.
     */
    public Uni<Void> salvar(Long id, String outro) {
        if (id == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("id é obrigatório"));
        }
        // Monta a lista de ids contido em "outro" (mesma heuristica do legado:
        // pega os tokens separados por espaco ate encontrar o primeiro '-')
        StringBuilder prospectos = new StringBuilder("(");
        if (outro != null) {
            String[] words = outro.trim().split(" ");
            for (String w : words) {
                if (!"-".equals(w)) {
                    prospectos.append(w).append(" ");
                } else {
                    prospectos.append(w).append(", ");
                    break;
                }
            }
        }
        prospectos.append(")");
        String in = prospectos.toString();

        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session -> {
            // 1. Atualiza pacote_prospecto
            Uni<Integer> u1 = session.createNativeQuery(
                    "UPDATE com_pacote_prospecto ccc SET id_prospecto = " + id +
                    " WHERE id_prospecto in (" + in + ") " +
                    " AND NOT EXISTS(select pp.id_prospecto from com_pacote_prospecto pp " +
                    "   where pp.id_prospecto = ccc.id_prospecto and ccc.id_pacote = pp.id_pacote)").executeUpdate();

            // 2. Remove pacote_prospecto do id (o legado usa "where id_prospecto" + id sem espaco)
            Uni<Integer> u2 = session.createNativeQuery(
                    "DELETE FROM com_pacote_prospecto where id_prospecto = " + id).executeUpdate();

            // 3. Atualiza cen_ordem_ligacao
            Uni<Integer> u3 = session.createNativeQuery(
                    "UPDATE cen_ordem_ligacao ccc SET id_prospecto = " + id +
                    " WHERE id_prospecto in (" + in + ")").executeUpdate();

            // 4. Remove o prospecto
            Uni<Integer> u4 = session.createNativeQuery("DELETE FROM com_prospecto where id = " + id).executeUpdate();

            return u1.flatMap(v -> u2).flatMap(v -> u3).flatMap(v -> u4).replaceWithVoid();
        });
    }

    /**
     * Migrado de ControleProspectoController.salvarSelecionados (..:156)
     * Ajusta um prospecto, atualizando os prospectos selecionados.
     */
    public Uni<Void> salvarSelecionados(Long id, List<Long> selectedIds) {
        if (id == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("id é obrigatório"));
        }
        if (selectedIds == null || selectedIds.isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        StringBuilder b = new StringBuilder("(");
        for (int i = 0; i < selectedIds.size(); i++) {
            if (i > 0) b.append(",");
            b.append(selectedIds.get(i));
        }
        b.append(")");
        String in = b.toString();

        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session -> {
            Uni<Integer> u1 = session.createNativeQuery(
                    "UPDATE com_pacote_prospecto ccc SET id_prospecto = " + id +
                    " WHERE id_prospecto in (" + in + ") " +
                    " AND NOT EXISTS(select pp.id_prospecto from com_pacote_prospecto pp " +
                    "   where pp.id_prospecto = ccc.id_prospecto and ccc.id_pacote = pp.id_pacote)").executeUpdate();

            Uni<Integer> u2 = session.createNativeQuery(
                    "DELETE FROM com_pacote_prospecto where id_prospecto = " + id).executeUpdate();

            Uni<Integer> u3 = session.createNativeQuery(
                    "UPDATE cen_ordem_ligacao ccc SET id_prospecto = " + id +
                    " WHERE id_prospecto in (" + in + ")").executeUpdate();

            Uni<Integer> u4 = session.createNativeQuery("DELETE FROM com_prospecto where id = " + id).executeUpdate();

            return u1.flatMap(v -> u2).flatMap(v -> u3).flatMap(v -> u4).replaceWithVoid();
        });
    }
}
