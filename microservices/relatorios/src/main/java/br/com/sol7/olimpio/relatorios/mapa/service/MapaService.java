package br.com.sol7.olimpio.relatorios.mapa.service;
import br.com.sol7.olimpio.relatorios.dimensao.entity.Dimensao;
import br.com.sol7.olimpio.relatorios.estrutura.entity.Estrutura;
import br.com.sol7.olimpio.relatorios.georeferencia.entity.Georeferencia;
import br.com.sol7.olimpio.relatorios.mapa.controller.MapaController;
import br.com.sol7.olimpio.relatorios.medida.entity.Medida;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.relatorios.dimensao.service.DimensaoService;
import br.com.sol7.olimpio.relatorios.estrutura.service.EstruturaService;
import br.com.sol7.olimpio.relatorios.estruturacoluna.service.EstruturaColunaService;
import br.com.sol7.olimpio.relatorios.georeferencia.service.GeoreferenciaService;
import br.com.sol7.olimpio.relatorios.medida.service.MedidaService;
import br.com.sol7.olimpio.relatorios.mapa.repository.MapaRepository;
import br.com.sol7.olimpio.relatorios.mapa.repository.MapaRegraRepository;
import br.com.sol7.olimpio.relatorios.mapa.entity.Mapa;
import br.com.sol7.olimpio.relatorios.mapa.entity.MapaRegra;
import br.com.sol7.olimpio.relatorios.mapa.dto.MapaRequest;
import br.com.sol7.olimpio.relatorios.mapa.dto.MapaResponse;
import br.com.sol7.olimpio.relatorios.mapa.dto.MapaRegraResponse;
import br.com.sol7.olimpio.relatorios.mapa.dto.MapaRegraRequest;
import br.com.sol7.olimpio.relatorios.mapa.dto.MapaPontosResponse;
import br.com.sol7.olimpio.relatorios.mapa.dto.Marcador;
import br.com.sol7.olimpio.relatorios.mapa.dto.RegraPontos;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.infrastructure.Infrastructure;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

@ApplicationScoped
@WithTransaction
public class MapaService {

    @Inject
    MapaRepository repository;

    @Inject
    DimensaoService dimensaoService;

    @Inject
    MedidaService medidaService;

    @Inject
    GeoreferenciaService georeferenciaService;

    @Inject
    EstruturaColunaService estruturaColunaService;

    @Inject
    EstruturaService estruturaService;

