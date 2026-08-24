package br.com.sol7.olimpio.basico.unidade.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.unidade.entity.Unidade;

@ApplicationScoped
public class UnidadeRepository implements PanacheRepository<Unidade> {

    // Migrado de UnidadeRepository.autoCompleteComUnidades (legado) - HQL original:
    // select distinct  u from Curriculo usu inner join usu.unidades u  where (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nomeFantasia) like '%' || ?1 || '%'  OR lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1)  and u in (?2) order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADES =
            "SELECT DISTINCT u.* FROM edc_curriculo usu INNER JOIN edc_curriculo_unidade usu_u_jt ON usu_u_jt.id_curriculo = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nome_fantasia) like '%' || ?1 || '%' OR lower(u.cnpj) like '%' || ?1 || '%' OR lower(u.razao_social) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1) and u in (?2) ORDER BY u.sucinto";

    public Uni<java.util.List<Unidade>> autoCompleteComUnidades(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADES, Unidade.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteComUsuario (legado) - HQL original:
    // select distinct  u from Usuario usu inner join usu.unidades u where usu = ?2 and (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nomeFantasia) like '%' || ?1 || '%'  OR lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1) order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_COM_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE usu.id = ?2 and (lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nome_fantasia) like '%' || ?1 || '%' OR lower(u.cnpj) like '%' || ?1 || '%' OR lower(u.razao_social) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1) ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Unidade>> autoCompleteComUsuario(String query, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_USUARIO, Unidade.class)
                        .setParameter(1, query)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoComplete (legado) - HQL original:
    // select u from Unidade u where lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nomeFantasia) like '%' || ?1 || '%' OR lower(u.CNPJ) like '%' || ?1 || '%'  OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1 order by u.sucinto
    public static final String SQL_AUTO_COMPLETE =
            "SELECT u.* FROM bas_unidade u WHERE lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.nome_fantasia) like '%' || ?1 || '%' OR lower(u.cnpj) like '%' || ?1 || '%' OR lower(u.razao_social) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1 ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Unidade>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Unidade.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteAll (legado) - HQL original:
    // select u from Unidade u order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_ALL =
            "SELECT u.* FROM bas_unidade u ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Unidade>> autoCompleteAll() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL, Unidade.class)

                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarTodos (legado) - HQL original:
    // select u from Unidade u order by u.sucinto
    public static final String SQL_BUSCAR_TODOS =
            "SELECT u.* FROM bas_unidade u ORDER BY u.sucinto";

    public Uni<java.util.List<Unidade>> buscarTodos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TODOS, Unidade.class)

                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidadeComTelefones (legado) - HQL original:
    // select u from Unidade u left join fetch u.telefones where u = ?1
    public static final String SQL_BUSCAR_UNIDADE_COM_TELEFONES =
            "SELECT u.* FROM bas_unidade u WHERE u.id = ?1";

    public Uni<java.util.List<Unidade>> buscarUnidadeComTelefones(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE_COM_TELEFONES, Unidade.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteComCurriculoSemBusca (legado) - HQL original:
    // select distinct u from Curriculo usu inner join usu.unidades u where u in (?1) order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_COM_CURRICULO_SEM_BUSCA =
            "SELECT DISTINCT u.* FROM edc_curriculo usu INNER JOIN edc_curriculo_unidade usu_u_jt ON usu_u_jt.id_curriculo = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE u in (?1) ORDER BY u.sucinto";

    public Uni<java.util.List<Unidade>> autoCompleteComCurriculoSemBusca(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_CURRICULO_SEM_BUSCA, Unidade.class)
                        .setParameter(1, unidadesIds)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidadeComTurnosDiaSemana (legado) - HQL original:
    // Select distinct  u from Usuario usu inner join usu.unidades u left join fetch u.turnoTrabalhos tt where tt.diaSemana.id = ?1 and usu = ?2 order by tt.inicio
    public static final String SQL_BUSCAR_UNIDADE_COM_TURNOS_DIA_SEMANA =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade LEFT JOIN bas_unidade_turno u_tt_jt ON u_tt_jt.id_unidade = u.id LEFT JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE j_tt_diaSemana.id = ?1 and usu.id = ?2 ORDER BY tt.inicio";

    public Uni<java.util.List<Unidade>> buscarUnidadeComTurnosDiaSemana(int diaSemana, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE_COM_TURNOS_DIA_SEMANA, Unidade.class)
                        .setParameter(1, diaSemana)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteDoUsuario (legado) - HQL original:
    // select distinct  u from Usuario usu inner join usu.unidades u where usu = ?1 order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_DO_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE usu.id = ?1 ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Unidade>> autoCompleteDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_DO_USUARIO, Unidade.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidadeComTurnos (legado) - HQL original:
    // Select u from Unidade u left join fetch u.turnoTrabalhos t where u = ?1 order by t.diaSemana, t.descricao
    public static final String SQL_BUSCAR_UNIDADE_COM_TURNOS =
            "SELECT u.* FROM bas_unidade u LEFT JOIN bas_unidade_turno u_t_jt ON u_t_jt.id_unidade = u.id LEFT JOIN cen_turno_trabalho t ON t.id = u_t_jt.id_turno WHERE u.id = ?1 ORDER BY t.id_dia_semana, t.descricao";

    public Uni<java.util.List<Unidade>> buscarUnidadeComTurnos(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE_COM_TURNOS, Unidade.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidade (legado) - HQL original:
    // select u from Unidade u where u.regiao = ?1
    public static final String SQL_BUSCAR_UNIDADE =
            "SELECT u.* FROM bas_unidade u WHERE u.id_regiao = ?1";

    public Uni<java.util.List<Unidade>> buscarUnidade(Long regiaoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE, Unidade.class)
                        .setParameter(1, regiaoId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidades (legado) - HQL original:
    // select u from Unidade u order by u.sucinto
    public static final String SQL_BUSCAR_UNIDADES =
            "SELECT u.* FROM bas_unidade u ORDER BY u.sucinto";

    public Uni<java.util.List<Unidade>> buscarUnidades() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADES, Unidade.class)

                        .getResultList());
    }


