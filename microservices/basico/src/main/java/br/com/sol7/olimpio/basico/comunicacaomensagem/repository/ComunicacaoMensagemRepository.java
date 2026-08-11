package br.com.sol7.olimpio.basico.comunicacaomensagem.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.comunicacaomensagem.entity.ComunicacaoMensagem;
@ApplicationScoped public class ComunicacaoMensagemRepository implements PanacheRepository<ComunicacaoMensagem> {

    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarioPara' nao encontrado em ComunicacaoMensagem)
    // Migrado de ComunicacaoMensagemRepository.mensagensUsuario (legado) - HQL original:
    public static final String SQL_MENSAGENS_USUARIO_HQL_ORIGINAL =
            "select u from ComunicacaoMensagem u where (u.usuarioPara = ?1 or u.usuarioDe = ?1)";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarioPara' nao encontrado em ComunicacaoMensagem)
    // Migrado de ComunicacaoMensagemRepository.comunicacoesNãoLidas (legado) - HQL original:
    public static final String SQL_COMUNICACOES_NÃO_LIDAS_HQL_ORIGINAL =
            "select count(u) from ComunicacaoMensagem u where (u.usuarioPara = ?1) and u.lido = false";

}