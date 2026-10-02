package br.com.sol7.olimpio.basico.compromisso.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoRequest;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.AgendaHorariosResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoPessoaStatusResponse;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.ProximoStatusRequest;
import br.com.sol7.olimpio.basico.compromisso.dto.ResultadoResponse;
import br.com.sol7.olimpio.basico.compromisso.dto.TrocaStatusRequest;
import br.com.sol7.olimpio.basico.compromisso.service.CompromissoService;

@Path("/api/basico/compromisso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CompromissoController {
    @Inject
    CompromissoService service;

    @GET
    public Uni<List<CompromissoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CompromissoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CompromissoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CompromissoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CompromissoResponse> update(@PathParam("id") Long id, @Valid CompromissoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/atualizar-agenda-schedule")
    public Uni<Void> atualizarAgendaSchedule(@QueryParam("compromissoId") Long compromissoId, @QueryParam("statusCompromissoId") Long statusCompromissoId) {
        return service.atualizarAgendaSchedule(compromissoId, statusCompromissoId);
    }


    @GET
    @Path("/auto-complete-com-unidade-dia-semana")
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(@QueryParam("query") String query) {
        return service.autoCompleteComUnidadeDiaSemana(query);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<Long> carregarProspectoParaVisualizacao(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao(entityId);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao2")
    public Uni<Long> carregarProspectoParaVisualizacao2(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao2(entityId);
    }


    @POST
    @Path("/atualizar-horarios-resultados")
    public Uni<AgendaHorariosResponse> atualizarHorariosResultados(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorariosResultados(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @POST
    @Path("/atualizar-horarios-resultados-agenda")
    public Uni<AgendaHorariosResponse> atualizarHorariosResultadosAgenda(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorariosResultadosAgenda(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @POST
    @Path("/atualizar-horarios")
    public Uni<List<HorarioResponse>> atualizarHorarios(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorarios(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @POST
    @Path("/atualizar-horarios2")
    public Uni<List<HorarioResponse>> atualizarHorarios2(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorarios2(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/buscar-horarios-disponiveis")
    public Uni<List<HorarioResponse>> buscarHorariosDisponiveis(@QueryParam("agendaId") Long agendaId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("data") Date data, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.buscarHorariosDisponiveis(agendaId, usuarioId, data, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/buscar-detalhes")
    public Uni<List<CompromissoPessoaStatusResponse>> buscarDetalhes(@QueryParam("compromissoId") Long compromissoId) {
        return service.buscarDetalhes(compromissoId);
    }


    @GET
    @Path("/auto-complete-pessoa-unidade")
    public Uni<List<Long>> autoCompletePessoaUnidade(@QueryParam("query") String query) {
        return service.autoCompletePessoaUnidade(query);
    }


    @POST
    @Path("/atualizar-horarios-data")
    public Uni<List<HorarioResponse>> atualizarHorariosData(@QueryParam("compromissoId") Long compromissoId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.atualizarHorariosData(compromissoId, usuarioId, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/buscar-horarios")
    public Uni<List<HorarioResponse>> buscarHorarios(@QueryParam("compromissoId") Long compromissoId, @QueryParam("usuarioId") Long usuarioId, @QueryParam("tipoHorario") Integer tipoHorario) {
        return service.buscarHorarios(compromissoId, usuarioId, tipoHorario == null ? 0 : tipoHorario);
    }


    @GET
    @Path("/carregar-usuario-agenda")
    public Uni<List<Long>> carregarUsuarioAgenda(@QueryParam("unidadeId") Long unidadeId) {
        return service.carregarUsuarioAgenda(unidadeId);
    }


    @GET
    @Path("/verifica-resultados")
    public Uni<Boolean> verificaResultados(@QueryParam("compromissoId") Long compromissoId) {
        return service.verificaResultados(compromissoId);
    }


    @GET
    @Path("/buscar-compromisso-com-resultados")
    public Uni<Long> buscarCompromissoComResultados(@QueryParam("id") Integer id) {
        return service.buscarCompromissoComResultados(id);
    }


    @GET
    @Path("/buscar-ligacao-agendamento-vencido")
    public Uni<Long> buscarLigacaoAgendamentoVencido(@QueryParam("compromissoId") Long compromissoId) {
        return service.buscarLigacaoAgendamentoVencido(compromissoId);
    }


    @GET
    @Path("/list-compromisso")
    public Uni<List<CompromissoResponse>> listCompromisso(
            @QueryParam("inicio") String inicioStr,
            @QueryParam("fim") String fimStr,
            @QueryParam("agendaId") Long agendaId) {
        Date inicio = inicioStr != null ? java.sql.Date.valueOf(inicioStr) : null;
        Date fim = fimStr != null ? java.sql.Date.valueOf(fimStr) : null;
        return service.listarCompromissosPorRangeData(inicio, fim)
                .map(list -> {
                    if (agendaId != null) {
                        list = list.stream()
                                .filter(c -> c.agendaId() != null && c.agendaId().equals(agendaId))
                                .toList();
                    }
                    return list;
                });
    }


    @GET
    @Path("/buscar-prospecto-do-compromisso")
    public Uni<Long> buscarProspectoDoCompromisso(@QueryParam("compromissoId") Long compromissoId) {
        return service.buscarProspectoDoCompromisso(compromissoId);
    }

    @POST
    @Path("/atualizar-compromissos-automaticos")
    public Uni<Void> atualizarCompromissosAutomaticos() {
        return service.atualizarCompromissosAutomaticos();
    }

    @PUT
    @Path("/{id}/troca-status")
    public Uni<CompromissoResponse> trocaStatus(@PathParam("id") Long id, TrocaStatusRequest r) {
        return service.trocarStatus(id, r.statusId());
    }

    @PUT
    @Path("/{id}/proximo-status")
    public Uni<CompromissoResponse> proximoStatus(@PathParam("id") Long id, ProximoStatusRequest r) {
        return service.proximoStatus(id, r.observacao());
    }

    @GET
    @Path("/buscar-pessoas-por-agenda-ou-unidade")
    public Uni<List<br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse>> buscarPessoasPorAgendaOuUnidade(
            @QueryParam("agendaId") Long agendaId,
            @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarPessoasPorAgendaOuUnidade(agendaId, unidadeId);
    }

    @GET
    @Path("/{id}/resultados")
    public Uni<List<br.com.sol7.olimpio.basico.compromisso.dto.ResultadoResponse>> listarResultados(@PathParam("id") Long id) {
        return service.listarResultados(id);
    }

}