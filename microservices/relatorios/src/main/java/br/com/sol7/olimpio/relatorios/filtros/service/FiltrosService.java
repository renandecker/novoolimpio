package br.com.sol7.olimpio.relatorios.filtros.service;
import br.com.sol7.olimpio.relatorios.dimensao.entity.Dimensao;
import br.com.sol7.olimpio.relatorios.estrutura.entity.Estrutura;
import br.com.sol7.olimpio.relatorios.filtros.controller.FiltrosController;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroPermissaoItem;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroRelatorioItem;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroRelatorioWrapperDTO;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesResponse;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosResponse;
import br.com.sol7.olimpio.relatorios.filtros.entity.Filtros;
import br.com.sol7.olimpio.relatorios.filtros.repository.FiltrosRepository;
import br.com.sol7.olimpio.relatorios.grafico.entity.Grafico;
import br.com.sol7.olimpio.relatorios.mapa.entity.Mapa;
import br.com.sol7.olimpio.relatorios.organograma.entity.Organograma;
import br.com.sol7.olimpio.relatorios.tabela.entity.Tabela;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class FiltrosService {

    @Inject
    FiltrosRepository repository;

    public Uni<List<FiltrosResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FiltrosResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<FiltrosRelacoesResponse> relacoes(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Filtros not found"))
                .replaceWith(Uni.combine().all().unis(
                        repository.findInformacoes(id),
                        repository.findTabelas(id),
                        repository.findGraficos(id),
                        repository.findMapas(id),
                        repository.findOrganogramas(id),
                        repository.findUsuarios(id),
                        repository.findUnidades(id),
                        repository.findPerfis(id))
                        .asTuple()
                        .map(t -> new FiltrosRelacoesResponse(
                                (List<String>) t.getItem1(),
                                (List<FiltroRelatorioItem>) t.getItem2(),
                                (List<FiltroRelatorioItem>) t.getItem3(),
                                (List<FiltroRelatorioItem>) t.getItem4(),
                                (List<FiltroRelatorioItem>) t.getItem5(),
                                (List<FiltroPermissaoItem>) t.getItem6(),
                                (List<FiltroPermissaoItem>) t.getItem7(),
                                (List<FiltroPermissaoItem>) t.getItem8())));
    }

    public Uni<Void> replaceRelacoes(Long id, FiltrosRelacoesRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Filtros not found"))
                .flatMap(f -> repository.replaceRelacoes(id, r.informacoes(), r.tabelasIds(), r.graficosIds(),
                        r.mapasIds(), r.organogramasIds(), r.usuariosIds(), r.unidadesIds(), r.perfisIds()));
    }

    public Uni<FiltrosResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Filtros not found")).map(this::toResponse);
    }

    public Uni<FiltrosResponse> create(FiltrosRequest r) {
        var e = new Filtros();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FiltrosResponse> update(Long id, FiltrosRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Filtros not found"))
                .invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Filtros not found")));
    }

    private void apply(Filtros e, FiltrosRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private FiltrosResponse toResponse(Filtros e) {
        return new FiltrosResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<List<Long>> criarFiltros(List<Integer> ids) {
        return repository.criarFiltros(ids).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> criarFiltrosTabela(Long tabelaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return repository.criarFiltrosTabela(tabelaId, estruturaId, usuarioId, perfils, unidades, hierarquia)
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> criarFiltrosGrafico(Long graficoId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return repository.criarFiltrosGrafico(graficoId, estruturaId, usuarioId, perfils, unidades, hierarquia)
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> criarFiltrosMapa(Long mapaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return repository.criarFiltrosMapa(mapaId, estruturaId, usuarioId, perfils, unidades, hierarquia)
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> criarFiltrosOrganograma(Long organogramaId, Long estruturaId, Long usuarioId, List<Long> perfils, List<Long> unidades, String hierarquia) {
        return repository.criarFiltrosOrganograma(organogramaId, estruturaId, usuarioId, perfils, unidades, hierarquia)
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosTabelaDesmarcado(Long tabelaId) {
        return repository.buscarFiltrosTabelaDesmarcado(tabelaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosGraficoDesmarcado(Long graficoId) {
        return repository.buscarFiltrosGraficoDesmarcado(graficoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosMapaDesmarcado(Long mapaId) {
        return repository.buscarFiltrosMapaDesmarcado(mapaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosOrganogramaDesmarcado(Long organogramaId) {
        return repository.buscarFiltrosOrganogramaDesmarcado(organogramaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosTabelas() {
        return repository.buscarFiltrosTabelas().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosTabela(Long tabelaId) {
        return repository.buscarFiltrosTabela(tabelaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosGrafico(Long graficoId) {
        return repository.buscarFiltrosGrafico(graficoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosMapa(Long mapaId) {
        return repository.buscarFiltrosMapa(mapaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosOrganograma(Long organogramaId) {
        return repository.buscarFiltrosOrganograma(organogramaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosTabelaComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosTabelaComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosGraficoComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosGraficoComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosMapaComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosMapaComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosUnidadeComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosUnidadeComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosPerfilComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosPerfilComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarFiltrosUsuarioComFiltros(Long filtroRelatorioId) {
        return repository.buscarFiltrosUsuarioComFiltros(filtroRelatorioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    // Migrado de FiltrosController.autoCompleteDimensao (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:106, camada controller)
    // Logica original (adaptar):
    // public List<Dimensao> autoCompleteDimensao(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return dimensaoService.autoCompleteDimensao(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteDimensao(String query) {
        // Obs: nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.autoCompleteDimensao)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.autoCompleteDimensaoRelatorio (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:113, camada controller)
    // Logica original (adaptar):
    // public List<Dimensao> autoCompleteDimensaoRelatorio(String query) {
    //         FacesContext context = FacesContext.getCurrentInstance();
    //         Estrutura estrutura = (Estrutura) UIComponent.getCurrentComponent(context).getAttributes().get("filter");
    //         if (estrutura != null) {
    //             getEntity().setEstrutura(estrutura);
    //             return dimensaoService.autoCompleteDimensao(query, estrutura);
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteDimensaoRelatorio(String query) {
        // Obs: logica de UI do controlador JSF legado (atributo filter do componente) e nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.autoCompleteDimensao)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.autoCompleteTabela (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:124, camada controller)
    // Logica original (adaptar):
    // public List<Tabela> autoCompleteTabela(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return tabelaService.autoComplete(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteTabela(String query) {
        // Obs: logica de UI do controlador JSF legado (depende do estado estrutura da tela) - tabelaService.autoComplete(query, estrutura)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.autoCompleteGrafico (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:131, camada controller)
    // Logica original (adaptar):
    // public List<Grafico> autoCompleteGrafico(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return graficoService.autoComplete(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteGrafico(String query) {
        // Obs: logica de UI do controlador JSF legado (depende do estado estrutura da tela) - graficoService.autoComplete(query, estrutura)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.autoCompleteMapa (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:138, camada controller)
    // Logica original (adaptar):
    // public List<Mapa> autoCompleteMapa(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return mapaService.autoComplete(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteMapa(String query) {
        // Obs: logica de UI do controlador JSF legado (depende do estado estrutura da tela) - mapaService.autoComplete(query, estrutura)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.autoCompleteOrganograma (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:145, camada controller)
    // Logica original (adaptar):
    // public List<Organograma> autoCompleteOrganograma(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return organogramaService.autoComplete(query);
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteOrganograma(String query) {
        // Obs: logica de UI do controlador JSF legado (depende do estado estrutura da tela) - organogramaService.autoComplete(query)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FiltrosController.carregarTipo (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:276, camada controller)
    // Logica original (adaptar):
    // public void carregarTipo() {
    //         listTipoFiltro = new ArrayList<>();
    //         listTipoFiltro.add(TipoFiltro.NENHUM);
    //         if (!ObjectUtil.nullOrEmpty(getEntity().getDimensao())) {
    //             listTipoFiltro.add(TipoFiltro.NORMAL);
    //             if (!getEntity().getDimensao().getTipoInfo().equals("DESCRITIVO")) {
    //                 listTipoFiltro.add(TipoFiltro.FAIXA);
    //                 listTipoFiltro.add(TipoFiltro.PERIODICO);
    //             } else {
    //                 listTipoFiltro.add(TipoFiltro.FIXO);
    //                 listTipoFiltro.add(TipoFiltro.MULTIPLO);
    //             }
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarTipo() {
        // Obs: logica de UI do controlador JSF legado (monta listTipoFiltro na tela com base no estado da entidade), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de FiltrosController.carregarOperacaoQuery (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:487, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacaoQuery() {
    //         listOperation = new ArrayList<>();
    //         listOperation.add(QueryOperation.EQ);
    //         listOperation.add(QueryOperation.NOT_EQUAL);
    //         listOperation.add(QueryOperation.GREATER_THAN);
    //         listOperation.add(QueryOperation.GREATER_THAN_OR_EQUAL);
    //         listOperation.add(QueryOperation.LESS_THAN);
    //         listOperation.add(QueryOperation.LESS_THAN_OR_EQUAL);
    //     }
    public Uni<Void> carregarOperacaoQuery() {
        // Obs: logica de UI do controlador JSF legado (monta listOperation na tela), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de FiltrosController.buscarDadosTipo (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/FiltrosController.java:692, camada controller)
    // Logica original (adaptar):
    // public void buscarDadosTipo() {
    //         if (getEntity().getTipo() != null && getEntity().isFixo()) {
    //             if (getEntity().getDimensao().getTipoInfo().equals("TEMPO")) {
    //                 periodosDinamicos = montaPeriodoDinamico();
    //                 carregarOperacaoQuery();
    //             } else {
    //                 filtrosRelatorioWapper.setListaTodosSelected(new ArrayList<>());
    //                 conexaoBancos = new JdbcTemplate(dataSource);
    //                 colunaTabelaWapperLazyDataModel = new RelatorioTabelaDimenaoLazyModel(hibernateService, conexaoBancos, getEntity().getDimensao(), "");
    //             }
    //         }
    //     }
    public Uni<Void> buscarDadosTipo() {
        // Obs: logica de UI do controlador JSF legado (JdbcTemplate/RelatorioTabelaDimenaoLazyModel e estado da tela), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewTabela(Long tabelaId) {
        return repository.findByTabela(tabelaId)
                .map(this::toWrapperDTOs);
    }

    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForListTabela() {
        return repository.findAllForListTabela()
                .map(this::toWrapperDTOs);
    }

    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewMapa(Long mapaId) {
        return repository.findByMapa(mapaId)
                .map(this::toWrapperDTOs);
    }

    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewGraficoBarrasHorizontal(Long graficoId) {
        return repository.findByGrafico(graficoId)
                .map(this::toWrapperDTOs);
    }

    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForListGrafico() {
        return repository.findAllForListGrafico()
                .map(this::toWrapperDTOs);
    }

    private List<FiltroRelatorioWrapperDTO> toWrapperDTOs(List<Filtros> filtros) {
        List<FiltroRelatorioWrapperDTO> result = new ArrayList<>();
        for (Filtros f : filtros) {
            FiltroRelatorioWrapperDTO.FiltroRelatorioDTO filtroDTO = parseDadosJson(f);
            boolean selected = filtroDTO != null && filtroDTO.fixo();
            String informacao = filtroDTO != null ? filtroDTO.informacao() : null;
            result.add(new FiltroRelatorioWrapperDTO(filtroDTO, selected, informacao));
        }
        return result;
    }

    private FiltroRelatorioWrapperDTO.FiltroRelatorioDTO parseDadosJson(Filtros f) {
        if (f.dadosJson == null || f.dadosJson.isEmpty()) {
            return new FiltroRelatorioWrapperDTO.FiltroRelatorioDTO(
                    f.id, f.nome, false, true, "DINAMICO", null,
                    new FiltroRelatorioWrapperDTO.DimensaoDTO("DESCRITIVO")
            );
        }
        try {
            JsonNode json = objectMapper.readTree(f.dadosJson);
            boolean fixo = json.has("fixo") ? json.get("fixo").asBoolean() : false;
            boolean exibirFiltro = json.has("exibirFiltro") ? json.get("exibirFiltro").asBoolean() : true;
            String tipo = json.has("tipo") ? json.get("tipo").asText() : "DINAMICO";
            String informacao = json.has("informacao") ? json.get("informacao").asText() : null;
            String tipoInfo = "DESCRITIVO";
            if (json.has("dimensao") && json.get("dimensao").has("tipoInfo")) {
                tipoInfo = json.get("dimensao").get("tipoInfo").asText();
            }
            return new FiltroRelatorioWrapperDTO.FiltroRelatorioDTO(
                    f.id, f.nome, fixo, exibirFiltro, tipo, informacao,
                    new FiltroRelatorioWrapperDTO.DimensaoDTO(tipoInfo)
            );
        } catch (Exception e) {
            return new FiltroRelatorioWrapperDTO.FiltroRelatorioDTO(
                    f.id, f.nome, false, true, "DINAMICO", null,
                    new FiltroRelatorioWrapperDTO.DimensaoDTO("DESCRITIVO")
            );
        }
    }

}