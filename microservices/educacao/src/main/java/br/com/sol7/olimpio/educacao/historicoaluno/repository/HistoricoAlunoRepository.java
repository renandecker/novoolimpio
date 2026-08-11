package br.com.sol7.olimpio.educacao.historicoaluno;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class HistoricoAlunoRepository implements PanacheRepository<HistoricoAluno> {

    // Migrado de HistoricoAlunoRepository.buscarHistoricoAlunoComCompromissos (legado) - HQL original:
    // select p from HistoricoAluno p left join fetch p.compromissos where p.id = ?1
    public static final String SQL_BUSCAR_HISTORICO_ALUNO_COM_COMPROMISSOS =
            "SELECT p.* FROM edc_historico_aluno p WHERE p.id = ?1";

    public Uni<java.util.List<HistoricoAluno>> buscarHistoricoAlunoComCompromissos(Long historico) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HISTORICO_ALUNO_COM_COMPROMISSOS, HistoricoAluno.class)
                    .setParameter(1, historico)
                    .getResultList());
    }

}