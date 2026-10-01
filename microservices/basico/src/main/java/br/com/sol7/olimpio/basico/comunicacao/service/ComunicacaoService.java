package br.com.sol7.olimpio.basico.comunicacao.service;

import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoRequest;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoResponse;
import br.com.sol7.olimpio.basico.comunicacao.entity.Comunicacao;
import br.com.sol7.olimpio.basico.comunicacao.repository.ComunicacaoRepository;
import br.com.sol7.olimpio.basico.shared.notificacao.NotificacaoEventProducer;
import br.com.sol7.olimpio.basico.shared.notificacao.NotificacaoEvento;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.OffsetDateTime;
import java.util.List;

@ApplicationScoped
public class ComunicacaoService {

    @Inject
    ComunicacaoRepository repository;

    @Inject
    NotificacaoEventProducer notificacaoEventProducer;

    @Inject
    Pool pool;

    @WithSession
    public Uni<List<ComunicacaoResponse>> list() {
        return repository.listAllOrderByIdDesc()
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    @WithSession
    public Uni<PagedResponse<ComunicacaoResponse>> paged(int page, int size) {
        return repository.paged(page, size)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(),
                        paged.page(),
                        paged.size()
                ));
    }

    @WithSession
    public Uni<ComunicacaoResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Comunicação não encontrada"))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<ComunicacaoResponse> create(ComunicacaoRequest r) {
        var e = new Comunicacao();
        e.idUsuario = r.idUsuario();
        e.titulo = r.titulo();
        e.mensagem = r.mensagem();
        e.tipo = r.tipo();
        e.categoria = r.categoria();
        e.link = r.link();
        e.canalSistema = r.canalSistema() != null ? r.canalSistema() : true;
        e.canalMobile = r.canalMobile() != null ? r.canalMobile() : false;
        e.canalEmail = r.canalEmail() != null ? r.canalEmail() : false;
        e.canalTelegram = r.canalTelegram() != null ? r.canalTelegram() : false;
        e.canalSms = r.canalSms() != null ? r.canalSms() : false;
        e.canalWhatsapp = r.canalWhatsapp() != null ? r.canalWhatsapp() : false;
        e.canalNotificacao = r.canalNotificacao() != null ? r.canalNotificacao() : true;
        e.status = Comunicacao.StatusComunicacao.RASCUNHO;

        return repository.persist(e)
                .chain(saved -> salvarDestinatarios(e.id, r))
                .chain(saved -> repository.findById(e.id))
                .onItem().ifNull().failWith(() -> new NotFoundException("Comunicação não encontrada após salvar"))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<ComunicacaoResponse> update(Long id, ComunicacaoRequest r) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Comunicação não encontrada"))
                .invoke(e -> {
                    e.titulo = r.titulo();
                    e.mensagem = r.mensagem();
                    e.tipo = r.tipo();
                    e.categoria = r.categoria();
                    e.link = r.link();
                    if (r.canalSistema() != null) e.canalSistema = r.canalSistema();
                    if (r.canalMobile() != null) e.canalMobile = r.canalMobile();
                    if (r.canalEmail() != null) e.canalEmail = r.canalEmail();
                    if (r.canalTelegram() != null) e.canalTelegram = r.canalTelegram();
                    if (r.canalSms() != null) e.canalSms = r.canalSms();
                    if (r.canalWhatsapp() != null) e.canalWhatsapp = r.canalWhatsapp();
                    if (r.canalNotificacao() != null) e.canalNotificacao = r.canalNotificacao();
                })
                .chain(e -> removerDestinatarios(e.id)
                        .chain(v -> salvarDestinatarios(e.id, r)))
                .chain(v -> repository.findById(id))
                .onItem().ifNull().failWith(() -> new NotFoundException("Comunicação não encontrada após atualizar"))
                .map(this::toResponse);
    }

    @WithTransaction
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id)
                .onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Comunicação não encontrada")));
    }

    @WithTransaction
    public Uni<ComunicacaoResponse> enviar(Long id, String username) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Comunicação não encontrada"))
                .chain(e -> {
                    // Enviar para a fila genérica do RabbitMQ
                    return notificacaoEventProducer.enviar(new NotificacaoEvento(
                            username,
                            e.categoria != null ? e.categoria : "COMUNICACAO",
                            e.tipo != null ? e.tipo : "GERAL",
                            e.titulo,
                            e.mensagem,
                            e.link,
                            e.canalMobile,
                            e.canalEmail,
                            e.canalTelegram,
                            e.canalSms,
                            e.canalWhatsapp,
                            e.canalNotificacao
                    ))
                    .replaceWith(e);
                })
                .invoke(e -> {
                    e.status = Comunicacao.StatusComunicacao.ENVIADO;
                    e.dataEnvio = OffsetDateTime.now();
                })
                .map(this::toResponse);
    }

    private Uni<Void> salvarDestinatarios(Long idComunicacao, ComunicacaoRequest r) {
        var queries = new java.util.ArrayList<Uni<Void>>();

        if (r.unidadesIds() != null && !r.unidadesIds().isEmpty()) {
            for (Integer idUnidade : r.unidadesIds()) {
                queries.add(pool.preparedQuery("INSERT INTO bas_comunicacao_unidade (id_unidade, id_comunicacao) VALUES (?, ?)")
                        .execute(Tuple.of(idUnidade, idComunicacao))
                        .replaceWithVoid());
            }
        }
        if (r.cursosIds() != null && !r.cursosIds().isEmpty()) {
            for (Integer idCurso : r.cursosIds()) {
                queries.add(pool.preparedQuery("INSERT INTO bas_comunicacao_curriculo (id_curriculo, id_comunicacao) VALUES (?, ?)")
                        .execute(Tuple.of(idCurso, idComunicacao))
                        .replaceWithVoid());
            }
        }
        if (r.turmasIds() != null && !r.turmasIds().isEmpty()) {
            for (Integer idTurma : r.turmasIds()) {
                queries.add(pool.preparedQuery("INSERT INTO bas_comunicacao_oferecimento (id_oferecimento, id_comunicacao) VALUES (?, ?)")
                        .execute(Tuple.of(idTurma, idComunicacao))
                        .replaceWithVoid());
            }
        }
        if (r.pessoasIds() != null && !r.pessoasIds().isEmpty()) {
            for (Integer idPessoa : r.pessoasIds()) {
                queries.add(pool.preparedQuery("INSERT INTO bas_comunicacao_pessoa (id_pessoa, id_comunicacao) VALUES (?, ?)")
                        .execute(Tuple.of(idPessoa, idComunicacao))
                        .replaceWithVoid());
            }
        }
        if (r.usuariosIds() != null && !r.usuariosIds().isEmpty()) {
            for (Integer idUsuario : r.usuariosIds()) {
                queries.add(pool.preparedQuery("INSERT INTO bas_comunicacao_usuario (id_usuario, id_comunicacao) VALUES (?, ?)")
                        .execute(Tuple.of(idUsuario, idComunicacao))
                        .replaceWithVoid());
            }
        }

        if (queries.isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        return Uni.combine().all().unis(queries).combinedWith(items -> null);
    }

    private Uni<Void> removerDestinatarios(Long idComunicacao) {
        var queries = new java.util.ArrayList<Uni<Void>>();
        queries.add(pool.preparedQuery("DELETE FROM bas_comunicacao_unidade WHERE id_comunicacao = ?")
                .execute(Tuple.of(idComunicacao))
                .replaceWithVoid());
        queries.add(pool.preparedQuery("DELETE FROM bas_comunicacao_curriculo WHERE id_comunicacao = ?")
                .execute(Tuple.of(idComunicacao))
                .replaceWithVoid());
        queries.add(pool.preparedQuery("DELETE FROM bas_comunicacao_oferecimento WHERE id_comunicacao = ?")
                .execute(Tuple.of(idComunicacao))
                .replaceWithVoid());
        queries.add(pool.preparedQuery("DELETE FROM bas_comunicacao_pessoa WHERE id_comunicacao = ?")
                .execute(Tuple.of(idComunicacao))
                .replaceWithVoid());
        queries.add(pool.preparedQuery("DELETE FROM bas_comunicacao_usuario WHERE id_comunicacao = ?")
                .execute(Tuple.of(idComunicacao))
                .replaceWithVoid());
        return Uni.combine().all().unis(queries).combinedWith(items -> null);
    }

    private ComunicacaoResponse toResponse(Comunicacao e) {
        return new ComunicacaoResponse(
                e.id,
                e.idUsuario,
                e.titulo,
                e.mensagem,
                e.tipo,
                e.categoria,
                e.link,
                e.dataEnvio,
                e.status,
                e.canalSistema,
                e.canalMobile,
                e.canalEmail,
                e.canalTelegram,
                e.canalSms,
                e.canalWhatsapp,
                e.canalNotificacao,
                e.createdAt,
                e.updatedAt,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }
}