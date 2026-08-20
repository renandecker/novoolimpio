package br.com.sol7.olimpio.financeiro.configuracaocaixa;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ConfiguracaoCaixaRepository implements PanacheRepository<ConfiguracaoCaixa> {

    // Migrado de ConfiguracaoCaixaRepository.buscarConfiguracaoComUnidadeUsuario (legado) - HQL original:
    // Select c from ConfiguracaoCaixa c where c.usuario =?1 and c.unidade =?2 order by c.id desc
    public static final String SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO =
            "SELECT c.* FROM fin_configuracao_caixa c WHERE c.id_usuario =?1 and c.id_unidade =?2 ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoCaixa>> buscarConfiguracaoComUnidadeUsuario(Long usuarioId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO, ConfiguracaoCaixa.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // Migrado de ConfiguracaoCaixaRepository.buscarConfiguracaoComUsuario (legado) - HQL original:
    // Select c from ConfiguracaoCaixa c where c.usuario =?1 order by c.unidade.sucinto
    public static final String SQL_BUSCAR_CONFIGURACAO_COM_USUARIO =
            "SELECT c.* FROM fin_configuracao_caixa c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade WHERE c.id_usuario =?1 ORDER BY j_c_unidade.sucinto";

    public Uni<java.util.List<ConfiguracaoCaixa>> buscarConfiguracaoComUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIGURACAO_COM_USUARIO, ConfiguracaoCaixa.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Migrado de ConfiguracaoCaixaRepository.buscarConfiguracaoCaixaUnico (legado) - HQL original:
    // Select c from ConfiguracaoCaixa c where c.usuario =?1 and c.pagPropriaUnid = true order by c.unidade.sucinto
    public static final String SQL_BUSCAR_CONFIGURACAO_CAIXA_UNICO =
            "SELECT c.* FROM fin_configuracao_caixa c LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade WHERE c.id_usuario =?1 and c.pag_propria_unid = true ORDER BY j_c_unidade.sucinto";

    public Uni<java.util.List<ConfiguracaoCaixa>> buscarConfiguracaoCaixaUnico(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIGURACAO_CAIXA_UNICO, ConfiguracaoCaixa.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Migrado de ConfiguracaoCaixaRepository.buscarConfiguracaoComUnidadeUsuarioId (legado) - HQL original:
    // Select c from ConfiguracaoCaixa c where c.usuario =?1 and c.unidade =?2 and c <> ?3 order by c.id desc
    public static final String SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO_ID =
            "SELECT c.* FROM fin_configuracao_caixa c WHERE c.id_usuario =?1 and c.id_unidade =?2 and c.id <> ?3 ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoCaixa>> buscarConfiguracaoComUnidadeUsuarioId(Long usuarioId, Long unidadeId, Long configuracaoCaixaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO_ID, ConfiguracaoCaixa.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, unidadeId)
                        .setParameter(3, configuracaoCaixaId)
                        .getResultList());
    }

}