package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.Notificacao;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.NotificacaoRepository;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.PreferenciaNotificacaoUsuarioRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Page;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class NotificacaoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoService.class);

    @Inject
    NotificacaoRepository repository;
    @Inject
    ConfigCanalService configCanalService;
    @Inject
    NotificacaoRabbitMQProducer rabbitMQProducer;
    @Inject
    PreferenciaNotificacaoUsuarioService preferenciaService;
    @Inject
    PreferenciaNotificacaoUsuarioRepository preferenciaRepository;

    @WithSession
    public Uni<List<NotificacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    @WithSession
    public Uni<PagedResponse<NotificacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<NotificacaoResponse>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    @WithSession
    public Uni<PagedResponse<NotificacaoResponse>> minhas(String username, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 20;
        return repository.find("username = ?1 order by createdAt desc", username).page(Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("username = ?1", username)
                        .map(count -> new PagedResponse<NotificacaoResponse>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    @WithSession
    public Uni<Long> naoLidas(String username) {
        return repository.count("username = ?1 and lida = false", username);
    }

    @WithSession
    public Uni<NotificacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<NotificacaoResponse> create(NotificacaoRequest r) {
        var e = new Notificacao();
        e.username = r.username() == null || r.username().isBlank() ? "admin" : r.username();
        e.titulo = r.titulo();
        e.mensagem = r.mensagem();
        e.tipo = r.tipo();
        e.link = r.link();
        e.lida = false;
        String categoria = r.categoria() == null || r.categoria().isBlank() ? inferirCategoria(r.tipo()) : r.categoria().toUpperCase().trim();
        String tipo = r.tipo() == null ? null : r.tipo().toUpperCase().trim();
        return configCanalService.canaisAtivos()
                .chain(canais -> aplicarPreferenciasUsuario(e.username, categoria, tipo, canais)
                        .map(filtrados -> new CanaisResolvidos(canais.sistema(), filtrados.mobile(), filtrados.email(),
                                filtrados.telegram(), filtrados.sms(), filtrados.whatsapp())))
                .invoke(resolvidos -> {
                    e.canalSistema = resolvidos.sistema();
                    // Override explicito no request tem prioridade sobre sistema+usuario.
                    e.canalMobile = r.canalMobile() != null ? r.canalMobile() : resolvidos.mobile();
                    e.canalEmail = r.canalEmail() != null ? r.canalEmail() : resolvidos.email();
                    e.canalTelegram = r.canalTelegram() != null ? r.canalTelegram() : resolvidos.telegram();
                    e.canalSms = r.canalSms() != null ? r.canalSms() : resolvidos.sms();
                    e.canalWhatsapp = r.canalWhatsapp() != null ? r.canalWhatsapp() : resolvidos.whatsapp();
                })
                .chain(() -> repository.persist(e))
                .chain(saved -> {
                    if (!e.canalSistema && !e.canalMobile && !e.canalEmail
                            && !e.canalTelegram && !e.canalSms && !e.canalWhatsapp) {
                        LOGGER.info("Notificacao {} sem nenhum canal habilitado (sistema/usuario) - persistida sem dispatch.", e.id);
                        return Uni.createFrom().voidItem();
                    }
                    return rabbitMQProducer.dispatch(saved)
                            .onFailure().invoke(err ->
                                    LOGGER.warn("Falha ao publicar a notificação {} no RabbitMQ: {}", e.id, err.getMessage()))
                            .onFailure().recoverWithNull();
                })
                .replaceWith(() -> toResponse(e));
    }

    private record CanaisResolvidos(boolean sistema, boolean mobile, boolean email, boolean telegram, boolean sms, boolean whatsapp) {
    }

    /**
     * Aplica as preferencias do usuario sobre os canais ativos do sistema.
     * Regra: canal final = canalSistema && preferenciaUsuario (default true quando sem registro).
     * Se categoria/tipo ausentes, mantem os canais do sistema.
     */
    private Uni<ConfigCanalService.CanaisAtivos> aplicarPreferenciasUsuario(String username, String categoria, String tipo,
                                                                            ConfigCanalService.CanaisAtivos canais) {
        if (categoria == null || categoria.isBlank() || tipo == null || tipo.isBlank()
                || username == null || username.isBlank()) {
            return Uni.createFrom().item(canais);
        }
        return preferenciaRepository.findByUsername(username).map(prefs -> {
            var idx = new java.util.HashMap<String, Boolean>();
            for (var p : prefs) {
                idx.put(p.categoria + "|" + p.tipo + "|" + p.canal, p.ativo);
            }
            // PUSH mapeia para MOBILE; SISTEMA segue config global.
            boolean mobile = canais.mobile() && prefOuDefault(idx, categoria, tipo, "PUSH", true);
            boolean email = canais.email() && prefOuDefault(idx, categoria, tipo, "EMAIL", true);
            boolean telegram = canais.telegram() && prefOuDefault(idx, categoria, tipo, "TELEGRAM", true);
            boolean sms = canais.sms() && prefOuDefault(idx, categoria, tipo, "SMS", true);
            boolean whatsapp = canais.whatsapp() && prefOuDefault(idx, categoria, tipo, "WHATSAPP", true);
            return new ConfigCanalService.CanaisAtivos(canais.sistema(), mobile, email, telegram, sms, whatsapp);
        });
    }

    private boolean prefOuDefault(java.util.Map<String, Boolean> idx, String categoria, String tipo, String canal, boolean def) {
        Boolean v = idx.get(categoria + "|" + tipo + "|" + canal);
        return v == null ? def : v;
    }

    /**
     * Infere a categoria a partir do tipo para chamadas antigas que nao enviam categoria.
     */
    static String inferirCategoria(String tipo) {
        if (tipo == null) return null;
        String t = tipo.toUpperCase().trim();
        return switch (t) {
            case "NOTAS", "PRESENCAS", "AULAS", "REGISTRO_AULA" -> "TURMA";
            case "ALTERACAO_CONTRATO", "CONTRATO_CRIACAO", "CONTRATO_CANCELAMENTO" -> "CONTRATO";
            case "ALTERACAO_AGENDA" -> "AGENDA";
            case "ALTERACAO_CADASTRO" -> "USUARIO";
            case "ALTERACAO_AULA", "ALTERACAO_NOTA", "ALTERACAO_PRESENCA", "ALTERACAO_REGISTRO_AULA" -> "ALUNO";
            case "PERGUNTA_RESPONDIDA", "ALTERACAO_TURMA", "ALTERACAO_PROFESSOR" -> "PROFESSOR";
            default -> null;
        };
    }

    @WithTransaction
    public Uni<NotificacaoResponse> update(Long id, NotificacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .invoke(e -> {
                    e.username = r.username();
                    e.titulo = r.titulo();
                    e.mensagem = r.mensagem();
                    e.tipo = r.tipo();
                    e.link = r.link();
                    if (r.canalMobile() != null) e.canalMobile = r.canalMobile();
                    if (r.canalEmail() != null) e.canalEmail = r.canalEmail();
                    if (r.canalTelegram() != null) e.canalTelegram = r.canalTelegram();
                    if (r.canalSms() != null) e.canalSms = r.canalSms();
                    if (r.canalWhatsapp() != null) e.canalWhatsapp = r.canalWhatsapp();
                })
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Notificacao not found")));
    }

    @WithTransaction
    public Uni<NotificacaoResponse> marcarLida(Long id, String username) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Notificacao not found"))
                .invoke(e -> {
                    if (!e.username.equals(username))
                        throw new ForbiddenException("Notificacao pertence a outro usuário");
                    e.lida = true;
                    e.dataLeitura = OffsetDateTime.now();
                })
                .map(this::toResponse);
    }

    private NotificacaoResponse toResponse(Notificacao e) {
        return new NotificacaoResponse(e.id, e.username, e.titulo, e.mensagem, e.tipo, e.link, e.lida,
                e.canalSistema, e.canalMobile, e.canalEmail, e.canalTelegram, e.canalSms, e.canalWhatsapp, e.emailEnviado, e.mobileEnviado, e.telegramEnviado, e.smsEnviado, e.whatsappEnviado, e.dataLeitura, e.createdAt);
    }
}
