package br.com.sol7.olimpio.comercial.acao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class AcaoRepository implements PanacheRepository<Acao> {

    // select a from Acao a left join fetch a.acaoCampos as ac where a.id = ?1 order by ac.ordem
    public static final String SQL_BUSCAR_ACAO_COM_CAMPOS =
            "SELECT a.* FROM com_acao a LEFT JOIN com_acao_campo as ON as.id_acao = a.id WHERE a.id = ?1 ORDER BY ac.ordem";

    public Uni<java.util.List<Acao>> buscarAcaoComCampos(Integer idAcao) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ACAO_COM_CAMPOS, Acao.class)
                        .setParameter(1, idAcao)
                        .getResultList());
    }


    // select a from Acao a left join fetch a.unidades where a = ?1
    public static final String SQL_BUSCAR_ACAO_COM_UNIDADES =
            "SELECT a.* FROM com_acao a WHERE a.id = ?1";

    public Uni<java.util.List<Acao>> buscarAcaoComUnidades(Long acaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ACAO_COM_UNIDADES, Acao.class)
                        .setParameter(1, acaoId)
                        .getResultList());
    }


    // select distinct a from Acao a inner join a.unidades un  where (a.dataFinal is null OR current_date <= a.dataFinal) AND (a.descricao like '%' || ?1 || '%' OR str(a.id) = ?1)  AND un in (?2)
    public static final String SQL_AUTO_COMPLETE_EM_ABERTO =
            "SELECT DISTINCT a.* FROM com_acao a INNER JOIN com_acao_unidade a_un_jt ON a_un_jt.id_acao = a.id INNER JOIN bas_unidade un ON un.id = a_un_jt.id_unidade WHERE (a.data_final is null OR current_date <= a.data_final) AND (a.descricao like '%' || ?1 || '%' OR CAST(a.id AS text) = ?1) AND un in (?2)";

    public Uni<java.util.List<Acao>> autoCompleteEmAberto(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_EM_ABERTO, Acao.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select distinct a from Acao a left join a.prospectos p where (a.descricao like '%' || ?1 || '%' OR str(a.id) = ?1) AND p is not null
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT a.* FROM com_acao a LEFT JOIN com_historico_acoes a_p_jt ON a_p_jt.id_acao = a.id LEFT JOIN com_prospecto p ON p.id = a_p_jt.id_prospecto WHERE (a.descricao like '%' || ?1 || '%' OR CAST(a.id AS text) = ?1) AND p is not null";

    public Uni<java.util.List<Acao>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Acao.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select distinct a from Acao a inner join a.unidades un left join a.prospectos p where  p is not null AND un in (?1) order by a.id desc
    public static final String SQL_ACAO_UNIDADE =
            "SELECT DISTINCT a.* FROM com_acao a INNER JOIN com_acao_unidade a_un_jt ON a_un_jt.id_acao = a.id INNER JOIN bas_unidade un ON un.id = a_un_jt.id_unidade LEFT JOIN com_historico_acoes a_p_jt ON a_p_jt.id_acao = a.id LEFT JOIN com_prospecto p ON p.id = a_p_jt.id_prospecto WHERE p is not null AND un in (?1) ORDER BY a.id desc";

public Uni<java.util.List<Acao>> acaoUnidade(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ACAO_UNIDADE, Acao.class)
                        .setParameter(1, unidadeIds)
                        .getResultList());
    }


    // select a from Acao a left join fetch a.acaoCampos as ac where a.id = ?1 order by ac.ordem
    public static final String SQL_BUSCAR_CAMPOS_FORMULARIO_ACAO =
            "SELECT a.id AS acao_id, a.descricao AS descricao, c.id AS campo_id, c.rotulo AS rotulo, c.tipo AS tipo, "
            + "c.maskara AS maskara, c.tamanho AS tamanho, ac.obrigatorio AS obrigatorio, ac.ordem AS ordem, "
            + "ac.permitir_historico AS permitir_historico, c.flag_banco AS flag_banco, c.flag_nome AS flag_nome "
            + "FROM com_acao a "
            + "LEFT JOIN com_acao_campo ac ON ac.id_acao = a.id "
            + "LEFT JOIN com_campo c ON c.id = ac.id_campo "
            + "WHERE a.id = ?1 "
            + "ORDER BY ac.ordem";

    public Uni<java.util.List<Tuple>> buscarCamposFormularioAcao(Long acaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CAMPOS_FORMULARIO_ACAO, Tuple.class)
                        .setParameter(1, acaoId)
                        .getResultList());
    }

}
