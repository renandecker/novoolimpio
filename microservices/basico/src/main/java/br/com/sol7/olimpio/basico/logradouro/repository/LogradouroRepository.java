package br.com.sol7.olimpio.basico.logradouro.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.logradouro.entity.Logradouro;
@ApplicationScoped public class LogradouroRepository implements PanacheRepository<Logradouro> {

    // Migrado de LogradouroService.atualizar() (legado, chamado por SchedulingService.tudo()) -
    // so a parte de limpeza (2 deletes); a parte que consulta o webservice dos Correios
    // (CorreioQualCep) para tentar completar o logradouro/bairro pelo CEP ficou de fora
    // (integracao externa) - ver RELATORIO_SCHEDULE.md.
    public static final String SQL_LIMPAR_LOGRADOUROS_ORFAOS =
            "DELETE FROM bas_logradouro log WHERE " +
            "not exists(select pes.id FROM bas_pessoa pes WHERE log.id = pes.id_logradouro) " +
            "and not exists(select pes.id FROM bas_unidade pes WHERE log.id = pes.id_logradouro)";
    public static final String SQL_LIMPAR_BAIRROS_ORFAOS =
            "DELETE FROM bas_bairro log WHERE " +
            "not exists(select pes.id FROM bas_logradouro pes WHERE log.id = pes.id_bairro)";

    public Uni<Void> limparOrfaosNativo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LIMPAR_LOGRADOUROS_ORFAOS).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_LIMPAR_BAIRROS_ORFAOS).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de LogradouroRepository.autoComplete (legado) - HQL original:
    // select distinct c from Logradouro c where lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1  order by c.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT c.* FROM bas_logradouro c WHERE lower(c.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Logradouro>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Logradouro.class)
                    .setParameter(1, lowerCase)
                    .getResultList());
    }


    // Migrado de LogradouroRepository.autoCompleteComBairro (legado) - HQL original:
    // select distinct c from Logradouro c where c.bairro = ?2 and (lower(c.descricao) like '%' || ?1 || '%')  order by c.descricao
    public static final String SQL_AUTO_COMPLETE_COM_BAIRRO =
            "SELECT DISTINCT c.* FROM bas_logradouro c WHERE c.id_bairro = ?2 and (lower(c.descricao) like '%' || ?1 || '%') ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Logradouro>> autoCompleteComBairro(String lowerCase, Long bairroId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_BAIRRO, Logradouro.class)
                    .setParameter(1, lowerCase)
                    .setParameter(2, bairroId)
                    .getResultList());
    }


    // Migrado de LogradouroRepository.buscaCep (legado) - HQL original:
    // select distinct c from Logradouro c where c.cep = ?1 order by c.descricao
    public static final String SQL_BUSCA_CEP =
            "SELECT DISTINCT c.* FROM bas_logradouro c WHERE c.cep = ?1 ORDER BY c.descricao";

    public Uni<java.util.List<Logradouro>> buscaCep(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_CEP, Logradouro.class)
                    .setParameter(1, lowerCase)
                    .getResultList());
    }


    // Migrado de LogradouroRepository.buscaLogradouro (legado) - HQL original:
    // select distinct c from Logradouro c where c.bairro = ?1
    public static final String SQL_BUSCA_LOGRADOURO =
            "SELECT DISTINCT c.* FROM bas_logradouro c WHERE c.id_bairro = ?1";

    public Uni<java.util.List<Logradouro>> buscaLogradouro(Long bairroId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_LOGRADOURO, Logradouro.class)
                    .setParameter(1, bairroId)
                    .getResultList());
    }


    // Migrado de LogradouroRepository.buscaLogradouroSemLogradouro (legado) - HQL original:
    // select distinct c from Logradouro c where c.descricao is null and c.cep is not null
    public static final String SQL_BUSCA_LOGRADOURO_SEM_LOGRADOURO =
            "SELECT DISTINCT c.* FROM bas_logradouro c WHERE c.descricao is null and c.cep is not null";

    public Uni<java.util.List<Logradouro>> buscaLogradouroSemLogradouro() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_LOGRADOURO_SEM_LOGRADOURO, Logradouro.class)

                    .getResultList());
    }

}