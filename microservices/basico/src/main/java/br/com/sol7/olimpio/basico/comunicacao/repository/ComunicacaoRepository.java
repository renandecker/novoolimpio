package br.com.sol7.olimpio.basico.comunicacao.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.comunicacao.entity.Comunicacao;
@ApplicationScoped public class ComunicacaoRepository implements PanacheRepository<Comunicacao> {

    // Migrado de ComunicacaoRepository.mensagensUsuario (legado) - HQL original:
    // select c from Comunicacao c where c.usuario = ?1
    public static final String SQL_MENSAGENS_USUARIO =
            "SELECT c.* FROM bas_comunicacao c WHERE c.id_usuario = ?1";

    public Uni<java.util.List<Comunicacao>> mensagensUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MENSAGENS_USUARIO, Comunicacao.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarUnidade (legado) - HQL original:
    // select c from Comunicacao c inner join c.unidades where u = ?1
    public static final String SQL_BUSCAR_UNIDADE =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarUnidade(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarPerfil (legado) - HQL original:
    // select c from Comunicacao c inner join c.perfis where u = ?1
    public static final String SQL_BUSCAR_PERFIL =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarPerfil(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERFIL, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarAgenda (legado) - HQL original:
    // select c from Comunicacao c inner join c.agendas where u = ?1
    public static final String SQL_BUSCAR_AGENDA =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarAgenda(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDA, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarPessoa (legado) - HQL original:
    // select c from Comunicacao c inner join c.pessoas where u = ?1
    public static final String SQL_BUSCAR_PESSOA =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarPessoa(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarUsuario (legado) - HQL original:
    // select c from Comunicacao c inner join c.usuarios where u = ?1
    public static final String SQL_BUSCAR_USUARIO =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarUsuario(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarComponente (legado) - HQL original:
    // select c from Comunicacao c inner join c.componentes where u = ?1
    public static final String SQL_BUSCAR_COMPONENTE =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarComponente(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTE, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarOferecimento (legado) - HQL original:
    // select c from Comunicacao c inner join c.oferecimentos where u = ?1
    public static final String SQL_BUSCAR_OFERECIMENTO =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarOferecimento(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OFERECIMENTO, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarGrupo (legado) - HQL original:
    // select c from Comunicacao c inner join c.grupos where u = ?1
    public static final String SQL_BUSCAR_GRUPO =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarGrupo(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_GRUPO, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }


    // Migrado de ComunicacaoRepository.buscarCurso (legado) - HQL original:
    // select c from Comunicacao c inner join c.curriculos where u = ?1
    public static final String SQL_BUSCAR_CURSO =
            "SELECT c.* FROM bas_comunicacao c WHERE u = ?1";

    public Uni<java.util.List<Comunicacao>> buscarCurso(Long comunicacaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CURSO, Comunicacao.class)
                    .setParameter(1, comunicacaoId)
                    .getResultList());
    }

}