package br.com.sol7.olimpio.basico.calendarioagenda.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
import java.util.Date;
import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaRequest;
import br.com.sol7.olimpio.basico.calendarioagenda.dto.CalendarioAgendaResponse;
import br.com.sol7.olimpio.basico.calendarioagenda.entity.CalendarioAgenda;
import br.com.sol7.olimpio.basico.calendarioagenda.repository.CalendarioAgendaRepository;
@ApplicationScoped @WithTransaction public class CalendarioAgendaService { @Inject CalendarioAgendaRepository repository; public Uni<List<CalendarioAgendaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<CalendarioAgendaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<CalendarioAgendaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CalendarioAgenda not found")).map(this::toResponse);} public Uni<CalendarioAgendaResponse> create(CalendarioAgendaRequest r){var e=new CalendarioAgenda();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<CalendarioAgendaResponse> update(Long id,CalendarioAgendaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CalendarioAgenda not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("CalendarioAgenda not found")));} private void apply(CalendarioAgenda e,CalendarioAgendaRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private CalendarioAgendaResponse toResponse(CalendarioAgenda e){return new CalendarioAgendaResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de CalendarioAgendaController.buscarDetalhes (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CalendarioAgendaController.java:127, camada controller)
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


    // Migrado de CalendarioAgendaController.atualizarHorarios (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CalendarioAgendaController.java:245, camada controller)
    // Observacao: parametro event: era SelectEvent no legado
    // Logica original (adaptar):
    // public void atualizarHorarios(SelectEvent event) {
    //         buscarHorariosDisponiveis(compromisso.getAgenda(), (Date) event.getObject());
    //     }
    public Uni<Void> atualizarHorarios(String event) {
        // Obs: logica de UI (buscarHorariosDisponiveis com o calendario do controller)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CalendarioAgendaController.atualizarHorariosData (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CalendarioAgendaController.java:249, camada controller)
    // Logica original (adaptar):
    // public void atualizarHorariosData() {
    //         buscarHorariosDisponiveis(compromisso.getAgenda(), compromisso.getData());
    //     }
    public Uni<Void> atualizarHorariosData() {
        // Obs: logica de UI (buscarHorariosDisponiveis com a data do compromisso)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CalendarioAgendaController.buscarHorariosDisponiveis (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CalendarioAgendaController.java:298, camada controller)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // Logica original (adaptar):
    // public void buscarHorariosDisponiveis(Agenda agenda, Date data) {
    //         this.agenda = agenda;
    //         compromisso.setData(data);
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


    // Migrado de CalendarioAgendaController.carregarUsuarioAgenda (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CalendarioAgendaController.java:312, camada controller)
    // Logica original (adaptar):
    // public void carregarUsuarioAgenda() {
    //         if (agenda != null) {
    //             agenda = agendaService.buscarAgendaComStatus(agenda);
    //             usuarioAgenda = new UsuarioAgenda();
    //             Usuario usuarioCarregado = usuarioService.buscarUsuarioComAgendas(usuarioLogadoController.getUsuario());
    //             for (UsuarioAgenda ua : usuarioCarregado.getUsuarioAgendas()) {
    //                 if (ua.getAgenda().equals(agenda)) {
    //                     usuarioAgenda = ua;
    //                 }
    //             }
    //             resetCalendar();
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarUsuarioAgenda() {
        // Obs: depende do microservico central (Usuario) - usuarioService.buscarUsuarioComAgendas
        return Uni.createFrom().voidItem();
    }

}