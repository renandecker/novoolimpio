package br.com.sol7.olimpio.educacao.nap;

import java.util.List;

import jakarta.persistence.Tuple;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class NAPRepository implements PanacheRepository<NAP> {

    // Migrado de NAPRepository.listaLigacaoNapComEtapa (legado) - HQL original:
    // select a from Nap a where a.contrato = ?1 and a.etapasNAP = ?2
    public static final String SQL_LISTA_LIGACAO_NAP_COM_ETAPA =
            "SELECT a.* FROM edc_nap a WHERE a.id_contrato = ?1 and a.id_etapas_nap = ?2";

    public Uni<java.util.List<NAP>> listaLigacaoNapComEtapa(Long contratoId, Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_NAP_COM_ETAPA)
                        .setParameter(1, contratoId)
                        .setParameter(2, etapasNAPId)
                        .getResultList())
                .map(rows -> rows.stream().map(this::mapToNAP).toList());
    }

    private NAP mapToNAP(Object row) {
        Tuple tuple = (Tuple) row;
        NAP nap = new NAP();
        nap.id = tuple.get("id", Long.class);
        nap.nome = tuple.get("nome", String.class);
        nap.dadosJson = tuple.get("dados_json", String.class);
        return nap;
    }


    // Migrado de NAPRepository.listaNapComEtapa (legado) - HQL original:
    // select a from Nap a where a.etapasNAP = ?1
    public static final String SQL_LISTA_NAP_COM_ETAPA =
            "SELECT a.id, a.nome, a.dados_json FROM edc_nap a WHERE a.id_etapas_nap = ?1";

    public Uni<java.util.List<NAP>> listaNapComEtapa(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_NAP_COM_ETAPA, Tuple.class)
                        .setParameter(1, etapasNAPId)
                        .getResultList())
                .map(rows -> rows.stream().map(this::mapToNAP).toList());
    }


    // Migrado de NAPRepository.listaNapSemEtapa (legado) - HQL original:
    // select a from Nap a where a.etapasNAP is null
    public static final String SQL_LISTA_NAP_SEM_ETAPA =
            "SELECT a.id, a.nome, a.dados_json FROM edc_nap a WHERE a.id_etapas_nap is null";

    public Uni<java.util.List<NAP>> listaNapSemEtapa() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_NAP_SEM_ETAPA, Tuple.class)
                        .getResultList())
                .map(rows -> rows.stream().map(this::mapToNAP).toList());
    }


    // Migrado de NAPRepository.buscaObjeto (legado) - HQL original:
    // select a from Nap a where a.id = ?1
    public static final String SQL_BUSCA_OBJETO =
            "SELECT a.id, a.nome, a.dados_json FROM edc_nap a WHERE a.id = ?1";

    public Uni<java.util.List<NAP>> buscaObjeto(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_OBJETO)
                        .setParameter(1, id)
                        .getResultList())
                .map(rows -> rows.stream().map(this::mapToNAP).toList());
    }

    // Migrado de NAPService.atualizaNapsContrato (legado) - chama CadernoComponenteCurricularService.tratarfrequencias
    public static final String SQL_ATUALIZA_NAPS_CONTRATO_1 =
            "UPDATE edc_matricula mmm SET " +
                    "id_caderno_ultimo = (SELECT cad.id FROM edc_oferecimento_componente_curricular ofe " +
                    "INNER JOIN edc_ocorrencia_componente_curricular oco ON (ofe.id = oco.id_oferecimento_componente_curricular) " +
                    "INNER JOIN edc_caderno_componente_curricular cad ON (cad.id_ocorrencia_componente_curricular = oco.id AND mat.id = cad.id_matricula) " +
                    "WHERE mat.id_oferecimento_componente_curricular = ofe.id AND oco.fl_ativo = true AND oco.data < current_date " +
                    "AND cad.presenca <> 'r' AND cad.presenca <> 'c' AND cad.presenca <> 'i' AND cad.presenca <> 'v' ORDER BY oco.data DESC LIMIT 1) " +
                    "FROM edc_matricula mat WHERE mat.id = mmm.id AND mat.id_contrato = ?1";

    public static final String SQL_ATUALIZA_NAPS_CONTRATO_2 =
            "UPDATE edc_contrato ccc SET " +
                    "id_caderno_ultimo = (SELECT mmm.id_caderno_ultimo FROM edc_matricula mmm " +
                    "INNER JOIN edc_oferecimento_componente_curricular ofe ON (ofe.id = mmm.id_oferecimento_componente_curricular) " +
                    "INNER JOIN edc_ocorrencia_componente_curricular oco ON (ofe.id = oco.id_oferecimento_componente_curricular) " +
                    "WHERE mat.id = mmm.id AND oco.fl_ativo = true AND oco.data < current_date " +
                    "ORDER BY oco.data DESC LIMIT 1) " +
                    "FROM edc_contrato con INNER JOIN edc_matricula mat ON (mat.id_contrato = con.id) WHERE ccc.id = con.id AND con.id = ?1";

    public Uni<Void> atualizaNapsContrato(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_NAPS_CONTRATO_1)
                        .setParameter(1, contratoId)
                        .executeUpdate())
                .chain(updated -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                        .chain(session2 -> session2.createNativeQuery(SQL_ATUALIZA_NAPS_CONTRATO_2)
                                .setParameter(1, contratoId)
                                .executeUpdate()))
                .replaceWithVoid();
    }

    // Migrado de NAPService.atualizaNapsContratoPresenca (legado) - chama CadernoComponenteCurricularService.atualizaUltimoCadernoMatricualComOferecimento
    public static final String SQL_ATUALIZA_NAPS_CONTRATO_PRESENCA_1 =
            "UPDATE edc_matricula mmm SET " +
                    "id_caderno_ultimo = (SELECT cad.id FROM edc_oferecimento_componente_curricular ofe " +
                    "INNER JOIN edc_ocorrencia_componente_curricular oco ON (ofe.id = oco.id_oferecimento_componente_curricular) " +
                    "INNER JOIN edc_caderno_componente_curricular cad ON (cad.id_ocorrencia_componente_curricular = oco.id AND mmm.id = cad.id_matricula) " +
                    "WHERE mmm.id_oferecimento_componente_curricular = ofe.id AND oco.fl_ativo = true AND oco.data < current_date " +
                    "AND cad.presenca <> 'r' AND cad.presenca <> 'c' AND cad.presenca <> 'i' AND cad.presenca <> 'v' ORDER BY oco.data DESC LIMIT 1) " +
                    "WHERE mmm.id_oferecimento_componente_curricular = ?1";

    public static final String SQL_ATUALIZA_NAPS_CONTRATO_PRESENCA_2 =
            "UPDATE edc_contrato ccc SET " +
                    "id_caderno_ultimo = (SELECT mmm.id_caderno_ultimo FROM edc_matricula mmm " +
                    "INNER JOIN edc_oferecimento_componente_curricular ofe ON (ofe.id = mmm.id_oferecimento_componente_curricular) " +
                    "INNER JOIN edc_ocorrencia_componente_curricular oco ON (ofe.id = oco.id_oferecimento_componente_curricular) " +
                    "WHERE mat.id = mmm.id AND oco.fl_ativo = true AND oco.data < current_date " +
                    "ORDER BY oco.data DESC LIMIT 1) " +
                    "FROM edc_contrato con INNER JOIN edc_matricula mat ON (mat.id_contrato = con.id) WHERE ccc.id = con.id AND mat.id_oferecimento_componente_curricular = ?1";

    public Uni<Void> atualizaNapsContratoPresenca(Integer idoferecimentoComponenteCurricular) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_NAPS_CONTRATO_PRESENCA_1)
                        .setParameter(1, idoferecimentoComponenteCurricular)
                        .executeUpdate())
                .chain(updated -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                        .chain(session2 -> session2.createNativeQuery(SQL_ATUALIZA_NAPS_CONTRATO_PRESENCA_2)
                                .setParameter(1, idoferecimentoComponenteCurricular)
                                .executeUpdate()))
                .replaceWithVoid();
    }

    // Migrado de NAPService.atualizaNapsContratoNota (legado)
    public static final String SQL_ATUALIZA_NAPS_CONTRATO_NOTA =
            "UPDATE edc_contrato ccc " +
                    "SET nota_executadas = 10 * (SELECT COUNT(a2.id) FROM edc_nota_componente_curricular_matricula a2 " +
                    "INNER JOIN edc_matricula m ON (a2.id_matricula = m.id) WHERE con.id = m.id_contrato AND nota IS NOT NULL AND nota > 0), " +
                    "nota_obtida = (SELECT SUM(COALESCE(a2.nota, 0)) FROM edc_matricula m INNER JOIN edc_nota_componente_curricular_matricula a2 ON (a2.id_matricula = m.id) WHERE ccc.id = m.id_contrato) " +
                    "FROM edc_contrato con " +
                    "INNER JOIN edc_matricula m ON (m.id_contrato = con.id) " +
                    "INNER JOIN edc_oferecimento_componente_curricular o ON (m.id_oferecimento_componente_curricular = o.id) " +
                    "WHERE con.desistente = false AND con.ativo = true AND con.id = ccc.id AND o.id = ?1";

    public Uni<Void> atualizaNapsContratoNota(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZA_NAPS_CONTRATO_NOTA)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de NAPService.obterHorarioAula (legado)
    public static final String SQL_OBTER_HORARIO_AULA =
            "SELECT te.string_inicio || ' até ' || te.string_fim " +
                    "FROM edc_ocorrencia_componente_curricular oco " +
                    "INNER JOIN edc_dia_aula da ON (oco.id_dia_aula = da.id) " +
                    "INNER JOIN edc_turno_educacao te ON (da.id_turno_educacao = te.id) " +
                    "WHERE oco.id = ?1";

    public Uni<String> obterHorarioAula(Long ocorrenciaComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_OBTER_HORARIO_AULA)
                        .setParameter(1, ocorrenciaComponenteCurricularId)
                        .getSingleResult())
                .onItem().transform(obj -> obj != null ? obj.toString() : "");
    }

}