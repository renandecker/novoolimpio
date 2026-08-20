package br.com.sol7.olimpio.basico.pessoadocumento.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.pessoadocumento.entity.PessoaDocumento;

@ApplicationScoped
public class PessoaDocumentoRepository implements PanacheRepository<PessoaDocumento> {

    // Migrado de PessoaDocumentoRepository.buscarPessoaDocumento (legado) - HQL original:
    // select c from PessoaDocumento c where c.pessoa = ?1
    public static final String SQL_BUSCAR_PESSOA_DOCUMENTO =
            "SELECT c.* FROM bas_pessoa_documento c WHERE c.id_pessoa = ?1";

    public Uni<java.util.List<PessoaDocumento>> buscarPessoaDocumento(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_DOCUMENTO, PessoaDocumento.class)
                        .setParameter(1, pessoaId)
                        .getResultList());
    }

}