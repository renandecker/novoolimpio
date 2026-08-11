package br.com.sol7.olimpio.basico.configuracaoemail.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.configuracaoemail.dto.ConfiguracaoEmailRequest;
import br.com.sol7.olimpio.basico.configuracaoemail.dto.ConfiguracaoEmailResponse;
import br.com.sol7.olimpio.basico.configuracaoemail.entity.ConfiguracaoEmail;
import br.com.sol7.olimpio.basico.configuracaoemail.repository.ConfiguracaoEmailRepository;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoEmailService {

    @Inject ConfiguracaoEmailRepository repository;

    public Uni<List<ConfiguracaoEmailResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoEmailResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConfiguracaoEmailResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoEmail not found"))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoEmailResponse> create(ConfiguracaoEmailRequest r) {
        var e = new ConfiguracaoEmail();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoEmailResponse> update(Long id, ConfiguracaoEmailRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoEmail not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ConfiguracaoEmail not found")));
    }

    private void apply(ConfiguracaoEmail e, ConfiguracaoEmailRequest r) { e.host = r.host(); e.port = r.port(); e.protocol = r.protocol(); e.username = r.username(); e.password = r.password(); e.principal = r.principal(); e.periodicidade = r.periodicidade(); e.googleMapsApi = r.googleMapsApi(); e.googleMapsCota = r.googleMapsCota(); e.googleMapsUsar = r.googleMapsUsar(); e.googleMapsUsado = r.googleMapsUsado(); e.habilitarApi = r.habilitarApi(); e.tipoApiEmail = r.tipoApiEmail(); e.dateCota = r.dateCota(); e.cota = r.cota(); e.usado = r.usado(); e.tokenCorreio = r.tokenCorreio(); e.tokenSendgrip = r.tokenSendgrip(); e.clientId = r.clientId(); e.clientSecret = r.clientSecret(); e.accessToken = r.accessToken(); e.refreshToken = r.refreshToken(); e.quitwait = r.quitwait(); e.starttls = r.starttls(); e.auth = r.auth(); e.debug = r.debug(); e.autenticated = r.autenticated(); e.fallback = r.fallback(); }

    private ConfiguracaoEmailResponse toResponse(ConfiguracaoEmail e) {
        return new ConfiguracaoEmailResponse(e.id, e.host, e.port, e.protocol, e.username, e.password, e.principal, e.periodicidade, e.googleMapsApi, e.googleMapsCota, e.googleMapsUsar, e.googleMapsUsado, e.habilitarApi, e.tipoApiEmail, e.dateCota, e.cota, e.usado, e.tokenCorreio, e.tokenSendgrip, e.clientId, e.clientSecret, e.accessToken, e.refreshToken, e.quitwait, e.starttls, e.auth, e.debug, e.autenticated, e.fallback);
    }


    // Migrado de ConfiguracaoEmailController.autoCompleteTokenGoogle (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ConfiguracaoEmailController.java:116, camada controller)
    // Logica original (adaptar):
    // public List<ConfiguracaoEmail> autoCompleteTokenGoogle(String query) {
    //         if (query.equals("")) {
    //             return configuracaoEmailService.autoCompleteTokenGoogle(query);
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteTokenGoogle(String query) {
        if (query.equals("")) {
            return repository.autoCompleteTokenGoogle(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
        }
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de ConfiguracaoEmailService.verificarCotaAuto (src/main/java/br/com/sol7/olimpio/service/services/basico/ConfiguracaoEmailService.java:50, camada service)
    // Logica original (adaptar):
    // public void verificarCotaAuto() {
    //         try {
    //             hibernateService.executeUpdateSQL("UPDATE bas_email taxa" +
    //                     "  SET data_atualizacao = now(), usado = cota" +
    //                     "  where  taxa.fl_api_email = true and periodicidade = 'DIARIO' and " +
    //                     " taxa.data_atualizacao != current_date  ");
    // 
    //             hibernateService.executeUpdateSQL("UPDATE bas_email taxa" +
    //                     "  SET data_atualizacao = now(), usado = cota" +
    //                     "  where  taxa.fl_api_email = true and periodicidade = 'SEMANAL' " +
    //                     " and ( date_trunc('week', current_date) != date_trunc('week', taxa.data_atualizacao) ) ");
    // 
    // // ... (truncado, ver fonte original)
    public Uni<Void> verificarCotaAuto() {
        return repository.verificarCotaAutoNativo();
    }

    // Migrado de SchedulingService.verificarCotaEmailAutomatico() (chamado pelo job diario) -
    // so dispara a atualizacao de cota se existir configuracao de e-mail com cota habilitada
    // e a API estiver habilitada (habilitarApi = true no primeiro registro encontrado).
    public Uni<Void> verificarCotaAutomatico() {
        return repository.listEmailComCota()
                .chain(lista -> {
                    if (!lista.isEmpty() && Boolean.TRUE.equals(lista.get(0).habilitarApi)) {
                        return verificarCotaAuto();
                    }
                    return Uni.createFrom().voidItem();
                });
    }

}
