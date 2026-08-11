package br.com.sol7.olimpio.basico.cpfalunos.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.cpfalunos.entity.CpfAlunos;
@ApplicationScoped public class CpfAlunosRepository implements PanacheRepository<CpfAlunos> {

    // Migrado de CpfAlunosRepository.verificaExistenciaCpf (legado) - HQL original:
    // Select a from CpfAlunos a where a.cpf = ?1
    public static final String SQL_VERIFICA_EXISTENCIA_CPF =
            "SELECT a.* FROM bas_cpf_alunos_antigos a WHERE a.cpf = ?1";

    public Uni<java.util.List<CpfAlunos>> verificaExistenciaCpf(String cpf) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_EXISTENCIA_CPF, CpfAlunos.class)
                    .setParameter(1, cpf)
                    .getResultList());
    }


    // Migrado de CpfAlunosRepository.verificaExistenciaCpfComId (legado) - HQL original:
    // Select a from CpfAlunos a where a.cpf = ?1 and a.id <> ?2
    public static final String SQL_VERIFICA_EXISTENCIA_CPF_COM_ID =
            "SELECT a.* FROM bas_cpf_alunos_antigos a WHERE a.cpf = ?1 and a.id <> ?2 LIMIT 10";

    public Uni<java.util.List<CpfAlunos>> verificaExistenciaCpfComId(String cpf, int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_EXISTENCIA_CPF_COM_ID, CpfAlunos.class)
                    .setParameter(1, cpf)
                    .setParameter(2, id)
                    .getResultList());
    }

}