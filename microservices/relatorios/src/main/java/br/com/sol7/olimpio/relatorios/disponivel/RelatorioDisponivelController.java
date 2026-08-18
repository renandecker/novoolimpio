package br.com.sol7.olimpio.relatorios.disponivel;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.core.MediaType;
import br.com.sol7.olimpio.relatorios.tabela.TabelaService;
import br.com.sol7.olimpio.relatorios.grafico.GraficoService;
import br.com.sol7.olimpio.relatorios.mapa.MapaService;

import java.util.List;

@Path("/api/relatorios/relatorio/disponiveis")
@Produces(MediaType.APPLICATION_JSON)
public class RelatorioDisponivelController {

    @Inject RelatorioDisponivelService service;
    @Inject TabelaService tabelaService;
    @Inject GraficoService graficoService;
    @Inject MapaService mapaService;

    @GET
    public Uni<PagedResponse<RelatorioDisponivelResponse>> listar(
            @HeaderParam("X-Authenticated-Username") String username,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("busca") String busca) {
        return service.listarDisponiveisPaged(username, page == null ? 0 : page, size == null ? 10 : size, busca);
    }

    @GET
    @Path("/{tipo}/{id}")
    public Uni<RelatorioAbertoResponse> abrir(
            @PathParam("tipo") String tipo,
            @PathParam("id") Long id,
            @HeaderParam("X-Authenticated-Username") String username) {
        String tipoNormalizado = tipo == null ? "" : tipo.toUpperCase();
        return service.podeAcessar(username, tipoNormalizado, id)
                .onItem().transformToUni(permitido -> {
                    if (!permitido) return Uni.createFrom().failure(new ForbiddenException("Relatório não disponível para este usuário"));
                    return switch (tipoNormalizado) {
                        case "TABELA" -> tabelaService.find(id)
                                .chain(r -> tabelaService.executar(id)
                                        .map(dados -> new RelatorioAbertoResponse(r.id(), r.nome(), tipoNormalizado, r, dados)));
                        case "GRAFICO" -> graficoService.find(id)
                                .map(r -> new RelatorioAbertoResponse(r.id(), r.nome(), tipoNormalizado, r, null));
                        case "MAPA" -> mapaService.find(id)
                                .map(r -> new RelatorioAbertoResponse(r.id(), r.nome(), tipoNormalizado, r, null));
                        default -> Uni.createFrom().failure(new ForbiddenException("Tipo de relatório inválido"));
                    };
                });
    }
}
