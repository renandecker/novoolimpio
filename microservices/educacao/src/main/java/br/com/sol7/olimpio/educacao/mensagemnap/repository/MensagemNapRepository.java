package br.com.sol7.olimpio.educacao.mensagemnap;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class MensagemNapRepository implements PanacheRepository<MensagemNap> {

    // Select m from MensagemNap m where m.flagEmail=?1
    public static final String SQL_LISTAR_MODELOS_MENSAGENS =
            "SELECT m.* FROM edc_mensagem_nap m WHERE m.fl_email=?1";

    public Uni<java.util.List<MensagemNap>> listarModelosMensagens(Boolean email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_MODELOS_MENSAGENS, MensagemNap.class)
                        .setParameter(1, email)
                        .getResultList());
    }

}