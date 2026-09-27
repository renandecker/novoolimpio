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

    public static final Map<String, String> TIPO_LABELS = Map.ofEntries(
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_NOTAS, "Notas"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_PRESENCAS, "Presenças"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_AULAS, "Aulas"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_REGISTRO_AULA, "Registro aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CONTRATO, "Alteração contrato"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AGENDA, "Alterações da sua agenda"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CADASTRO, "Alterações no seu cadastro"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CRIACAO, "Criação de contrato"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CANCELAMENTO, "Cancelamento de contrato"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AULA, "Alteração de aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_NOTA, "Alteração de nota"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PRESENCA, "Alteração de presença"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_REGISTRO_AULA, "Alteração de registro de aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_PERGUNTA_RESPONDIDA, "Perguntas respondidas do aluno"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_TURMA, "Alterações da turma vinculada"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PROFESSOR, "Alterações do seu registro de professor")
    );

    public static final Map<String, String> TIPO_DESCRICOES = Map.ofEntries(
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_NOTAS, "Notificações quando o professor registrar ou alterar notas"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_PRESENCAS, "Notificações quando o professor registrar ou alterar presenças"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_AULAS, "Notificações quando houver alterações nas aulas (cancelamento, reagendamento, etc.)"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_REGISTRO_AULA, "Notificações quando o professor registrar o conteúdo da aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CONTRATO, "Notificações quando houver alteração no status do contrato"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AGENDA, "Notificações quando houver alterações na sua agenda"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CADASTRO, "Notificações quando houver alterações no seu cadastro"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CRIACAO, "Notificações quando um contrato for criado para você"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CANCELAMENTO, "Notificações quando um contrato for cancelado"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AULA, "Notificações quando houver alteração de aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_NOTA, "Notificações quando houver alteração de nota"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PRESENCA, "Notificações quando houver alteração de presença"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_REGISTRO_AULA, "Notificações quando houver alteração de registro de aula"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_PERGUNTA_RESPONDIDA, "Notificações quando perguntas do aluno forem respondidas"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_TURMA, "Notificações quando houver alteração de status ou dia de aula da turma vinculada"),
            Map.entry(PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PROFESSOR, "Notificações quando houver alteração no seu registro de professor")
    );

    public static final Map<String, String> CATEGORIA_LABELS = Map.of(
            PreferenciaNotificacaoUsuario.CATEGORIA_TURMA, "Notificações turma",
            PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO, "Notificações contrato",
            PreferenciaNotificacaoUsuario.CATEGORIA_USUARIO, "Notificações do usuário",
            PreferenciaNotificacaoUsuario.CATEGORIA_ALUNO, "Notificações do aluno",
            PreferenciaNotificacaoUsuario.CATEGORIA_PROFESSOR, "Notificações do professor",
            PreferenciaNotificacaoUsuario.CATEGORIA_AGENDA, "Notificações de agenda"
    );

    public static final Map<String, String> CATEGORIA_DESCRICOES = Map.of(
            PreferenciaNotificacaoUsuario.CATEGORIA_TURMA, "Configurações de notificação para alterações na turma do aluno",
            PreferenciaNotificacaoUsuario.CATEGORIA_CONTRATO, "Configurações de notificação para alterações no contrato do aluno/responsável",
            PreferenciaNotificacaoUsuario.CATEGORIA_USUARIO, "Alterações da sua agenda e do seu cadastro",
            PreferenciaNotificacaoUsuario.CATEGORIA_ALUNO, "Contrato, aula, nota, presença e registro de aula do aluno logado",
            PreferenciaNotificacaoUsuario.CATEGORIA_PROFESSOR, "Perguntas respondidas, turma vinculada e registro do professor logado",
            PreferenciaNotificacaoUsuario.CATEGORIA_AGENDA, "Alterações da agenda do usuário"
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
            ),
            PreferenciaNotificacaoUsuario.CATEGORIA_USUARIO, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AGENDA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_CADASTRO
            ),
            PreferenciaNotificacaoUsuario.CATEGORIA_ALUNO, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CRIACAO,
                    PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CANCELAMENTO,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AULA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_NOTA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PRESENCA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_REGISTRO_AULA
            ),
            PreferenciaNotificacaoUsuario.CATEGORIA_PROFESSOR, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_PERGUNTA_RESPONDIDA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_TURMA,
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_PROFESSOR
            ),
            PreferenciaNotificacaoUsuario.CATEGORIA_AGENDA, List.of(
                    PreferenciaNotificacaoUsuario.TIPO_ALTERACAO_AGENDA
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
        if (categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_USUARIO)
                || categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_AGENDA)) {
            return canal.equals(PreferenciaNotificacaoUsuario.CANAL_PUSH)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_EMAIL);
        }
        if (categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_ALUNO)) {
            return canal.equals(PreferenciaNotificacaoUsuario.CANAL_PUSH)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_EMAIL)
                    || (tipo.equals(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CRIACAO)
                        || tipo.equals(PreferenciaNotificacaoUsuario.TIPO_CONTRATO_CANCELAMENTO)
                        ? canal.equals(PreferenciaNotificacaoUsuario.CANAL_WHATSAPP) : false);
        }
        if (categoria.equals(PreferenciaNotificacaoUsuario.CATEGORIA_PROFESSOR)) {
            return canal.equals(PreferenciaNotificacaoUsuario.CANAL_PUSH)
                    || canal.equals(PreferenciaNotificacaoUsuario.CANAL_EMAIL);
        }
        return false;
    }

    /**
     * Diz se o usuario permite o envio em determinado canal para categoria/tipo.
     * Sem registro salvo => usa o default (equivale a "pode enviar").
     */
    public Uni<Boolean> podeEnviar(String username, String categoria, String tipo, String canal) {
        if (username == null || username.isBlank() || categoria == null || tipo == null || canal == null) {
            return Uni.createFrom().item(true);
        }
        return repository.findByUsernameCategoriaTipoCanal(username, categoria, tipo, canal)
                .map(pref -> pref == null ? getDefaultAtivo(categoria, tipo, canal) : pref.ativo);
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