    // Migrado de UnidadeRepository.buscarUnidadeDaLigacao (legado) - HQL original:
    // select op.pacote.unidade from Operacional op left join fetch op.pacote.unidade.telefones where op= ?1
    public static final String SQL_BUSCAR_UNIDADE_DA_LIGACAO =
            "SELECT j_op_pacote.id_unidade FROM cen_operacional op LEFT JOIN com_pacote j_op_pacote ON j_op_pacote.id = op.id_pacote WHERE op.id= ?1";

    public Uni<java.util.List<Object>> buscarUnidadeDaLigacao(Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADE_DA_LIGACAO)
                        .setParameter(1, operacionalId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteGrupo (legado) - HQL original:
    // select distinct u from OferecimentoComponenteCurricular oo, Unidade u where  oo.unidade = u and oo.grupo = ?2 and lower(u.sucinto) like '%' || ?1 || '%' OR  lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1 order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_GRUPO =
            "SELECT DISTINCT u FROM edc_oferecimento_componente_curricular oo WHERE oo.id_unidade = u and oo.id_grupo = ?2 and lower(u.sucinto) like '%' || ?1 || '%' OR lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1 ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteGrupo(String query, Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_GRUPO)
                        .setParameter(1, query)
                        .setParameter(2, grupoId)
                        .getResultList());
    }


    // Migrado de UnidadeRepository.autoCompleteAllGrupo (legado) - HQL original:
    // select distinct u from OferecimentoComponenteCurricular oo, Unidade u where oo.unidade = u and oo.grupo = ?1  order by u.sucinto
    public static final String SQL_AUTO_COMPLETE_ALL_GRUPO =
            "SELECT DISTINCT u FROM edc_oferecimento_componente_curricular oo WHERE oo.id_unidade = u and oo.id_grupo = ?1 ORDER BY u.sucinto LIMIT 10";

    public Uni<java.util.List<Object>> autoCompleteAllGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL_GRUPO)
                        .setParameter(1, grupoId)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (alias 'usu' desconhecido no join)
    // Migrado de UnidadeRepository.autoCompleteDoUsuarioGrupo (legado) - HQL original:
    public static final String SQL_AUTO_COMPLETE_DO_USUARIO_GRUPO_HQL_ORIGINAL =
            "select distinct  u from OferecimentoComponenteCurricular oo, Usuario usu inner join usu.unidades u  where oo.unidade = u and oo.grupo = ?2 and usu = ?1 order by u.sucinto";


    // NAO TRADUZIDA AUTOMATICAMENTE (alias 'usu' desconhecido no join)
    // Migrado de UnidadeRepository.autoCompleteComUsuarioGrupo (legado) - HQL original:
    public static final String SQL_AUTO_COMPLETE_COM_USUARIO_GRUPO_HQL_ORIGINAL =
            "select distinct  u from OferecimentoComponenteCurricular oo, Usuario usu inner join usu.unidades u  where oo.unidade = u and oo.grupo = ?3 and usu = ?2 and (lower(u.sucinto) like '%' || ?1 || '%' OR  lower(u.CNPJ) like '%' || ?1 || '%' OR lower(u.razaoSocial) like '%' || ?1 || '%' OR str(u.id) = ?1) order by u.sucinto";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'unidades' sem coluna mapeada)
    // Migrado de UnidadeRepository.buscaUnidadesComRede (legado) - HQL original:
    public static final String SQL_BUSCA_UNIDADES_COM_REDE_HQL_ORIGINAL =
            "select distinct r.unidades from Rede r where r = ?1";

}