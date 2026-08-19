package br.com.sol7.olimpio.relatorios.filtros;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

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
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosGrafico(Long graficoId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosMapa(Long mapaId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<List<Filtros>> buscarFiltrosOrganograma(Long organogramaId) {
        return Uni.createFrom().item(List.of());
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
}