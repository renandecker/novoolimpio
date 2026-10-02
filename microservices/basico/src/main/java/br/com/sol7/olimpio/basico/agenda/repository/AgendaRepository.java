package br.com.sol7.olimpio.basico.agenda.repository;

import java.util.List;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.agenda.entity.Agenda;

@ApplicationScoped
public class AgendaRepository implements PanacheRepository<Agenda> {

    // Select a from Agenda a where a.unidade.ativo = true and a.unidade = ?1
    public static final String SQL_BUSCAR_AGENDAS_POR_UNIDADE =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id_unidade = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendasPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDAS_POR_UNIDADE, Agenda.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Select a from Agenda a where  a.unidade.ativo = true and str(a.id) = ?1 or lower(a.descricao) like '%' || ?1 || '%' order by a.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and CAST(a.id AS text) = ?1 or lower(a.descricao) like '%' || ?1 || '%' ORDER BY a.descricao";

    public Uni<java.util.List<Agenda>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Agenda.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Select a from Agenda a left join fetch a.resultados where  a.unidade.ativo = true and a = ?1
    public static final String SQL_BUSCAR_AGENDA_COM_RESULTADOS =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendaComResultados(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA_COM_RESULTADOS, Agenda.class)
                        .setParameter(1, agendaId)
                        .getResultList());
    }


    // Select a from Agenda a left join fetch a.status where  a.unidade.ativo = true and a = ?1
    public static final String SQL_BUSCAR_AGENDA_COM_STATUS =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendaComStatus(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA_COM_STATUS, Agenda.class)
                        .setParameter(1, agendaId)
                        .getResultList());
    }


    // Select ua from Agenda a inner join a.usuarioAgendas ua where  a.unidade.ativo = true and a = ?1
    public static final String SQL_BUSCAR_AGENDA_COM_USUARIOS =
            "SELECT ua.* FROM bas_agenda a INNER JOIN bas_usuario_agenda ua ON ua.id_agenda = a.id LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id = ?1";

    // Atencao: a query original seleciona 'UsuarioAgenda', nao 'Agenda'.
    // Se 'UsuarioAgenda' existir como entidade neste microsservico, troque Object por UsuarioAgenda.class abaixo.
    public Uni<java.util.List<Object>> buscarAgendaComUsuarios(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA_COM_USUARIOS)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Select a from Agenda a left join a.usuarioAgendas ua where  a.unidade.ativo = true and ?1 in(ua.usuario)
    public static final String SQL_BUSCAR_AGENDAS_DO_USUARIO =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_usuario_agenda ua ON ua.id_agenda = a.id LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and ?1 in(ua.id_usuario)";

    public Uni<java.util.List<Agenda>> buscarAgendasDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDAS_DO_USUARIO, Agenda.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Select a from Agenda a left join a.usuarioAgendas ua where  a.unidade.ativo = true and ?1 in(ua.usuario)
    public static final String SQL_VERIFICA_AGENDAS_DO_USUARIO =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_usuario_agenda ua ON ua.id_agenda = a.id LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and ?1 in(ua.id_usuario) LIMIT 10";

    public Uni<java.util.List<Agenda>> verificaAgendasDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_AGENDAS_DO_USUARIO, Agenda.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select a from Agenda a where  a.unidade.ativo = true  order by a.descricao
    public static final String SQL_AUTO_COMPLETE_ALL =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteAll() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL, Agenda.class)

                        .getResultList());
    }


    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a  where  a.unidade.ativo = true and usu = ?2 and (lower(a.descricao) like '%' || ?1 || '%' OR str(a.id) = ?1) order by a.descricao
    public static final String SQL_AUTO_COMPLETE_COM_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and usu.id = ?2 and (lower(a.descricao) like '%' || ?1 || '%' OR CAST(a.id AS text) = ?1) ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteComUsuario(String query, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_USUARIO, Agenda.class)
                        .setParameter(1, query)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu = ?1 order by a.descricao
    public static final String SQL_AUTO_COMPLETE_DO_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and usu.id = ?1 ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_DO_USUARIO, Agenda.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and (usu.hierarquia = 'ESTRATEGICO' or usu = ?2) and (lower(a.descricao) like '%' || ?1 || '%' OR str(a.id) = ?1) order by a.descricao
    public static final String SQL_AUTO_COMPLETE_ESTRATEGICO_COM_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and (usu.hierarquia = 'ESTRATEGICO' or usu.id = ?2) and (lower(a.descricao) like '%' || ?1 || '%' OR CAST(a.id AS text) = ?1) ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteEstrategicoComUsuario(String query, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ESTRATEGICO_COM_USUARIO, Agenda.class)
                        .setParameter(1, query)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu.hierarquia = 'ESTRATEGICO' or usu = ?1 order by a.descricao
    public static final String SQL_AUTO_COMPLETE_ESTRATEGICO_DO_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and usu.hierarquia = 'ESTRATEGICO' or usu.id = ?1 ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteEstrategicoDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ESTRATEGICO_DO_USUARIO, Agenda.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // dialogPessoa (usuarios desta agenda). Tabelas de associacao sem entidade mapeada neste microsservico.
    private static final String SQL_LISTAR_AGENDA_RESULTADOS =
            "SELECT id_resultado FROM bas_agenda_resultado WHERE id_agenda = ?1 ORDER BY id_resultado";
    private static final String SQL_LIMPAR_AGENDA_RESULTADOS =
            "DELETE FROM bas_agenda_resultado WHERE id_agenda = ?1";
    private static final String SQL_INSERIR_AGENDA_RESULTADO =
            "INSERT INTO bas_agenda_resultado (id_agenda, id_resultado) VALUES (?1, ?2)";

    private static final String SQL_LISTAR_AGENDA_STATUS =
            "SELECT id_status FROM bas_agenda_status WHERE id_agenda = ?1 ORDER BY id_status";
    private static final String SQL_LIMPAR_AGENDA_STATUS =
            "DELETE FROM bas_agenda_status WHERE id_agenda = ?1";
    private static final String SQL_INSERIR_AGENDA_STATUS =
            "INSERT INTO bas_agenda_status (id_agenda, id_status) VALUES (?1, ?2)";

    private static final String SQL_LISTAR_AGENDA_USUARIOS =
            "SELECT id_usuario FROM bas_usuario_agenda WHERE id_agenda = ?1 ORDER BY id_usuario";
    private static final String SQL_LIMPAR_AGENDA_USUARIOS =
            "DELETE FROM bas_usuario_agenda WHERE id_agenda = ?1";
    private static final String SQL_INSERIR_AGENDA_USUARIO =
            "INSERT INTO bas_usuario_agenda (id_usuario, id_agenda, atender, iniciar, fechar, alterar, agendar) VALUES (?1, ?2, false, false, false, false, false)";

    public Uni<java.util.List<Long>> listarResultadosIds(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_AGENDA_RESULTADOS, Long.class)
                        .setParameter(1, agendaId)
                        .getResultList());
    }

    public Uni<Void> substituirResultados(Long agendaId, java.util.List<Long> resultados) {
        return substituirFilhos(SQL_LIMPAR_AGENDA_RESULTADOS, SQL_INSERIR_AGENDA_RESULTADO, agendaId, resultados);
    }

    public Uni<java.util.List<Long>> listarStatusIds(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_AGENDA_STATUS, Long.class)
                        .setParameter(1, agendaId)
                        .getResultList());
    }

    public Uni<Void> substituirStatus(Long agendaId, java.util.List<Long> statuses) {
        return substituirFilhos(SQL_LIMPAR_AGENDA_STATUS, SQL_INSERIR_AGENDA_STATUS, agendaId, statuses);
    }

    public Uni<java.util.List<Long>> listarUsuariosIds(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_AGENDA_USUARIOS, Long.class)
                        .setParameter(1, agendaId)
                        .getResultList());
    }

    public Uni<Void> substituirUsuarios(Long agendaId, java.util.List<Long> usuarios) {
        return substituirFilhos(SQL_LIMPAR_AGENDA_USUARIOS, SQL_INSERIR_AGENDA_USUARIO, agendaId, usuarios);
    }

    // Select u from Usuario u left join fetch u.usuarioAgendas where u = ?1  (vinculo do usuario logado com a agenda)
    public static final String SQL_BUSCAR_USUARIO_AGENDA =
            "SELECT ua.id FROM bas_usuario_agenda ua WHERE ua.id_usuario = ?1 AND ua.id_agenda = ?2";

    public Uni<Long> buscarUsuarioAgenda(Long usuarioId, Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_AGENDA)
                        .setParameter(1, usuarioId)
                        .setParameter(2, agendaId)
                        .getResultList())
                .map(list -> list.isEmpty() || list.get(0) == null
                        ? null
                        : ((Number) list.get(0)).longValue())
                .onItem().ifNull().failWith(() -> new jakarta.ws.rs.NotFoundException("Usuario agenda not found"));
    }

    private Uni<Void> substituirFilhos(String sqlLimpar, String sqlInserir, Long agendaId, java.util.List<Long> filhos) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sqlLimpar)
                        .setParameter(1, agendaId)
                        .executeUpdate()
                        .chain(ignored -> {
                            Uni<Void> insercoes = Uni.createFrom().voidItem();
                            for (Long filho : filhos) {
                                final Long filhoId = filho;
                                insercoes = insercoes.onItem().transformToUni(v ->
                                        session.createNativeQuery(sqlInserir)
                                                .setParameter(1, agendaId)
                                                .setParameter(2, filhoId)
                                                .executeUpdate()
                                                .map(i -> (Void) null));
                            }
                            return insercoes;
                        }));
    }

}
