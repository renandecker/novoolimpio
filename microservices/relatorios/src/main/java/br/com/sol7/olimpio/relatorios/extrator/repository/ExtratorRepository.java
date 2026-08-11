package br.com.sol7.olimpio.relatorios.extrator;
import java.util.Date;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ExtratorRepository implements PanacheRepository<Extrator> {

    // Migrado de ExtratorService.remove() (legado, chamado por SchedulingService.tudo()) -
    // so a parte de banco (2 updates); a limpeza de arquivos temporarios em disco ficou de
    // fora porque nao faz sentido num microsservico stateless - ver RELATORIO_SCHEDULE.md.
    public static final String SQL_MARCAR_REMOVIDOS_ANTIGOS =
            "UPDATE rel_extrator SET situacao = 'Removido' where cast(data_fim as date) <= current_date-1 and data_fim is not null";
    public static final String SQL_MARCAR_REMOVIDOS_SEM_FIM =
            "UPDATE rel_extrator SET situacao = 'Removido', data_fim = data_inicio where cast(data_inicio as date) <= current_date-1 and data_fim is null";

    public Uni<Void> removerAntigosNativo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MARCAR_REMOVIDOS_ANTIGOS).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_MARCAR_REMOVIDOS_SEM_FIM).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de ExtratorRepository.listExtratornaFila (legado) - HQL original:
    // select r from Extrator r where  r.situacao = 'Na fila' order by id
    public static final String SQL_LIST_EXTRATORNA_FILA =
            "SELECT r.* FROM rel_extrator r WHERE r.situacao = 'Na fila' ORDER BY id";

    public Uni<java.util.List<Extrator>> listExtratornaFila() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LIST_EXTRATORNA_FILA, Extrator.class)

                    .getResultList());
    }


    // Migrado de ExtratorRepository.buscaTodosComCOnexao (legado) - HQL original:
    // select r from Extrator r where  r.tabela = ?1
    public static final String SQL_BUSCA_TODOS_COM_C_ONEXAO =
            "SELECT r.* FROM rel_extrator r WHERE r.id_tabela = ?1";

    public Uni<java.util.List<Extrator>> buscaTodosComCOnexao(Long tabelaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_TODOS_COM_C_ONEXAO, Extrator.class)
                    .setParameter(1, tabelaId)
                    .getResultList());
    }


    // Migrado de ExtratorRepository.buscaSituacaoExtrator (legado) - HQL original:
    // select r.situacao from Extrator r where  r = ?1
    public static final String SQL_BUSCA_SITUACAO_EXTRATOR =
            "SELECT r.situacao FROM rel_extrator r WHERE r.id = ?1";

    public Uni<java.util.List<Object>> buscaSituacaoExtrator(Long conexaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_SITUACAO_EXTRATOR)
                    .setParameter(1, conexaoId)
                    .getResultList());
    }


    // Migrado de ExtratorRepository.buscaEstratorComTabela (legado) - HQL original:
    // select r from Extrator r join r.tabela t where t = ?1
    public static final String SQL_BUSCA_ESTRATOR_COM_TABELA =
            "SELECT r.* FROM rel_extrator r INNER JOIN rel_tabela t ON t.id = r.id_tabela WHERE t.id = ?1";

    public Uni<java.util.List<Extrator>> buscaEstratorComTabela(Long tabelaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_ESTRATOR_COM_TABELA, Extrator.class)
                    .setParameter(1, tabelaId)
                    .getResultList());
    }

}