    public Uni<List<MapaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MapaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MapaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mapa not found"))
                .map(this::toResponse);
    }

    public Uni<MapaResponse> create(MapaRequest r) {
        var e = new Mapa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MapaResponse> update(Long id, MapaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mapa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Mapa not found")));
    }

    private void apply(Mapa e, MapaRequest r) {
        e.nome = r.nome();
        e.todosUnidades = r.todosUnidades();
        e.todosPerfis = r.todosPerfis();
        e.todosUsuarios = r.todosUsuarios();
        e.zoom = r.zoom();
        e.coordenada = r.coordenada();
        e.utilizando = r.utilizando();
        e.altura = r.altura();
        e.markerTamanho = r.markerTamanho();
        e.dataAlteracao = r.dataAlteracao();
        e.georeferenciaId = r.georeferenciaId();
        e.dimensaoId = r.dimensaoId();
        e.medidaId = r.medidaId();
        e.estruturaId = r.estruturaId();
    }

    private MapaResponse toResponse(Mapa e) {
        return new MapaResponse(e.id, e.nome, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.zoom, e.coordenada, e.utilizando, e.altura, e.markerTamanho, e.dataAlteracao, e.georeferenciaId, e.dimensaoId, e.medidaId, e.estruturaId);
    }


    // Migrado de MapaController.autoCompleteMedida (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:135, camada controller)
    // Logica original (adaptar):
    // public List<Medida> autoCompleteMedida(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return medidaService.autoCompleteMedida(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteMedida(String query, Long estruturaId) {
        if (estruturaId != null) {
            return medidaService.list()
                    .map(list -> list.stream()
                            .filter(m -> m.estruturaId() != null && m.estruturaId().equals(estruturaId))
                            .filter(m -> m.nomeVisualizacao() != null && m.nomeVisualizacao().toLowerCase().contains(query.toLowerCase()))
                            .map(m -> m.id())
                            .toList());
        }
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaController.autoCompleteGeoreferencia (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:142, camada controller)
    // Logica original (adaptar):
    // public List<Georeferencia> autoCompleteGeoreferencia(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return georeferenciaService.autoCompleteGeoreferencia(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteGeoreferencia(String query, Long estruturaId) {
        if (estruturaId != null) {
            return georeferenciaService.list()
                    .map(list -> list.stream()
                            .filter(g -> g.estruturaId() != null && g.estruturaId().equals(estruturaId))
                            .filter(g -> g.nomeVisualizacao() != null && g.nomeVisualizacao().toLowerCase().contains(query.toLowerCase()))
                            .map(g -> g.id())
                            .toList());
        }
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaController.autoCompleteDimensao (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/MapaController.java:149, camada controller)
    // Logica original (adaptar):
    // public List<Dimensao> autoCompleteDimensao(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return dimensaoService.autoCompleteDimensao(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteDimensao(String query, Long estruturaId) {
        if (estruturaId != null) {
            return dimensaoService.list()
                    .map(list -> list.stream()
                            .filter(d -> d.estruturaId() != null && d.estruturaId().equals(estruturaId))
                            .filter(d -> d.nomeVisualizacao() != null && d.nomeVisualizacao().toLowerCase().contains(query.toLowerCase()))
                            .map(d -> d.id())
                            .toList());
        }
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarMapsPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:33, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Mapa> buscarMapsPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarMapsPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarMapsPeloFato(Long fatoId) {
        return repository.buscarMapsPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MapaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:37, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Mapa id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:41, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Mapa id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MapaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/MapaService.java:45, camada service)
    // Observacao: parametro id: era Mapa (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Mapa id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // public List<Mapa> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    @Inject
    MapaRegraService mapaRegraService;

    // Coordinate regex pattern from legacy code
    private static final String COORDENADA_REGEX = "(?<!\\\\d)([-+]?(?:[1-8]?\\\\d(?:\\\\.\\\\d+)?|90(?:\\\\.0+)?)),\\\\s*([-+]?(?:180(?:\\\\.0+)?|(?:(?:1[0-7]\\\\d)|(?:[1-9]?\\\\d))(?:\\\\.\\\\d+)?))(?!\\\\d)";
    private static final Pattern COORDENADA_PATTERN = Pattern.compile(COORDENADA_REGEX);

    public Uni<MapaPontosResponse> buscarPontos(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mapa not found"))
                .onItem().transformToUni(mapa -> mapaRegraService.findByMapaId(id)
                        .onItem().transformToUni(regras -> buildMapaPontosResponse(mapa, regras)));
    }

    private Uni<MapaPontosResponse> buildMapaPontosResponse(Mapa mapa, List<MapaRegraResponse> regras) {
        List<Uni<RegraPontos>> regraPontosUnis = new ArrayList<>();

        // Parse center coordinates from mapa.coordenada
        String[] centroCoords = mapa.coordenada != null ? mapa.coordenada.split(",") : new String[0];
        String latCentro = centroCoords.length > 0 ? centroCoords[0].trim() : "0";
        String lngCentro = centroCoords.length > 1 ? centroCoords[1].trim() : "0";

        // For each regra, create RegraPontos with actual markers from SQL execution
        for (MapaRegraResponse regra : regras) {
            if (Boolean.TRUE.equals(regra.ativo())) {
                regraPontosUnis.add(executarConsultaMarcadores(mapa, regra)
                        .map(marcadores -> new RegraPontos(
                                regra.id(),
                                regra.descricao(),
                                regra.cor() != null ? "#" + regra.cor() : "#ff0000",
                                regra.markerTamanho() != null ? regra.markerTamanho() : (mapa.markerTamanho != null ? mapa.markerTamanho : 10),
                                marcadores
                        )));
            } else {
                // Return empty RegraPontos for inactive regras
                regraPontosUnis.add(Uni.createFrom().item(new RegraPontos(
                        regra.id(),
                        regra.descricao(),
                        regra.cor() != null ? "#" + regra.cor() : "#ff0000",
                        regra.markerTamanho() != null ? regra.markerTamanho() : (mapa.markerTamanho != null ? mapa.markerTamanho : 10),
                        new ArrayList<>()
                )));
            }
        }

        return Uni.combine().all().unis(regraPontosUnis).combinedWith(regraPontosList -> new MapaPontosResponse(
                        latCentro + "," + lngCentro,
                        mapa.zoom,
                        mapa.altura,
                        mapa.markerTamanho,
                        (List<RegraPontos>) regraPontosList
                ));
    }

    private Uni<List<Marcador>> executarConsultaMarcadores(Mapa mapa, MapaRegraResponse regra) {
        return medidaService.find(regra.medidaId())
                .onItem().transform(m -> m.estruturaColunaId())
                .onItem().transformToUni(id -> estruturaColunaService.find(id))
                .onItem().transform(e -> e.coluna())
                .chain(medidaColuna -> {
                    Uni<String> medidaMetaColunaUni = Uni.createFrom().item((String) null);
                    if (regra.medidaMetaId() != null) {
                        medidaMetaColunaUni = medidaService.find(regra.medidaMetaId())
                                .onItem().transform(m -> m.estruturaColunaId())
                                .onItem().transformToUni(id -> estruturaColunaService.find(id))
                                .onItem().transform(e -> e.coluna());
                    }

                    Uni<String> medidaMetaDoisColunaUni = Uni.createFrom().item((String) null);
                    if (regra.medidaMetaDoisId() != null) {
                        medidaMetaDoisColunaUni = medidaService.find(regra.medidaMetaDoisId())
                                .onItem().transform(m -> m.estruturaColunaId())
                                .onItem().transformToUni(id -> estruturaColunaService.find(id))
                                .onItem().transform(e -> e.coluna());
                    }

                    Uni<String> georeferenciaColunaUni = georeferenciaService.find(mapa.georeferenciaId)
                            .onItem().transform(g -> g.estruturaColunaId())
                            .onItem().transformToUni(id -> estruturaColunaService.find(id))
                            .onItem().transform(e -> e.coluna());

                    Uni<String> estruturaTabelaUni = estruturaService.find(mapa.estruturaId)
                            .onItem().transform(e -> e.tabela());
                    Uni<String> estruturaCondicaoUni = estruturaService.find(mapa.estruturaId)
                            .onItem().transform(e -> e.condicao());

                    Uni<String> dimensaoColunaUni = Uni.createFrom().item((String) null);
                    if (mapa.dimensaoId != null) {
                        dimensaoColunaUni = dimensaoService.find(mapa.dimensaoId)
                                .onItem().transform(d -> d.estruturaColunaId())
                                .onItem().transformToUni(id -> estruturaColunaService.find(id))
                                .onItem().transform(e -> e.coluna());
                    }

                    return Uni.combine().all().unis(
                            Uni.createFrom().item(medidaColuna),
                            medidaMetaColunaUni,
                            medidaMetaDoisColunaUni,
                            georeferenciaColunaUni,
                            estruturaTabelaUni,
                            estruturaCondicaoUni,
                            dimensaoColunaUni
                    ).asTuple()
                    .onItem().transformToUni(tuple -> {
                        String mColuna = semAlias(tuple.getItem1());
                        String mMetaColuna = semAlias(tuple.getItem2());
                        String mMetaDoisColuna = semAlias(tuple.getItem3());
                        String geoColuna = semAlias(tuple.getItem4());
                        String estTabela = tuple.getItem5();
                        String estCondicao = tuple.getItem6();
                        String dimColuna = semAlias(tuple.getItem7());

                        if (mColuna == null || geoColuna == null || estTabela == null) {
                            return Uni.createFrom().item(new ArrayList<Marcador>());
                        }

                        String medidaCondicao = buildMedidaCondicao(regra, mColuna, mMetaColuna, mMetaDoisColuna);
                        String colunasSelect;
                        String groupBy;

                        if (dimColuna == null || dimColuna.isBlank()) {
                            colunasSelect = "sum(" + mColuna + ")";
                            groupBy = "group by 1";
                        } else {
                            colunasSelect = dimColuna + ", sum(" + mColuna + ")";
                            groupBy = "group by 1,2";
                        }

                        String whereClause;
                        if (estCondicao != null && !estCondicao.isBlank()) {
                            whereClause = " " + estCondicao + " and " + medidaCondicao;
                        } else {
                            whereClause = " where " + medidaCondicao;
                        }

                        String sql = "select distinct " + geoColuna + ", " + colunasSelect +
                                " " + estTabela + whereClause + " " + groupBy + " limit 1000";

                        return Panache.getSession().chain(session ->
                                session.createNativeQuery(sql)
                                        .setMaxResults(1000)
                                        .getResultList()
                                        .onItem().transformToUni(list -> {
                                            List<Marcador> marcadores = new ArrayList<>();
                                            for (Object row : list) {
                                                Object[] rowData = (Object[]) row;
                                                String coordenada = rowData.length > 0 ? rowData[0].toString() : null;
                                                String dimensaoValor = rowData.length > 1 ? rowData[1].toString() : null;

                                                if (coordenada != null && COORDENADA_PATTERN.matcher(coordenada).matches()) {
                                                    String[] coords = coordenada.split(",");
                                                    String latitude = coords.length > 0 ? coords[0].trim() : "0";
                                                    String longitude = coords.length > 1 ? coords[1].trim() : "0";

                                                    String valorFormatado;
                                                    if (dimensaoValor != null && !dimensaoValor.isBlank()) {
                                                        try {
                                                            BigDecimal val = new BigDecimal(dimensaoValor);
                                                            valorFormatado = val.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
                                                        } catch (Exception e) {
                                                            valorFormatado = dimensaoValor;
                                                        }
                                                    } else {
                                                        valorFormatado = "0,00";
                                                    }

                                                    String popup = buildPopup(coordenada, valorFormatado, dimensaoValor != null ? dimensaoValor : null);

                                                    Marcador marcador = new Marcador(latitude, longitude, popup, valorFormatado);
                                                    marcadores.add(marcador);
                                                }
                                            }
                                            return Uni.createFrom().item(marcadores);
                                        })
                        );
                    });
                });
    }

    private String buildMedidaCondicao(MapaRegraResponse regra, String medidaColuna, String medidaMetaColuna, String medidaMetaDoisColuna) {
        String condicao = regra.condicao();
        String meta = regra.meta() != null ? regra.meta().toString() : "0";
        String meta2 = regra.meta2() != null ? regra.meta2().toString() : "0";

        // For conditions that compare with another column (medidaMeta)
        if (medidaMetaColuna != null && !medidaMetaColuna.isBlank() && (condicao.equals("EQ") || condicao.equals("NE") || condicao.equals("GT") || condicao.equals("LT") || condicao.equals("GTE") || condicao.equals("LTE"))) {
            return switch (condicao) {
                case "EQ" -> medidaColuna + " = " + medidaMetaColuna;
                case "NE" -> medidaColuna + " <> " + medidaMetaColuna;
                case "GT" -> medidaColuna + " > " + medidaMetaColuna;
                case "LT" -> medidaColuna + " < " + medidaMetaColuna;
                case "GTE" -> medidaColuna + " >= " + medidaMetaColuna;
                case "LTE" -> medidaColuna + " <= " + medidaMetaColuna;
                default -> medidaColuna + " = " + medidaMetaColuna;
            };
        }

        // For BETWEEN with two columns
        if (condicao.equals("BETWEEN") && medidaMetaColuna != null && !medidaMetaColuna.isBlank() && medidaMetaDoisColuna != null && !medidaMetaDoisColuna.isBlank()) {
            return medidaColuna + " BETWEEN " + medidaMetaColuna + " AND " + medidaMetaDoisColuna;
        }

        // For BETWEEN with values
        if (condicao.equals("BETWEEN")) {
            return medidaColuna + " BETWEEN " + meta + " AND " + meta2;
        }

        // For IN/NOT_IN with values
        if (condicao.equals("IN") || condicao.equals("NOT_IN")) {
            return medidaColuna + " " + condicao + " (" + meta + ")";
        }

        // Default: compare with value
        return switch (condicao) {
            case "EQ" -> medidaColuna + " = " + meta;
            case "NE" -> medidaColuna + " <> " + meta;
            case "GT" -> medidaColuna + " > " + meta;
            case "LT" -> medidaColuna + " < " + meta;
            case "GTE" -> medidaColuna + " >= " + meta;
            case "LTE" -> medidaColuna + " <= " + meta;
            default -> medidaColuna + " = " + meta;
        };
    }

    private String buildPopup(String coordenada, String valorFormatado, String dimensaoValor) {
        StringBuilder popup = new StringBuilder();
        if (dimensaoValor != null && !dimensaoValor.isBlank()) {
            popup.append("<b>").append(dimensaoValor.replace("'", " ").replace("\"", " ")).append("</b><br>");
        }
        popup.append(valorFormatado);
        return popup.toString();
    }

    private static String semAlias(String coluna) {
        if (coluna == null) return null;
        String c = coluna.replaceAll("[\\r\\n]", "").trim();
        int idx = c.toLowerCase().lastIndexOf(" as ");
        return idx >= 0 ? c.substring(0, idx) : c;
    }
}
