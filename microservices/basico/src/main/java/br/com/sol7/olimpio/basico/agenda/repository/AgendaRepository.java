package br.com.sol7.olimpio.basico.agenda.repository;
import java.util.List;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.agenda.entity.Agenda;

@ApplicationScoped
public class AgendaRepository implements PanacheRepository<Agenda> {

    // Migrado de AgendaRepository.buscarAgendasPorUnidade (legado) - HQL original:
    // Select a from Agenda a where a.unidade.ativo = true and a.unidade = ?1
    public static final String SQL_BUSCAR_AGENDAS_POR_UNIDADE =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id_unidade = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendasPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDAS_POR_UNIDADE, Agenda.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.autoComplete (legado) - HQL original:
    // Select a from Agenda a where  a.unidade.ativo = true and str(a.id) = ?1 or lower(a.descricao) like '%' || ?1 || '%' order by a.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and CAST(a.id AS text) = ?1 or lower(a.descricao) like '%' || ?1 || '%' ORDER BY a.descricao";

    public Uni<java.util.List<Agenda>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Agenda.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de AgendaRepository.buscarAgendaComResultados (legado) - HQL original:
    // Select a from Agenda a left join fetch a.resultados where  a.unidade.ativo = true and a = ?1
    public static final String SQL_BUSCAR_AGENDA_COM_RESULTADOS =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendaComResultados(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA_COM_RESULTADOS, Agenda.class)
                    .setParameter(1, agendaId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.buscarAgendaComStatus (legado) - HQL original:
    // Select a from Agenda a left join fetch a.status where  a.unidade.ativo = true and a = ?1
    public static final String SQL_BUSCAR_AGENDA_COM_STATUS =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and a.id = ?1";

    public Uni<java.util.List<Agenda>> buscarAgendaComStatus(Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA_COM_STATUS, Agenda.class)
                    .setParameter(1, agendaId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.buscarAgendaComUsuarios (legado) - HQL original:
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


    // Migrado de AgendaRepository.buscarAgendasDoUsuario (legado) - HQL original:
    // Select a from Agenda a left join a.usuarioAgendas ua where  a.unidade.ativo = true and ?1 in(ua.usuario)
    public static final String SQL_BUSCAR_AGENDAS_DO_USUARIO =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_usuario_agenda ua ON ua.id_agenda = a.id LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and ?1 in(ua.id_usuario)";

    public Uni<java.util.List<Agenda>> buscarAgendasDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDAS_DO_USUARIO, Agenda.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.verificaAgendasDoUsuario (legado) - HQL original:
    // Select a from Agenda a left join a.usuarioAgendas ua where  a.unidade.ativo = true and ?1 in(ua.usuario)
    public static final String SQL_VERIFICA_AGENDAS_DO_USUARIO =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_usuario_agenda ua ON ua.id_agenda = a.id LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and ?1 in(ua.id_usuario) LIMIT 10";

    public Uni<java.util.List<Agenda>> verificaAgendasDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_AGENDAS_DO_USUARIO, Agenda.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.autoCompleteAll (legado) - HQL original:
    // select a from Agenda a where  a.unidade.ativo = true  order by a.descricao
    public static final String SQL_AUTO_COMPLETE_ALL =
            "SELECT a.* FROM bas_agenda a LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteAll() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL, Agenda.class)

                    .getResultList());
    }


    // Migrado de AgendaRepository.autoCompleteComUsuario (legado) - HQL original:
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


    // Migrado de AgendaRepository.autoCompleteDoUsuario (legado) - HQL original:
    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu = ?1 order by a.descricao
    public static final String SQL_AUTO_COMPLETE_DO_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and usu.id = ?1 ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_DO_USUARIO, Agenda.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }


    // Migrado de AgendaRepository.autoCompleteEstrategicoComUsuario (legado) - HQL original:
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


    // Migrado de AgendaRepository.autoCompleteEstrategicoDoUsuario (legado) - HQL original:
    // select distinct a from Usuario usu inner join usu.usuarioAgendas u inner join u.agenda a where  a.unidade.ativo = true and usu.hierarquia = 'ESTRATEGICO' or usu = ?1 order by a.descricao
    public static final String SQL_AUTO_COMPLETE_ESTRATEGICO_DO_USUARIO =
            "SELECT DISTINCT a.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda u ON u.id_usuario = usu.id INNER JOIN bas_agenda a ON a.id = u.id_agenda LEFT JOIN bas_unidade j_a_unidade ON j_a_unidade.id = a.id_unidade WHERE j_a_unidade.fl_ativo = true and usu.hierarquia = 'ESTRATEGICO' or usu.id = ?1 ORDER BY a.descricao LIMIT 10";

    public Uni<java.util.List<Agenda>> autoCompleteEstrategicoDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ESTRATEGICO_DO_USUARIO, Agenda.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }

}
