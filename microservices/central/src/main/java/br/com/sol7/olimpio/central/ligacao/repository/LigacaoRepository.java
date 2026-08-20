package br.com.sol7.olimpio.central.ligacao;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.Date;

@ApplicationScoped
public class LigacaoRepository implements PanacheRepository<Ligacao> {

    // Migrado de LigacaoRepository.buscarHistoricoLigacao (legado) - HQL original:
    // SELECT l FROM Ligacao l WHERE l.ordemLigacao.prospecto.id = ?1 and l.resultadoContato is not null and l.dataFinal is not null order by l.dataInicial desc
    public static final String SQL_BUSCAR_HISTORICO_LIGACAO =
            "SELECT l.* FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao LEFT JOIN com_prospecto j_j_l_ordemLigacao_prospecto ON j_j_l_ordemLigacao_prospecto.id = j_l_ordemLigacao.id_prospecto WHERE j_j_l_ordemLigacao_prospecto.id = ?1 and l.id_resultado_contato is not null and l.data_final is not null ORDER BY l.data_inicial desc LIMIT 10";

    public Uni<java.util.List<Ligacao>> buscarHistoricoLigacao(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HISTORICO_LIGACAO, Ligacao.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Migrado de LigacaoRepository.buscarHistoricoTodasLigacaoProspecto (legado) - HQL original:
    // SELECT l FROM Ligacao l WHERE l.ordemLigacao.prospecto.id = ?1 order by l.dataInicial desc
    public static final String SQL_BUSCAR_HISTORICO_TODAS_LIGACAO_PROSPECTO =
            "SELECT l.* FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao LEFT JOIN com_prospecto j_j_l_ordemLigacao_prospecto ON j_j_l_ordemLigacao_prospecto.id = j_l_ordemLigacao.id_prospecto WHERE j_j_l_ordemLigacao_prospecto.id = ?1 ORDER BY l.data_inicial desc";

    public Uni<java.util.List<Ligacao>> buscarHistoricoTodasLigacaoProspecto(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HISTORICO_TODAS_LIGACAO_PROSPECTO, Ligacao.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Migrado de LigacaoRepository.buscarQtdeLigadosProspectoComResultadoOperacional (legado) - HQL original:
    // Select count(l.id) from Ligacao l where l.ordemLigacao.prospecto = ?1 and l.resultadoContato = ?2 and l.ordemLigacao.operacional = ?3
    public static final String SQL_BUSCAR_QTDE_LIGADOS_PROSPECTO_COM_RESULTADO_OPERACIONAL =
            "SELECT count(l.id) FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao WHERE j_l_ordemLigacao.id_prospecto = ?1 and l.id_resultado_contato = ?2 and j_l_ordemLigacao.id_operacional = ?3";

    public Uni<java.util.List<Object>> buscarQtdeLigadosProspectoComResultadoOperacional(Long prospectoId, Long resultadoContatoId, Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_QTDE_LIGADOS_PROSPECTO_COM_RESULTADO_OPERACIONAL)
                        .setParameter(1, prospectoId)
                        .setParameter(2, resultadoContatoId)
                        .setParameter(3, operacionalId)
                        .getResultList());
    }


    // Migrado de LigacaoRepository.resultadoPorOperacional (legado) - HQL original:
    // Select count(l.id) from Ligacao l where l.ordemLigacao.operacional = ?1 AND l.resultadoContato.id = ?2 AND l.usuario = ?3
    public static final String SQL_RESULTADO_POR_OPERACIONAL =
            "SELECT count(l.id) FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao LEFT JOIN cen_resultado_contato j_l_resultadoContato ON j_l_resultadoContato.id = l.id_resultado_contato WHERE j_l_ordemLigacao.id_operacional = ?1 AND j_l_resultadoContato.id = ?2 AND l.id_usuario = ?3";

    public Uni<java.util.List<Object>> resultadoPorOperacional(Long operacionalId, int resultadoContato, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_RESULTADO_POR_OPERACIONAL)
                        .setParameter(1, operacionalId)
                        .setParameter(2, resultadoContato)
                        .setParameter(3, usuarioId)
                        .getResultList());
    }


    // Migrado de LigacaoRepository.buscarLigacaoComNumero (legado) - HQL original:
    // SELECT l FROM Ligacao l left join fetch l.ordemLigacao ol WHERE l.usuario= ?1 AND l.telefoneDiscado=?2 order by l.dataInicial desc
    public static final String SQL_BUSCAR_LIGACAO_COM_NUMERO =
            "SELECT l.* FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao ol ON ol.id = l.id_ordem_ligacao WHERE l.id_usuario= ?1 AND l.telefone_discado=?2 ORDER BY l.data_inicial desc";

    public Uni<java.util.List<Ligacao>> buscarLigacaoComNumero(Long usuarioId, String numero) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LIGACAO_COM_NUMERO, Ligacao.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, numero)
                        .getResultList());
    }


    // Migrado de LigacaoRepository.resultadoPorData (legado) - HQL original:
    // Select count(l.id) from Ligacao l where date(l.dataInicial) = ?1 AND l.resultadoContato.id = ?2 AND l.usuario = ?3
    public static final String SQL_RESULTADO_POR_DATA =
            "SELECT count(l.id) FROM cen_ligacao l LEFT JOIN cen_resultado_contato j_l_resultadoContato ON j_l_resultadoContato.id = l.id_resultado_contato WHERE date(l.data_inicial) = ?1 AND j_l_resultadoContato.id = ?2 AND l.id_usuario = ?3";

    public Uni<java.util.List<Object>> resultadoPorData(Date data, int resultadoContato, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_RESULTADO_POR_DATA)
                        .setParameter(1, data)
                        .setParameter(2, resultadoContato)
                        .setParameter(3, usuarioId)
                        .getResultList());
    }

}