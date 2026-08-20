package br.com.sol7.olimpio.educacao.gerarchamadaassinada;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class GerarChamadaAssinadaService {
    @Inject
    GerarChamadaAssinadaRepository repository;

    public Uni<List<GerarChamadaAssinadaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GerarChamadaAssinadaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GerarChamadaAssinadaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarChamadaAssinada not found")).map(this::toResponse);
    }

    public Uni<GerarChamadaAssinadaResponse> create(GerarChamadaAssinadaRequest r) {
        var e = new GerarChamadaAssinada();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GerarChamadaAssinadaResponse> update(Long id, GerarChamadaAssinadaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarChamadaAssinada not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GerarChamadaAssinada not found")));
    }

    private void apply(GerarChamadaAssinada e, GerarChamadaAssinadaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GerarChamadaAssinadaResponse toResponse(GerarChamadaAssinada e) {
        return new GerarChamadaAssinadaResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de GerarChamadaAssinadaController.gerarChamadaAssinadaPaisagem (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GerarChamadaAssinadaController.java:482, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro chamadaAssinadas: lista de ChamadaAssinada original
    // Logica original (adaptar):
    // public StreamedContent gerarChamadaAssinadaPaisagem(List<ChamadaAssinada> chamadaAssinadas) throws MalformedURLException {
    //         HashMap paramentros = new HashMap<String, Object>();
    //         ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
    //         ServletContext contextS = (ServletContext) externalContext.getContext();
    //         paramentros.put("PROJECT_PATH", contextS.getRealPath(""));
    // 
    //         return gerarCarneController.gerarRelatorio("/WEB-INF/relatorios/novaChamaAssinadaPaisagem.jasper", paramentros, chamadaAssinadas, chamadaAssinadas.get(0).getSequencia());
    //     }
    public Uni<String> gerarChamadaAssinadaPaisagem(List<String> chamadaAssinadas) {
        // Obs: depende do microservico relatorios (geracao de relatorio Jasper)
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarChamadaAssinadaController.gerarChamadaAssinadaRetrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GerarChamadaAssinadaController.java:492, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro chamadaAssinadas: lista de ChamadaAssinada original
    // Logica original (adaptar):
    // public StreamedContent gerarChamadaAssinadaRetrato(List<ChamadaAssinada> chamadaAssinadas) throws MalformedURLException {
    //         HashMap paramentros = new HashMap<String, Object>();
    //         ExternalContext externalContext = FacesContext.getCurrentInstance().getExternalContext();
    //         ServletContext contextS = (ServletContext) externalContext.getContext();
    //         paramentros.put("PROJECT_PATH", contextS.getRealPath(""));
    // 
    //         return gerarCarneController.gerarRelatorio("/WEB-INF/relatorios/novaChamaAssinadaRetrato.jasper", paramentros, chamadaAssinadas, chamadaAssinadas.get(0).getSequencia());
    //     }
    public Uni<String> gerarChamadaAssinadaRetrato(List<String> chamadaAssinadas) {
        // Obs: depende do microservico relatorios (geracao de relatorio Jasper)
        return Uni.createFrom().item(null);
    }

}
