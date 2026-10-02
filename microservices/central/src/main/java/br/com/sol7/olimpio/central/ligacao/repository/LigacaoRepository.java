package br.com.sol7.olimpio.central.ligacao;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;
import io.smallrye.mutiny.Uni;

import java.util.Date;

@ApplicationScoped
public class LigacaoRepository implements PanacheRepository<Ligacao> {

    // SELECT l FROM Ligacao l WHERE l.ordemLigacao.prospecto.id = ?1 and l.resultadoContato is not null and l.dataFinal is not null order by l.dataInicial desc
    public static final String SQL_BUSCAR_HISTORICO_LIGACAO =
            "SELECT l.* FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao LEFT JOIN com_prospecto j_j_l_ordemLigacao_prospecto ON j_j_l_ordemLigacao_prospecto.id = j_l_ordemLigacao.id_prospecto WHERE j_j_l_ordemLigacao_prospecto.id = ?1 and l.id_resultado_contato is not null and l.data_final is not null ORDER BY l.data_inicial desc LIMIT 10";

    public Uni<java.util.List<Ligacao>> buscarHistoricoLigacao(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HISTORICO_LIGACAO, Ligacao.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // SELECT l FROM Ligacao l WHERE l.ordemLigacao.prospecto.id = ?1 order by l.dataInicial desc
    public static final String SQL_BUSCAR_HISTORICO_TODAS_LIGACAO_PROSPECTO =
            "SELECT l.* FROM cen_ligacao l LEFT JOIN cen_ordem_ligacao j_l_ordemLigacao ON j_l_ordemLigacao.id = l.id_ordem_ligacao LEFT JOIN com_prospecto j_j_l_ordemLigacao_prospecto ON j_j_l_ordemLigacao_prospecto.id = j_l_ordemLigacao.id_prospecto WHERE j_j_l_ordemLigacao_prospecto.id = ?1 ORDER BY l.data_inicial desc";

    public Uni<java.util.List<Ligacao>> buscarHistoricoTodasLigacaoProspecto(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HISTORICO_TODAS_LIGACAO_PROSPECTO, Ligacao.class)
                        .setParameter(1, id)
                        .getResultList());
    }


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


    // select p from Prospecto p left join fetch p.prospectoCampos pc where p.unidade.ativo = true and p.id = ?1 order by pc.campo
    // (buscaProspectoComCampos mantem apenas o registro mais recente de alteracao de cada campo)
    public static final String SQL_BUSCAR_PROSPECTO_COM_CAMPOS =
            "SELECT c.id AS campo_id, c.rotulo AS rotulo, c.tipo AS tipo, cat.descricao AS categoria, pc.valor AS valor "
            + "FROM com_prospecto p "
            + "INNER JOIN bas_unidade un ON un.id = p.id_unidade AND un.fl_ativo = true "
            + "INNER JOIN com_prospecto_campo pc ON pc.id_prospecto = p.id "
            + "INNER JOIN com_campo c ON c.id = pc.id_campo "
            + "LEFT JOIN com_categoria cat ON cat.id = c.id_categoria "
            + "WHERE p.id = ?1 "
            + "AND NOT EXISTS (SELECT 1 FROM com_prospecto_campo pc2 WHERE pc2.id_prospecto = pc.id_prospecto "
            + "AND pc2.id_campo = pc.id_campo AND pc2.data_alteracao > pc.data_alteracao) "
            + "ORDER BY cat.id, c.rotulo";

    public Uni<java.util.List<Tuple>> buscarProspectoComCampos(Long prospectoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROSPECTO_COM_CAMPOS, Tuple.class)
                        .setParameter(1, prospectoId)
                        .getResultList());
    }

}