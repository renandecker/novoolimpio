package br.com.sol7.olimpio.financeiro.mensagem;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class MensagemRepository implements PanacheRepository<Mensagem> {

    // Select m from Mensagem m where m.flagEmail=?1
    public static final String SQL_LISTAR_MODELOS_MENSAGENS =
            "SELECT m.* FROM fin_mensagem m WHERE m.fl_email=?1";

    public Uni<java.util.List<Mensagem>> listarModelosMensagens(Boolean email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_MODELOS_MENSAGENS, Mensagem.class)
                        .setParameter(1, email)
                        .getResultList());
    }

}