package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoCategoriaResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoCanalResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoTipoResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoUsuarioRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoUsuarioResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.PreferenciaNotificacaoUsuario;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.PreferenciaNotificacaoUsuarioRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class PreferenciaNotificacaoUsuarioService {

    @Inject
    PreferenciaNotificacaoUsuarioRepository repository;

    public static final List<String> CANAIS = List.of(
            PreferenciaNotificacaoUsuario.CANAL_PUSH,
            PreferenciaNotificacaoUsuario.CANAL_TELEGRAM,
            PreferenciaNotificacaoUsuario.CANAL_WHATSAPP,
            PreferenciaNotificacaoUsuario.CANAL_EMAIL,
            PreferenciaNotificacaoUsuario.CANAL_SMS
    );

    public static final Map<String, String> CANAL_LABELS = Map.of(
            PreferenciaNotificacaoUsuario.CANAL_PUSH, "Push",
            PreferenciaNotificacaoUsuario.CANAL_TELEGRAM, "Telegram",
            PreferenciaNotificacaoUsuario.CANAL_WHATSAPP, "WhatsApp",
            PreferenciaNotificacaoUsuario.CANAL_EMAIL, "E-mail",
            PreferenciaNotificacaoUsuario.CANAL_SMS, "SMS"
    );

    public static final Map<String, String> TIPO_LABELS = Map.of(
            PreferenciaNotificacaoUsuario.TIPO_NOTAS, "Notas",
            PreferenciaNotificacaoUsuario.TIPO_PRESENCAS, "Presenças",
            PreferenciaNotificacaoUsuario.TIPO_AULAS, "Aulas",
            PreferenciaNotificacaoUsuario.TIPO_REGISTRO_AULA, "Registro aula",
            PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CONTRATO, "Alteração contrato"
    );

    public static final Map<String, String> TIPO_DESCRICOES = Map.of(
            PreferenciaNotificacaoUsuario.TIPO_NOTAS, "Notificações quando o professor registrar ou alterar notas",
            PreferenciaNotificacaoUsuario.TIPO_PRESENCAS, "Notificações quando o professor registrar ou alterar presenças",
            PreferenciaNotificacaoUsuario.TIPO_AULAS, "Notificações quando houver alterações nas aulas (cancelamento, reagendamento, etc.)",
            PreferenciaNotificacaoUsuario.TIPO_REGISTRO_AULA, "Notificações quando o professor registrar o conteúdo da aula",
            PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CONTRATO, "Notificações quando houver alteração no status do contrato"
    );

    public static final Map<String, String> CATEGORIA_LABELS = Map.of(
            PreferenciaNotificacaoUsuario.CATEGORIA_TURMA, "Notificações turma",
            PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO, "Notificações contrato"
    );

    public static final Map<String, String> CATEGORIA_DESCRICOES = Map.of(
            PreferenciaNotificacaoUsuario.CATEGORIA_TURMA, "Configurações de notificação para alterações na turma do aluno",
            PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO, "Configurações de notificação para alterações no contrato do aluno/responsável"
    );

    public static final Map<String, List<String>> CATEGORIA_TIPOS = Map.of(
            PreferenciaNotificacaoUsuario.CATEGORIA_TURMA, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_NOTAS,
                    PreferenciaNotificacaoUsuario.TIPO_PRESENCAS,
                    PreferenciaNotificacaoUsuario.TIPO_AULAS,
                    PreferenciaNotificacaoUsuario.TIPO_REGISTRO_AULA
            ),
            PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CONTRATO
            )
    );

    public Uni<List<PreferenciaNotificacaoUsuarioResponse>> listByUsername(String username) {
        return repository.findByUsername(username)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<PreferenciaNotificacaoCategoriaResponse>> listGroupedByUsername(String username) {
        return repository.findByUsername(username)
                .map(items -> buildGroupedResponse(username, items));
    }

    public Uni<PreferenciaNotificacaoUsuarioResponse> createOrUpdate(PreferenciaNotificacaoUsuarioRequest request) {
        return repository.findByUsernameCategoriaTipoCanal(
                        request.username(), request.categoria(), request.tipo(), request.canal())
                .onItem().transformToUni(existing -> {
                    if (existing != null) {
                        existing.ativo = request.ativo() != null ? request.ativo() : true;
                        return repository.persist(existing).replaceWith(() -> toResponse(existing));
                    } else {
                        var entity = new PreferenciaNotificacaoUsuario();
                        entity.username = request.username();
                        entity.categoria = request.categoria();
                        entity.tipo = request.tipo();
                        entity.canal = request.canal();
                        entity.ativo = request.ativo() != null ? request.ativo() : true;
                        return repository.persist(entity).replaceWith(() -> toResponse(entity));
                    }
                });
    }

    public Uni<PreferenciaNotificacaoUsuarioResponse> update(Long id, PreferenciaNotificacaoUsuarioRequest request) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Preferência de notificação não encontrada"))
                .invoke(entity -> {
                    entity.ativo = request.ativo() != null ? request.ativo() : entity.ativo;
                })
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Preferência de notificação não encontrada")));
    }

    public Uni<Void> deleteByUsername(String username) {
        return repository.deleteByUsername(username);
    }

    public Uni<Void> initializeDefaultsForUser(String username) {
        var prefs = CATEGORIA_TIPOS.entrySet().stream()
                .flatMap(entry -> entry.getValue().stream()
                        .flatMap(tipo -> CANAIS.stream()
                                .map(canal -> {
                                    var p = new PreferenciaNotificacaoUsuario();
                                    p.username = username;
                                    p.categoria = entry.getKey();
                                    p.tipo = tipo;
                                    p.canal = canal;
                                    p.ativo = getDefaultAtivo(entry.getKey(), tipo, canal);
                                    return p;
                                })
                        )
                )
                .toList();

        return repository.persist(prefs).replaceWithVoid();
    }

    private boolean getDefaultAtivo(String categoria, String tipo, String canal) {
        if (categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_TURMA)) {
            return canal.equals(PreferenciaNotificacaoUsuario.CANAL_PUSH)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_EMAIL);
        }
        if (categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO)) {
            return canal.equals(PreferenciaNotificacaoUsuario.CANAL_PUSH)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_EMAIL)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_WHATSAPP);
        }
        return false;
    }

    private List<PreferenciaNotificacaoCategoriaResponse> buildGroupedResponse(String username, List<PreferenciaNotificacaoUsuario> items) {
        var prefsMap = items.stream()
                .collect(Collectors.toMap(
                        p -> p.categoria + "|" + p.tipo + "|" + p.canal,
                        p -> p
                ));

        return CATEGORIA_TIPOS.entrySet().stream()
                .map(entry -> {
                    var categoria = entry.getKey();
                    List<PreferenciaNotificacaoTipoResponse> tipos = entry.getValue().stream()
                            .map(tipo -> {
                                List<PreferenciaNotificacaoCanalResponse> canais = CANAIS.stream()
                                        .map(canal -> {
                                            var key = categoria + "|" + tipo + "|" + canal;
                                            var pref = prefsMap.get(key);
                                            return new PreferenciaNotificacaoCanalResponse(
                                                    canal,
                                                    CANAL_LABELS.get(canal),
                                                    pref != null ? pref.ativo : getDefaultAtivo(categoria, tipo, canal)
                                            );
                                        })
                                        .toList();
                                return new PreferenciaNotificacaoTipoResponse(
                                        tipo,
                                        TIPO_LABELS.get(tipo),
                                        TIPO_DESCRICOES.get(tipo),
                                        canais
                                );
                            })
                            .toList();
                    return new PreferenciaNotificacaoCategoriaResponse(
                            categoria,
                            CATEGORIA_LABELS.get(categoria),
                            CATEGORIA_DESCRICOES.get(categoria),
                            tipos
                    );
                })
                .toList();
    }

    private PreferenciaNotificacaoUsuarioResponse toResponse(PreferenciaNotificacaoUsuario entity) {
        return new PreferenciaNotificacaoUsuarioResponse(
                entity.id, entity.username, entity.categoria, entity.tipo, entity.canal,
                entity.ativo, entity.createdAt, entity.updatedAt
        );
    }
}