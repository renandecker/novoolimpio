package br.com.sol7.olimpio.basico.compromisso.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Date;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoRequest;
import br.com.sol7.olimpio.basico.compromisso.dto.CompromissoResponse;
import br.com.sol7.olimpio.basico.compromisso.entity.Compromisso;
import br.com.sol7.olimpio.basico.compromisso.repository.CompromissoRepository;

@ApplicationScoped
@WithTransaction
public class CompromissoService {

    @Inject CompromissoRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(CompromissoService.class);

    // Migrado de SchedulingService.atualizarCompromissosAutomaticos()
    public Uni<Void> atualizarCompromissosAutomaticos() {
        logger.info("Atualizando compromissos automaticamente");

        return repository.atualizarCompromissosAutomaticos();
    }

    public Uni<List<CompromissoResponse>> list() {
        logger.info("Buscando todos os compromissos");
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CompromissoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CompromissoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .map(this::toResponse);
    }

    public Uni<CompromissoResponse> create(CompromissoRequest r) {
        var e = new Compromisso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CompromissoResponse> update(Long id, CompromissoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Compromisso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Compromisso not found")));
    }

    private void apply(Compromisso e, CompromissoRequest r) { e.descricao = r.descricao(); e.data = r.data(); e.horarioId = r.horarioId(); e.tipoCompromissoId = r.tipoCompromissoId(); e.agendaId = r.agendaId(); e.pessoaId = r.pessoaId(); e.dataChegada = r.dataChegada(); e.dataAlteracao = r.dataAlteracao(); e.dataInicio = r.dataInicio(); e.dataConclusao = r.dataConclusao(); e.observacao = r.observacao(); e.ativo = r.ativo(); e.usuarioId = r.usuarioId(); e.statusCompromissoId = r.statusCompromissoId(); e.prospectoId = r.prospectoId(); e.atendenteId = r.atendenteId(); e.usuarioFinalizouId = r.usuarioFinalizouId(); }

    private CompromissoResponse toResponse(Compromisso e) {
        return new CompromissoResponse(e.id, e.descricao, e.data, e.horarioId, e.tipoCompromissoId, e.agendaId, e.pessoaId, e.dataChegada, e.dataAlteracao, e.dataInicio, e.dataConclusao, e.observacao, e.ativo, e.usuarioId, e.statusCompromissoId, e.prospectoId, e.atendenteId, e.usuarioFinalizouId);
    }


    // Migrado de CompromissoController.atualizarAgendaSchedule (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:136, camada controller)
    // Observacao: parametro compromissoId: era Compromisso (referencia por id); parametro statusCompromissoId: era StatusCompromisso (referencia por id)
    // Logica original (adaptar):
    // public void atualizarAgendaSchedule(Compromisso compromisso, StatusCompromisso statusCompromisso) {
    //         tipoEvento = false;
    //         descricaoCompromisso = "";
    //         compromissos = compromissoService.listarCompromissosComAgendaComStatus(compromisso.getAgenda(), compromisso.getData(), statusCompromisso.getId());
    //         if (ObjectUtil.nullOrEmpty(compromissos)) {
    //             RequestContext.getCurrentInstance().execute("PF('telaCompromissoDialogo').hide();");
    //         }
    //     }
    public Uni<Void> atualizarAgendaSchedule(Long compromissoId, Long statusCompromissoId) {
        return repository.findById(compromissoId)
                .chain(c -> repository.listarCompromissosComAgendaComStatus(c.agendaId, c.data, statusCompromissoId.intValue()).replaceWithVoid());
    }


    // Migrado de CompromissoController.autoCompleteComUnidadeDiaSemana (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:159, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidadeDiaSemana(String query) {
    //         Calendar calendario = Calendar.getInstance();
    //         calendario.setTime(getEntity().getData());
    //         int diaSemana = calendario.get(Calendar.DAY_OF_WEEK);
    //         if (agenda != null) {
    //             if (getEntity().getStatusCompromisso().getPerfil() == null) {
    //                 return usuarioService.autoCompleteComUnidadeDiaSemanaAgenda(query.toLowerCase(), diaSemana, agenda);
    //             } else {
    //                 return usuarioService.autoCompleteComUnidadeDiaSemanaAgendaComPerfil(query.toLowerCase(), diaSemana, agenda, getEntity().getStatusCompromisso().getPerfil());
    //             }
    //         }
    //         return usuarioSe ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteComUnidadeDiaSemana(String query) {
        // Obs: depende do microservico central (Usuario) - usuarioService.autoCompleteComUnidadeDiaSemanaAgenda/ComPerfil
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CompromissoController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:260, camada controller)
    // Observacao: parametro entityId: era Compromisso (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Compromisso entity) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         ProspectoUtil.carregarProspectoParaVisualizacao(compromissoService.buscarProspectoDoCompromisso(entity), getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao(Long entityId) {
        // Obs: logica de UI (montar DynaFormModel de Prospecto)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:265, camada controller)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao() {
    //         dynaFormModelAtual = new DynaFormModel();
    //         ProspectoUtil.carregarProspectoParaVisualizacao(compromissoService.buscarProspectoDoCompromisso(getEntity()), getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao2() {
        // Obs: logica de UI (montar DynaFormModel de Prospecto)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.atualizarHorariosResultados (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:271, camada controller)
    // Observacao: parametro event: era SelectEvent no legado
    // Logica original (adaptar):
    // public void atualizarHorariosResultados(SelectEvent event) {
    //         getListaResultadosDisponiveis();
    //         listaResultados = new ArrayList<>();
    //         if (ObjectUtil.nullOrEmpty(getEntity().getData())) {
    //             return;
    //         }
    //         buscarHorariosDisponiveis((Agenda) event.getObject(), getEntity().getData());
    //     }
    public Uni<Void> atualizarHorariosResultados(String event) {
        // Obs: logica de UI (getListaResultadosDisponiveis + buscarHorariosDisponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.atualizarHorariosResultadosAgenda (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:280, camada controller)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // Logica original (adaptar):
    // public void atualizarHorariosResultadosAgenda(Agenda agenda) {
    //         getEntity().setAgenda(agenda);
    //         getListaResultadosDisponiveis();
    //         listaResultados = new ArrayList<>();
    //         if (ObjectUtil.nullOrEmpty(getEntity().getData())) {
    //             return;
    //         }
    //         buscarHorariosDisponiveis(getEntity().getAgenda(), getEntity().getData());
    //     }
    public Uni<Void> atualizarHorariosResultadosAgenda(Long agendaId) {
        // Obs: logica de UI (getListaResultadosDisponiveis + buscarHorariosDisponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.atualizarHorarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:290, camada controller)
    // Observacao: parametro event: era SelectEvent no legado
    // Logica original (adaptar):
    // public void atualizarHorarios(SelectEvent event) {
    //         if (ObjectUtil.nullOrEmpty(getEntity().getAgenda())) {
    //             MessageUtil.sendMessageToUser(MessageUtilType.INFO, "global.warning", "validation", "Selecione uma agenda para carregar os horários disponíveis");
    //             return;
    //         }
    //         buscarHorariosDisponiveis(getEntity().getAgenda(), (Date) event.getObject());
    //     }
    public Uni<Void> atualizarHorarios(String event) {
        // Obs: logica de UI (validar agenda selecionada + buscarHorariosDisponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.atualizarHorarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:309, camada controller)
    // Logica original (adaptar):
    // public void atualizarHorarios() {
    //         if (ObjectUtil.nullOrEmpty(getEntity().getAgenda())) {
    //             MessageUtil.sendMessageToUser(MessageUtilType.INFO, "global.warning", "validation", "Selecione uma agenda para carregar os horários disponíveis");
    //             return;
    //         }
    //         buscarHorariosDisponiveis(getEntity().getAgenda(), getEntity().getData());
    //     }
    public Uni<Void> atualizarHorarios2() {
        // Obs: logica de UI (validar agenda selecionada + buscarHorariosDisponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.buscarHorariosDisponiveis (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:388, camada controller)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // Logica original (adaptar):
    // public void buscarHorariosDisponiveis(Agenda agenda, Date data) {
    //         this.agenda = agenda;
    //         getEntity().setData(data);
    //         trocaTipoHorario();
    // 
    //         if (ObjectUtil.nullOrEmpty(horariosDisponiveis) && tipoHorario != 0) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Não existem horários disponíveis nesta data!");
    //         }
    //     }
    public Uni<Void> buscarHorariosDisponiveis(Long agendaId, Date data) {
        // Obs: logica de UI (seta agenda/data no controller e monta a lista de horarios disponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.buscarDetalhes (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:423, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalhes(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             Compromisso compromisso = (Compromisso) event.getData();
    //             compromissoPessoaStatuses = compromissoPessoaStatusService.getCompromissoPessoaStatusByCompromisso(compromisso);
    //         }
    //     }
    public Uni<Void> buscarDetalhes(String event) {
        // Obs: depende do microservico central (CompromissoPessoaStatus) - compromissoPessoaStatusService.getCompromissoPessoaStatusByCompromisso
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.autoCompletePessoaUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:468, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoaUnidade(String query) {
    //         List<Pessoa> pessoa = new ArrayList<>();
    //         if (!ObjectUtil.nullOrEmpty(unidade)) {
    //             pessoa.addAll(usuarioService.autoCompletePessoaFisicaUnidade(query.toLowerCase(), unidade));
    //             pessoa.addAll(usuarioService.autoCompletePessoaJuridicaUnidade(query.toLowerCase(), unidade));
    //         }
    //         return pessoa;
    //     }
    public Uni<List<Long>> autoCompletePessoaUnidade(String query) {
        // Obs: depende do microservico central (Usuario) - usuarioService.autoCompletePessoaFisicaUnidade / autoCompletePessoaJuridicaUnidade
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CompromissoController.atualizarHorariosData (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:499, camada controller)
    // Logica original (adaptar):
    // public void atualizarHorariosData() {
    //         buscarHorarios();
    //     }
    public Uni<Void> atualizarHorariosData() {
        // Obs: logica de UI (buscarHorarios)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.buscarHorarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:503, camada controller)
    // Logica original (adaptar):
    // public void buscarHorarios() {
    //         horariosDisponiveis = new ArrayList<>();
    //         trocaTipoHorario();
    // 
    //         if (ObjectUtil.nullOrEmpty(horariosDisponiveis)) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Não existem horários disponíveis nesta data!");
    //         }
    //     }
    public Uni<Void> buscarHorarios() {
        // Obs: logica de UI (montar lista de horarios disponiveis)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.carregarUsuarioAgenda (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:512, camada controller)
    // Logica original (adaptar):
    // public void carregarUsuarioAgenda() {
    //         if (unidade != null) {
    //             agendas = agendaService.buscarAgendasPorUnidade(unidade);
    //             resetCalendar();
    //         }
    //     }
    public Uni<Void> carregarUsuarioAgenda() {
        // Obs: logica de UI (agendaService.buscarAgendasPorUnidade + resetCalendar)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CompromissoController.verificaResultados (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CompromissoController.java:708, camada controller)
    // Observacao: parametro compromissoId: era Compromisso (referencia por id)
    // Logica original (adaptar):
    // public boolean verificaResultados(Compromisso compromisso) {
    //         compromisso = compromissoService.buscarCompromissoComResultados(compromisso.getId());
    //         if (!ObjectUtil.nullOrEmpty(compromisso)) {
    //             return true;
    //         }
    //         return false;
    //     }
    public Uni<Boolean> verificaResultados(Long compromissoId) {
        return repository.buscarCompromissoComResultados(compromissoId.intValue()).map(list -> !list.isEmpty());
    }


    // Migrado de CompromissoService.buscarCompromissoComResultados (src/main/java/br/com/sol7/olimpio/service/services/basico/CompromissoService.java:37, camada service)
    // Observacao: retorno: era Compromisso (referencia por id)
    // JPQL original: Select c from Compromisso c left join fetch c.resultados r where c.id = ?1
    // Logica original (adaptar):
    // public Compromisso buscarCompromissoComResultados(Integer id) {
    //         return getCompromissoRepository().buscarCompromissoComResultados(id);
    //     }
    public Uni<Long> buscarCompromissoComResultados(Integer id) {
                return repository.buscarCompromissoComResultados(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CompromissoService.buscarLigacaoAgendamentoVencido (src/main/java/br/com/sol7/olimpio/service/services/basico/CompromissoService.java:41, camada service)
    // Observacao: retorno: era Ligacao (referencia por id); parametro compromissoId: era Compromisso (referencia por id)
    // Logica original (adaptar):
    // public Ligacao buscarLigacaoAgendamentoVencido(Compromisso compromisso) {
    //         return getCompromissoRepository().buscarLigacaoAgendamentoVencido(compromisso);
    //     }
    public Uni<Long> buscarLigacaoAgendamentoVencido(Long compromissoId) {
                return repository.find("compromisso = ?1", compromissoId).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de CompromissoService.buscarProspectoDoCompromisso (src/main/java/br/com/sol7/olimpio/service/services/basico/CompromissoService.java:53, camada service)
    // Observacao: retorno: era Prospecto (referencia por id); parametro compromissoId: era Compromisso (referencia por id)
    // JPQL original: Select c.prospecto from Compromisso c left join fetch c.prospecto.prospectoCampos where c=?1
    // Logica original (adaptar):
    // public Prospecto buscarProspectoDoCompromisso(Compromisso compromisso) {
    //         return getCompromissoRepository().buscarProspectoDoCompromisso(compromisso);
    //     }
    public Uni<Long> buscarProspectoDoCompromisso(Long compromissoId) {
        return repository.buscarProspectoDoCompromisso(compromissoId).map(list -> list.isEmpty() ? null : ((Number) list.get(0)).longValue());
    }

}
