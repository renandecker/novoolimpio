package br.com.sol7.olimpio.comercial.campanha;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@ApplicationScoped
@WithTransaction
public class CampanhaService {

    @Inject
    CampanhaRepository repository;
    @Inject
    AcaoDeCampanhaRepository acaoRepository;

    public Uni<List<CampanhaResponse>> list() {
        return repository.listAll().flatMap(items -> Uni.join().all(
                items.stream().map(this::enrich).toList()
        ).andCollectFailures().map(list -> list.stream().toList()));
    }

    public Uni<PagedResponse<CampanhaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .flatMap(items -> Uni.join().all(items.stream().map(this::enrich).toList()).andCollectFailures()
                        .flatMap(enriched -> repository.count().map(count -> new PagedResponse<>(enriched, count, p, s))));
    }

    public Uni<CampanhaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campanha not found"))
                .flatMap(this::enrich);
    }

    public Uni<CampanhaResponse> findDetailed(Long id) {
        return find(id);
    }

    public Uni<CampanhaResponse> create(CampanhaRequest r) {
        validate(r, true);
        var e = new Campanha();
        apply(e, r);
        // ativo default true for new
        if (r.ativo() == false && r.descricao() != null) {
            // allow explicit but default true
            e.ativo = true;
        }
        return repository.persist(e)
                .flatMap(persisted -> persistRelations(persisted.id, r))
                .flatMap(v -> enrich(e));
    }

    public Uni<CampanhaResponse> update(Long id, CampanhaRequest r) {
        validate(r, false);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campanha not found"))
                .flatMap(e -> {
                    apply(e, r);
                    return persistRelations(id, r).replaceWith(e);
                })
                .flatMap(this::enrich);
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campanha not found"))
                .flatMap(e -> {
                    e.ativo = false;
                    return Uni.createFrom().voidItem();
                });
    }

    public Uni<Void> softDelete(Long id) {
        return delete(id);
    }

    // finaliza prioritária desta campanha
    public Uni<Map<String, Object>> finalizarPrioritaria(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Campanha not found"))
                .flatMap(c -> io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                        session.createNativeQuery(
                                "SELECT id_unidade FROM com_campanha_unidade WHERE id_campanha = :campId")
                                .setParameter("campId", id)
                                .getResultList()
                                .flatMap(unidades -> {
                                    if (unidades.isEmpty()) return Uni.createFrom().item(0);
                                    Uni<Integer> chain = Uni.createFrom().item(0);
                                    for (Object u : unidades) {
                                        Long unidadeId = ((Number) u).longValue();
                                        chain = chain.flatMap(acc -> session.createNativeQuery(
                                                "UPDATE cen_fila_prioritaria ff SET disponivel = false " +
                                                "FROM cen_fila_prioritaria f " +
                                                "INNER JOIN cen_ligacao l ON (l.id = f.id_ligacao) " +
                                                "INNER JOIN cen_ordem_ligacao ol ON (l.id_ordem_ligacao = ol.id) " +
                                                "INNER JOIN cen_operacional o ON (ol.id_operacional = o.id) " +
                                                "INNER JOIN com_pacote p ON (p.id = o.id_pacote) " +
                                                "INNER JOIN com_acao_de_campanha ac ON (ac.id = p.id_acao_de_campanha) " +
                                                "INNER JOIN com_campanha_acao_de_campanha cac ON (cac.id_acao_de_campanha = ac.id) " +
                                                "INNER JOIN com_campanha c ON (cac.id_campanha = c.id) " +
                                                "INNER JOIN com_campanha_unidade cu ON (cu.id_campanha = c.id) " +
                                                "WHERE ff.id = f.id AND f.disponivel = true AND cu.id_unidade = :unidadeId AND c.id = :campId")
                                                .setParameter("unidadeId", unidadeId)
                                                .setParameter("campId", id)
                                                .executeUpdate()
                                                .map(updated -> acc + updated));
                                    }
                                    return chain.map(total -> total);
                                })
                ).map(total -> Map.of("updated", total, "message", "Ligações prioritárias finalizadas com sucesso!")));
    }

    public Uni<Map<String, Object>> finalizarPrioritariaOutros(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Campanha not found"))
                .flatMap(c -> io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                        session.createNativeQuery(
                                "SELECT id_unidade FROM com_campanha_unidade WHERE id_campanha = :campId")
                                .setParameter("campId", id)
                                .getResultList()
                                .flatMap(unidades -> {
                                    if (unidades.isEmpty()) return Uni.createFrom().item(0);
                                    Uni<Integer> chain = Uni.createFrom().item(0);
                                    for (Object u : unidades) {
                                        Long unidadeId = ((Number) u).longValue();
                                        chain = chain.flatMap(acc -> session.createNativeQuery(
                                                "UPDATE cen_fila_prioritaria ff SET disponivel = false " +
                                                "FROM cen_fila_prioritaria f " +
                                                "INNER JOIN cen_ligacao l ON (l.id = f.id_ligacao) " +
                                                "INNER JOIN cen_ordem_ligacao ol ON (l.id_ordem_ligacao = ol.id) " +
                                                "INNER JOIN cen_operacional o ON (ol.id_operacional = o.id) " +
                                                "INNER JOIN com_pacote p ON (p.id = o.id_pacote) " +
                                                "INNER JOIN com_acao_de_campanha ac ON (ac.id = p.id_acao_de_campanha) " +
                                                "INNER JOIN com_campanha_acao_de_campanha cac ON (cac.id_acao_de_campanha = ac.id) " +
                                                "INNER JOIN com_campanha c ON (cac.id_campanha = c.id) " +
                                                "INNER JOIN com_campanha_unidade cu ON (cu.id_campanha = c.id) " +
                                                "WHERE ff.id = f.id AND f.disponivel = true AND cu.id_unidade = :unidadeId AND c.id <> :campId AND c.id < :campId")
                                                .setParameter("unidadeId", unidadeId)
                                                .setParameter("campId", id)
                                                .executeUpdate()
                                                .map(updated -> acc + updated));
                                    }
                                    return chain.map(total -> total);
                                })
                ).map(total -> Map.of("updated", total, "message", "Ligações prioritárias das outras campanhas finalizadas com sucesso!")));
    }

    public Uni<Boolean> temAcoesAtivas(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery(
                        "SELECT count(*) FROM com_acao_de_campanha ac " +
                        "INNER JOIN com_campanha_acao_de_campanha cac ON cac.id_acao_de_campanha = ac.id " +
                        "WHERE cac.id_campanha = :campId AND ac.data_final >= CURRENT_DATE")
                        .setParameter("campId", id)
                        .getSingleResult()
                        .map(r -> ((Number) r).longValue() > 0)
        );
    }

    public Uni<List<AcaoDeCampanhaResponse>> listAcoes(Long campanhaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery(
                        "SELECT ac.id, ac.id_tipo_canal, tc.descricao, ac.id_estrategia, e.descricao, ac.data_inicial, ac.data_final " +
                        "FROM com_acao_de_campanha ac " +
                        "INNER JOIN com_campanha_acao_de_campanha cac ON cac.id_acao_de_campanha = ac.id " +
                        "LEFT JOIN com_tipo_canal tc ON tc.id = ac.id_tipo_canal " +
                        "LEFT JOIN com_estrategia e ON e.id = ac.id_estrategia " +
                        "WHERE cac.id_campanha = :campId ORDER BY ac.id")
                        .setParameter("campId", campanhaId)
                        .getResultList()
                        .map(list -> {
                            List<AcaoDeCampanhaResponse> out = new ArrayList<>();
                            for (Object row : list) {
                                Object[] arr = (Object[]) row;
                                out.add(new AcaoDeCampanhaResponse(
                                        ((Number) arr[0]).longValue(),
                                        arr[1] == null ? null : ((Number) arr[1]).longValue(),
                                        arr[2] == null ? null : String.valueOf(arr[2]),
                                        arr[3] == null ? null : ((Number) arr[3]).longValue(),
                                        arr[4] == null ? null : String.valueOf(arr[4]),
                                        (Date) arr[5],
                                        (Date) arr[6]
                                ));
                            }
                            return out;
                        })
        );
    }

    public Uni<List<Map<String, Object>>> listUnidades(Long campanhaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery(
                        "SELECT u.id, u.sucinto, u.\":CNPJ\" as cnpj, u.razao_social FROM bas_unidade u " +
                        "INNER JOIN com_campanha_unidade cu ON cu.id_unidade = u.id WHERE cu.id_campanha = :campId ORDER BY u.id")
                        .setParameter("campId", campanhaId)
                        .getResultList()
                        .map(list -> {
                            List<Map<String, Object>> out = new ArrayList<>();
                            for (Object row : list) {
                                Object[] arr = (Object[]) row;
                                Map<String, Object> m = new LinkedHashMap<>();
                                m.put("id", arr[0]);
                                m.put("sucinto", arr[1]);
                                m.put("CNPJ", arr[2]);
                                m.put("razaoSocial", arr[3]);
                                out.add(m);
                            }
                            return out;
                        })
                        .onFailure().recoverWithItem(e -> List.of())
        );
    }

    private void apply(Campanha e, CampanhaRequest r) {
        e.descricao = r.descricao();
        e.meta = r.meta();
        e.ativo = r.ativo();
        if (e.ativo == false && r.ativo() == false && e.id == null) e.ativo = true;
        e.dataInicial = r.dataInicial();
    }

    private void validate(CampanhaRequest r, boolean isNew) {
        if (r.descricao() == null || r.descricao().trim().length() < 3 || r.descricao().trim().length() > 255) {
            throw new BadRequestException("Descrição deve ter entre 3 e 255 caracteres");
        }
        if (r.meta() == null) throw new BadRequestException("Meta é obrigatória");
        if (r.dataInicial() == null) throw new BadRequestException("Data inicial é obrigatória");
        if (isNew) {
            Date yesterday = Date.from(Instant.now().minus(1, ChronoUnit.DAYS));
            // compare only dates without time
            Calendar calCamp = Calendar.getInstance(); calCamp.setTime(r.dataInicial()); calCamp.set(Calendar.HOUR_OF_DAY,0); calCamp.set(Calendar.MINUTE,0); calCamp.set(Calendar.SECOND,0); calCamp.set(Calendar.MILLISECOND,0);
            Calendar calYest = Calendar.getInstance(); calYest.setTime(yesterday); calYest.set(Calendar.HOUR_OF_DAY,0); calYest.set(Calendar.MINUTE,0); calYest.set(Calendar.SECOND,0); calYest.set(Calendar.MILLISECOND,0);
            if (calCamp.before(calYest)) {
                throw new BadRequestException("A data inicial não pode ser anterior ao dia de Hoje");
            }
        }
        if (r.unidadeIds() == null || r.unidadeIds().isEmpty()) {
            throw new BadRequestException("Selecione pelo menos uma unidade");
        }
        if (r.acoes() == null || r.acoes().isEmpty()) {
            throw new BadRequestException("Selecione pelo menos um Tipo de Canal");
        }
        Set<Long> tipos = new HashSet<>();
        for (AcaoDeCampanhaRequest a : r.acoes()) {
            if (a.tipoCanalId() == null) throw new BadRequestException("TipoCanal é obrigatório");
            if (a.estrategiaId() == null) throw new BadRequestException("Estratégia é obrigatória");
            if (!tipos.add(a.tipoCanalId())) {
                throw new BadRequestException("As Ações de Marketing não podem possuir Tipos de Canais repetidos");
            }
            if (a.dataInicial() == null || a.dataFinal() == null) throw new BadRequestException("Datas da ação são obrigatórias");
            if (a.dataInicial().before(r.dataInicial())) {
                throw new BadRequestException("A Ação de Marketing deve começar após o início da Campanha");
            }
            if (a.dataFinal().before(a.dataInicial())) {
                throw new BadRequestException("A data inicial de Ação de Campanha é maior que a data final de Ação de Campanha");
            }
        }
    }

    private Uni<Void> persistRelations(Long campanhaId, CampanhaRequest r) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session -> {
            // clean existing relations
            Uni<Integer> delAcoes = session.createNativeQuery("DELETE FROM com_campanha_acao_de_campanha WHERE id_campanha = :cid")
                    .setParameter("cid", campanhaId).executeUpdate();
            Uni<Integer> delUnidades = session.createNativeQuery("DELETE FROM com_campanha_unidade WHERE id_campanha = :cid")
                    .setParameter("cid", campanhaId).executeUpdate();
            return delAcoes.flatMap(v -> delUnidades).flatMap(v -> {
                // persist acoes
                Uni<Void> chainAcoes = Uni.createFrom().voidItem();
                List<Long> acaoIds = new ArrayList<>();
                for (AcaoDeCampanhaRequest ar : r.acoes()) {
                    chainAcoes = chainAcoes.flatMap(v2 -> {
                        AcaoDeCampanha ac = new AcaoDeCampanha();
                        ac.tipoCanalId = ar.tipoCanalId();
                        ac.estrategiaId = ar.estrategiaId();
                        ac.dataInicial = ar.dataInicial();
                        ac.dataFinal = ar.dataFinal();
                        return acaoRepository.persist(ac).map(p -> { acaoIds.add(p.id); return null; });
                    });
                }
                return chainAcoes.flatMap(v2 -> {
                    Uni<Void> chainLinks = Uni.createFrom().voidItem();
                    for (Long aid : acaoIds) {
                        chainLinks = chainLinks.flatMap(x -> session.createNativeQuery(
                                "INSERT INTO com_campanha_acao_de_campanha (id_campanha, id_acao_de_campanha) VALUES (:cid, :aid)")
                                .setParameter("cid", campanhaId)
                                .setParameter("aid", aid)
                                .executeUpdate().replaceWithVoid());
                    }
                    for (Long uid : r.unidadeIds()) {
                        chainLinks = chainLinks.flatMap(x -> session.createNativeQuery(
                                "INSERT INTO com_campanha_unidade (id_campanha, id_unidade) VALUES (:cid, :uid)")
                                .setParameter("cid", campanhaId)
                                .setParameter("uid", uid)
                                .executeUpdate().replaceWithVoid());
                    }
                    return chainLinks;
                });
            });
        });
    }

    private Uni<CampanhaResponse> enrich(Campanha e) {
        return Uni.combine().all().unis(
                listUnidades(e.id).onFailure().recoverWithItem(List.of()),
                listAcoes(e.id).onFailure().recoverWithItem(List.of())
        ).asTuple().map(tuple -> {
            List<Map<String,Object>> unidades = tuple.getItem1();
            List<AcaoDeCampanhaResponse> acoes = tuple.getItem2();
            List<Long> unidadeIds = unidades.stream().map(m -> ((Number)m.get("id")).longValue()).toList();
            return new CampanhaResponse(e.id, e.descricao, e.meta, e.ativo, e.dataInicial, unidadeIds, acoes);
        });
    }

    // Legacy wrappers mantidos para compatibilidade

    // Migrado de CampanhaService.buscarCampanhaComAcoes (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:25, camada service)
    // Observacao: retorno: era Campanha (referencia por id)
    // JPQL original: select a from Campanha a left join fetch a.acoesDeCampanha where a.id = ?1
    // Logica original (adaptar):
    // public Campanha buscarCampanhaComAcoes(Integer id) {
    //         return getCampanhaRepository().buscarCampanhaComAcoes(id);
    //     }
    public Uni<Long> buscarCampanhaComAcoes(Integer id) {
        return repository.buscarCampanhaComAcoes(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CampanhaService.buscarCampanhaDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:29, camada service)
    // JPQL original: Select distinct ca from Campanha ca inner join ca.unidades un inner join un.usuarios us where us in(?1)
    // Logica original (adaptar):
    // public List<Campanha> buscarCampanhaDaUnidade() {
    //         return getCampanhaRepository().buscarCampanhaDaUnidade(usuarioLogadoController.getUsuario());
    //     }
    public Uni<List<Long>> buscarCampanhaDaUnidade() {
        // Obs: depende do contexto de usuario logado (usuario/unidades)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CampanhaService.buscarCampanhaComUnidades (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:33, camada service)
    // Observacao: retorno: era Campanha (referencia por id); parametro entityId: era Campanha (referencia por id)
    // JPQL original: Select ca from Campanha ca left join fetch ca.unidades where ca = ?1
    // Logica original (adaptar):
    // public Campanha buscarCampanhaComUnidades(Campanha entity) {
    //         return getCampanhaRepository().buscarCampanhaComUnidades(entity);
    //     }
    public Uni<Long> buscarCampanhaComUnidades(Long entityId) {
        return repository.buscarCampanhaComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}
