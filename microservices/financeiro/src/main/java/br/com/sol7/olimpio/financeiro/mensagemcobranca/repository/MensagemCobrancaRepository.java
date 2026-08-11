package br.com.sol7.olimpio.financeiro.mensagemcobranca;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class MensagemCobrancaRepository implements PanacheRepository<MensagemCobranca> {

    // Migrado de MensagemCobrancaRepository.listarModelosMensagens (legado) - HQL original:
    // Select m from MensagemCobranca m where m.flagEmail=?1
    public static final String SQL_LISTAR_MODELOS_MENSAGENS =
            "SELECT m.* FROM fin_mensagem_cobranca m WHERE m.fl_email=?1";

    public Uni<java.util.List<MensagemCobranca>> listarModelosMensagens(Boolean email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_MODELOS_MENSAGENS, MensagemCobranca.class)
                    .setParameter(1, email)
                    .getResultList());
    }

}