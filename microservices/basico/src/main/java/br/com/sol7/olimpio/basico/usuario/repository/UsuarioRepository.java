package br.com.sol7.olimpio.basico.usuario.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.Date;
import java.util.List;

import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.perfil.entity.Perfil;
import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;
import br.com.sol7.olimpio.basico.unidade.entity.Unidade;
import br.com.sol7.olimpio.basico.usuario.entity.Usuario;

@ApplicationScoped
public class UsuarioRepository implements PanacheRepository<Usuario> {

    // select distinct u from Usuario u join fetch u.unidades where u = ?1 and u.ativo = true
    public static final String SQL_FETCH =
            "SELECT DISTINCT u.* FROM bas_usuario u WHERE u.id = ?1 and u.fl_ativo = true";

    public Uni<java.util.List<Usuario>> fetch(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FETCH, Usuario.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select distinct u from Pessoa u inner join u.unidades un where un = ?2  and un.ativo = true and lower(u.pessoaFisica.nome) like '%' || ?1 || '%' or lower(u.pessoaFisica.cpf) like '%' || ?1 || '%'
    public static final String SQL_AUTO_COMPLETE_PESSOA_FISICA_UNIDADE =
            "SELECT DISTINCT u.* FROM bas_pessoa u INNER JOIN bas_pessoa_unidade u_un_jt ON u_un_jt.id_pessoa = u.id INNER JOIN bas_unidade un ON un.id = u_un_jt.id_unidade LEFT JOIN bas_pessoa_fisica j_u_pessoaFisica ON j_u_pessoaFisica.id_pessoa = u.id WHERE un.id = ?2 and un.fl_ativo = true and lower(j_u_pessoaFisica.nome) like '%' || ?1 || '%' or lower(j_u_pessoaFisica.cpf) like '%' || ?1 || '%' LIMIT 10";

    public Uni<java.util.List<Pessoa>> autoCompletePessoaFisicaUnidade(String query, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PESSOA_FISICA_UNIDADE, Pessoa.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // select distinct u from Pessoa u inner join u.unidades un where un = ?2  and un.ativo = true and lower(u.pessoaJuridica.cnpj) like '%' || ?1 || '%' or lower(u.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%'
    public static final String SQL_AUTO_COMPLETE_PESSOA_JURIDICA_UNIDADE =
            "SELECT DISTINCT u.* FROM bas_pessoa u INNER JOIN bas_pessoa_unidade u_un_jt ON u_un_jt.id_pessoa = u.id INNER JOIN bas_unidade un ON un.id = u_un_jt.id_unidade LEFT JOIN bas_pessoa_juridica j_u_pessoaJuridica ON j_u_pessoaJuridica.id_pessoa = u.id WHERE un.id = ?2 and un.fl_ativo = true and lower(j_u_pessoaJuridica.cnpj) like '%' || ?1 || '%' or lower(j_u_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' LIMIT 10";

    public Uni<java.util.List<Pessoa>> autoCompletePessoaJuridicaUnidade(String query, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PESSOA_JURIDICA_UNIDADE, Pessoa.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // select distinct u from Usuario u left join fetch u.perfis where u.ativo = true and u.login = ?1 and u.senha = ?2
    public static final String SQL_FIND_BY_LOGIN_AND_SENHA =
            "SELECT DISTINCT u.* FROM bas_usuario u WHERE u.fl_ativo = true and u.login = ?1 and u.senha = ?2";

    public Uni<java.util.List<Usuario>> findByLoginAndSenha(String login, String senha) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_BY_LOGIN_AND_SENHA, Usuario.class)
                        .setParameter(1, login)
                        .setParameter(2, senha)
                        .getResultList());
    }


    // select distinct u from Usuario u  where u.ativo = true and u.pessoa.email = ?1 and u.login = ?2
    public static final String SQL_FIND_BY_EMAIL_AND_LOGIN =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa WHERE u.fl_ativo = true and j_u_pessoa.email = ?1 and u.login = ?2";

    public Uni<java.util.List<Usuario>> findByEmailAndLogin(String email, String login) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_BY_EMAIL_AND_LOGIN, Usuario.class)
                        .setParameter(1, email)
                        .setParameter(2, login)
                        .getResultList());
    }


    // select distinct u from Usuario u left join fetch u.perfis p where u.ativo = true and u.login = ?1 and p = ?3 and u.senha = ?2
    public static final String SQL_FIND_BY_LOGIN_AND_SENHA_COM_PERFIL =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id LEFT JOIN bas_perfil p ON p.id = u_p_jt.id_perfil WHERE u.fl_ativo = true and u.login = ?1 and p.id = ?3 and u.senha = ?2";

    public Uni<java.util.List<Usuario>> findByLoginAndSenhaComPerfil(String login, String senha, Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_BY_LOGIN_AND_SENHA_COM_PERFIL, Usuario.class)
                        .setParameter(1, login)
                        .setParameter(2, senha)
                        .setParameter(3, perfilId)
                        .getResultList());
    }


    // select distinct u from Usuario u inner join u.perfis p inner join u.unidades uni where u.ativo = true  and uni.ativo = true and u.login = ?1 and p = ?3 and u.senha = ?2 and uni = ?4
    public static final String SQL_FIND_BY_LOGIN_AND_SENHA_COM_PERFIL_UNIDADE =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_perfil p ON p.id = u_p_jt.id_perfil INNER JOIN bas_usuario_unidade u_uni_jt ON u_uni_jt.id_usuario = u.id INNER JOIN bas_unidade uni ON uni.id = u_uni_jt.id_unidade WHERE u.fl_ativo = true and uni.fl_ativo = true and u.login = ?1 and p.id = ?3 and u.senha = ?2 and uni.id = ?4";

    public Uni<java.util.List<Usuario>> findByLoginAndSenhaComPerfilUnidade(String login, String senha, Long perfilId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_BY_LOGIN_AND_SENHA_COM_PERFIL_UNIDADE, Usuario.class)
                        .setParameter(1, login)
                        .setParameter(2, senha)
                        .setParameter(3, perfilId)
                        .setParameter(4, unidadeId)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.pessoaFisica.cpf = ?1 and u <> ?2
    public static final String SQL_EXISTENCIA_USUARIO_COM_CPF_COM_USUARIO =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.cpf = ?1 and u.id <> ?2";

    public Uni<java.util.List<Object>> existenciaUsuarioComCpfComUsuario(String cpf, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_CPF_COM_USUARIO)
                        .setParameter(1, cpf)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.pessoaFisica.cpf = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_CPF =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.cpf = ?1";

    public Uni<java.util.List<Object>> existenciaUsuarioComCpf(String cpf) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_CPF)
                        .setParameter(1, cpf)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.pessoaFisica.rg = ?1 and u <> ?2
    public static final String SQL_EXISTENCIA_USUARIO_COM_RG_COM_USUARIO =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.rg = ?1 and u.id <> ?2";

    public Uni<java.util.List<Object>> existenciaUsuarioComRgComUsuario(String rg, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_RG_COM_USUARIO)
                        .setParameter(1, rg)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.pessoaFisica.rg = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_RG =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_u_pessoa_pessoaFisica ON j_j_u_pessoa_pessoaFisica.id_pessoa = j_u_pessoa.id WHERE j_j_u_pessoa_pessoaFisica.rg = ?1";

    public Uni<java.util.List<Object>> existenciaUsuarioComRg(String rg) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_RG)
                        .setParameter(1, rg)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.email = ?1 and u <> ?2
    public static final String SQL_EXISTENCIA_USUARIO_COM_EMAIL_COM_USUARIO =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa WHERE j_u_pessoa.email = ?1 and u.id <> ?2";

    public Uni<java.util.List<Object>> existenciaUsuarioComEmailComUsuario(String email, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_EMAIL_COM_USUARIO)
                        .setParameter(1, email)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select u.pessoa from Usuario u where u.pessoa.email = ?1
    public static final String SQL_EXISTENCIA_USUARIO_COM_EMAIL =
            "SELECT u.id_pessoa FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa WHERE j_u_pessoa.email = ?1";

    public Uni<java.util.List<Object>> existenciaUsuarioComEmail(String email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTENCIA_USUARIO_COM_EMAIL)
                        .setParameter(1, email)
                        .getResultList());
    }


    // select distinct u from Usuario u, UsuarioAgenda ua left join fetch u.unidades un inner join u.turnoTrabalhos tt where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true  and ua.atender = true  and ua.usuario = u AND un in (?2) AND tt.diaSemana.id = ?3 and ua.agenda = ?4 order by u.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_AGENDA =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id LEFT JOIN bas_unidade un ON un.id = u_un_jt.id_unidade INNER JOIN cen_turno_usuario u_tt_jt ON u_tt_jt.id_usuario = u.id INNER JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE un.fl_ativo = true and ( lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.fl_ativo = true and ua.atender = true and ua.usuario = u AND un in (?2) AND j_tt_diaSemana.id = ?3 and ua.agenda = ?4 ORDER BY u.login";

    public Uni<java.util.List<Usuario>> autoCompleteComUnidadeDiaSemanaAgenda(String query, List<Long> unidadesIds, int diaSemana, Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_AGENDA, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, diaSemana)
                        .setParameter(4, agendaId)
                        .getResultList());
    }


    // select distinct u from Usuario u left join fetch u.unidades un inner join u.turnoTrabalhos tt where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true  AND un in (?2) AND tt.diaSemana.id = ?3 order by u.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id LEFT JOIN bas_unidade un ON un.id = u_un_jt.id_unidade INNER JOIN cen_turno_usuario u_tt_jt ON u_tt_jt.id_usuario = u.id INNER JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE un.fl_ativo = true and ( lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.fl_ativo = true AND un in (?2) AND j_tt_diaSemana.id = ?3 ORDER BY u.login";

    public Uni<java.util.List<Usuario>> autoCompleteComUnidadeDiaSemana(String query, List<Long> unidadesIds, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, diaSemana)
                        .getResultList());
    }


    // select distinct u from Usuario u, UsuarioAgenda ua inner join u.unidades un inner join u.perfis p  inner join u.turnoTrabalhos tt where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true  and ua.atender = true  and ua.usuario = u AND un in (?2) AND tt.diaSemana.id = ?3 and ua.agenda = ?4 and p = ?5 order by u.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_AGENDA_COM_PERFIL =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id INNER JOIN bas_unidade un ON un.id = u_un_jt.id_unidade INNER JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_perfil p ON p.id = u_p_jt.id_perfil INNER JOIN cen_turno_usuario u_tt_jt ON u_tt_jt.id_usuario = u.id INNER JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE un.fl_ativo = true and ( lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.fl_ativo = true and ua.atender = true and ua.usuario = u AND un in (?2) AND j_tt_diaSemana.id = ?3 and ua.agenda = ?4 and p.id = ?5 ORDER BY u.login";

    public Uni<java.util.List<Usuario>> autoCompleteComUnidadeDiaSemanaAgendaComPerfil(String query, List<Long> unidadesIds, int diaSemana, Long agendaId, Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_AGENDA_COM_PERFIL, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, diaSemana)
                        .setParameter(4, agendaId)
                        .setParameter(5, perfilId)
                        .getResultList());
    }


    // select distinct u from Usuario u inner join u.unidades un inner join u.perfis p inner join u.turnoTrabalhos tt where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true  AND un in (?2) AND tt.diaSemana.id = ?3 and p = ?4 order by u.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_COM_PERFIL =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id INNER JOIN bas_unidade un ON un.id = u_un_jt.id_unidade INNER JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_perfil p ON p.id = u_p_jt.id_perfil INNER JOIN cen_turno_usuario u_tt_jt ON u_tt_jt.id_usuario = u.id INNER JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE un.fl_ativo = true and ( lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.fl_ativo = true AND un in (?2) AND j_tt_diaSemana.id = ?3 and p.id = ?4 ORDER BY u.login";

    public Uni<java.util.List<Usuario>> autoCompleteComUnidadeDiaSemanaComPerfil(String query, List<Long> unidadesIds, int diaSemana, Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE_DIA_SEMANA_COM_PERFIL, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, diaSemana)
                        .setParameter(4, perfilId)
                        .getResultList());
    }


    // Select distinct u from Usuario u left join fetch u.turnoTrabalhos tt inner join u.usuarioAgendas ag where ag.agenda in (?1) AND tt.diaSemana.id = ?2 and u.ativo = true and ag.atender = true order by tt.inicio
    public static final String SQL_BUSCAR_CONSULTORES_COM_AGENDA =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN cen_turno_usuario u_tt_jt ON u_tt_jt.id_usuario = u.id LEFT JOIN cen_turno_trabalho tt ON tt.id = u_tt_jt.id_turno INNER JOIN bas_usuario_agenda ag ON ag.id_usuario = u.id LEFT JOIN bas_dia_semana j_tt_diaSemana ON j_tt_diaSemana.id = tt.id_dia_semana WHERE ag.id_agenda in (?1) AND j_tt_diaSemana.id = ?2 and u.fl_ativo = true and ag.atender = true ORDER BY tt.inicio";

    public Uni<java.util.List<Usuario>> buscarConsultoresComAgenda(Long agendaId, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONSULTORES_COM_AGENDA, Usuario.class)
                        .setParameter(1, agendaId)
                        .setParameter(2, diaSemana)
                        .getResultList());
    }


    // select u from Usuario u where (lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and u.ativo = true order by u.login
    public static final String SQL_AUTO_COMPLETE =
            "SELECT u.* FROM bas_usuario u WHERE (lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.fl_ativo = true ORDER BY u.login LIMIT 10";

    public Uni<java.util.List<Usuario>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Usuario.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select u from Usuario u where u.ativo = true order by u.login
    public static final String SQL_BUSCA_TODOS =
            "SELECT u.* FROM bas_usuario u WHERE u.fl_ativo = true ORDER BY u.login LIMIT 10";

    public Uni<java.util.List<Usuario>> buscaTodos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_TODOS, Usuario.class)

                        .getResultList());
    }


    // select distinct u from Usuario u left join u.unidades un where un.ativo = true and (lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1) and un in (?2) and u.ativo = true order by u.login
    public static final String SQL_AUTO_COMPLETE_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id LEFT JOIN bas_unidade un ON un.id = u_un_jt.id_unidade WHERE un.fl_ativo = true and (lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and un in (?2) and u.fl_ativo = true ORDER BY u.login LIMIT 10";

    public Uni<java.util.List<Usuario>> autoCompleteUsuario(String query, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_USUARIO, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // select distinct ou.operador from OperacionalUsuario ou inner join ou.operacional op where op.coordenador = ?1 AND ou.operador.ativo = true
    public static final String SQL_EQUIPE_DO_COORDENADOR =
            "SELECT DISTINCT ou.id_usuario FROM cen_operacional_usuario ou INNER JOIN cen_operacional op ON op.id = ou.id_operacional LEFT JOIN bas_usuario j_ou_operador ON j_ou_operador.id = ou.id_usuario WHERE op.id_coordenador = ?1 AND j_ou_operador.fl_ativo = true";

    public Uni<java.util.List<Object>> equipeDoCoordenador(Long coordenadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EQUIPE_DO_COORDENADOR)
                        .setParameter(1, coordenadorId)
                        .getResultList());
    }


    // select distinct ou.operador from OperacionalUsuario ou where ou.operador.ativo = true
    public static final String SQL_EQUIPE_DE_TELEMARKETING =
            "SELECT DISTINCT ou.id_usuario FROM cen_operacional_usuario ou LEFT JOIN bas_usuario j_ou_operador ON j_ou_operador.id = ou.id_usuario WHERE j_ou_operador.fl_ativo = true";

    public Uni<java.util.List<Object>> equipeDeTelemarketing() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EQUIPE_DE_TELEMARKETING)

                        .getResultList());
    }


    // SELECT distinct ou.operador from OperacionalUsuario ou inner join ou.operacional op  where op.coordenador =?1 AND op.status ='INICIADO'  AND ou.operador Not in (Select m.operador from Meta m where m.data=?2)
    public static final String SQL_EQUIPE_DISPONIVEL_SEM_META =
            "SELECT DISTINCT ou.id_usuario FROM cen_operacional_usuario ou INNER JOIN cen_operacional op ON op.id = ou.id_operacional WHERE op.id_coordenador =?1 AND op.status ='INICIADO' AND ou.id_usuario Not in (Select m.operador from Meta m where m.data=?2)";

    public Uni<java.util.List<Object>> equipeDisponivelSemMeta(Long coordenadorId, Date data) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EQUIPE_DISPONIVEL_SEM_META)
                        .setParameter(1, coordenadorId)
                        .setParameter(2, data)
                        .getResultList());
    }


    // SELECT distinct ou.operador from OperacionalUsuario ou inner join ou.operacional op  where (op.coordenador =?1 AND op.status ='INICIADO'  AND  ou.operador Not in(Select m.operador from Meta m where m.data=?2) or (op.coordenador =?1 and ou.operador = ?3))
    public static final String SQL_EQUIPE_DISPONIVEL_SEM_META_COM_OPERADOR =
            "SELECT DISTINCT ou.id_usuario FROM cen_operacional_usuario ou INNER JOIN cen_operacional op ON op.id = ou.id_operacional WHERE (op.id_coordenador =?1 AND op.status ='INICIADO' AND ou.id_usuario Not in(Select m.operador from Meta m where m.data=?2) or (op.id_coordenador =?1 and ou.id_usuario = ?3))";

    public Uni<java.util.List<Object>> equipeDisponivelSemMetaComOperador(Long coordenadorId, Date data, Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EQUIPE_DISPONIVEL_SEM_META_COM_OPERADOR)
                        .setParameter(1, coordenadorId)
                        .setParameter(2, data)
                        .setParameter(3, operadorId)
                        .getResultList());
    }


    // Select u from Usuario u left join fetch u.perfis where u = ?1
    public static final String SQL_BUSCAR_USUARIO_COM_PERFIL =
            "SELECT u.* FROM bas_usuario u WHERE u.id = ?1";

    public Uni<java.util.List<Usuario>> buscarUsuarioComPerfil(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_COM_PERFIL, Usuario.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select p from Usuario u inner join  u.perfis p where u = ?1
    public static final String SQL_BUSCAR_USUARIO_SEU_PERFIL =
            "SELECT p.* FROM bas_usuario u INNER JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_perfil p ON p.id = u_p_jt.id_perfil WHERE u.id = ?1";

    public Uni<java.util.List<Perfil>> buscarUsuarioSeuPerfil(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_SEU_PERFIL, Perfil.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select u from Usuario u left join fetch u.unidades where u = ?1
    public static final String SQL_BUSCAR_USUARIO_COM_UNIDADES =
            "SELECT u.* FROM bas_usuario u WHERE u.id = ?1";

    public Uni<java.util.List<Usuario>> buscarUsuarioComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_COM_UNIDADES, Usuario.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select u from Usuario u left join fetch u.turnoTrabalhos t where u = ?1 order by t.diaSemana, t.descricao
    public static final String SQL_BUSCAR_USUARIO_COM_TURNOS =
            "SELECT u.* FROM bas_usuario u LEFT JOIN cen_turno_usuario u_t_jt ON u_t_jt.id_usuario = u.id LEFT JOIN cen_turno_trabalho t ON t.id = u_t_jt.id_turno WHERE u.id = ?1 ORDER BY t.id_dia_semana, t.descricao";

    public Uni<java.util.List<Usuario>> buscarUsuarioComTurnos(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_COM_TURNOS, Usuario.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select u from Usuario u left join fetch u.usuarioAgendas where u = ?1
    public static final String SQL_BUSCAR_USUARIO_COM_AGENDAS =
            "SELECT u.* FROM bas_usuario u WHERE u.id = ?1";

    public Uni<java.util.List<Usuario>> buscarUsuarioComAgendas(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_COM_AGENDAS, Usuario.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select uni from Usuario u inner join u.unidades uni where u = ?1 and uni.ativo = true and u.ativo = true order by uni.sucinto
    public static final String SQL_BUSCAR_UNIDADES_DISPONIVEIS =
            "SELECT uni.id, uni.razao_social, uni.nome_fantasia, uni.cnpj, uni.inscricao_estadual, uni.id_logradouro, uni.email, uni.numero, uni.area, uni.email_rh, uni.id_tipo_unidade, uni.id_regiao, uni.id_responsavel, uni.id_tema, uni.ponto_referencia, uni.sucinto, uni.diretorensino, uni.coordenador, uni.cep, uni.registro, uni.fl_ativo FROM bas_usuario u INNER JOIN bas_usuario_unidade u_uni_jt ON u_uni_jt.id_usuario = u.id INNER JOIN bas_unidade uni ON uni.id = u_uni_jt.id_unidade WHERE u.id = ?1 and uni.fl_ativo = true and u.fl_ativo = true ORDER BY uni.sucinto";

    public Uni<java.util.List<Unidade>> buscarUnidadesDisponiveis(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADES_DISPONIVEIS, Unidade.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select uni from Rede r inner join r.unidades uni where r.usuario = ?1 and uni.ativo = true order by uni.sucinto
    public static final String SQL_BUSCAR_UNIDADES_DISPONIVEIS_REDE =
            "SELECT uni.id, uni.razao_social, uni.nome_fantasia, uni.cnpj, uni.inscricao_estadual, uni.id_logradouro, uni.email, uni.numero, uni.area, uni.email_rh, uni.id_tipo_unidade, uni.id_regiao, uni.id_responsavel, uni.id_tema, uni.ponto_referencia, uni.sucinto, uni.diretorensino, uni.coordenador, uni.cep, uni.registro, uni.fl_ativo FROM bas_rede r INNER JOIN bas_rede_unidade r_uni_jt ON r_uni_jt.id_rede = r.id INNER JOIN bas_unidade uni ON uni.id = r_uni_jt.id_unidade WHERE r.id_usuario = ?1 and uni.fl_ativo = true ORDER BY uni.sucinto";

    public Uni<java.util.List<Unidade>> buscarUnidadesDisponiveisRede(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_UNIDADES_DISPONIVEIS_REDE, Unidade.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select ua.agenda from Usuario u inner join u.usuarioAgendas ua where u = ?1 order by u.login
    public static final String SQL_BUSCAR_AGENDAS_DISPONIVEIS =
            "SELECT ua.id_agenda FROM bas_usuario u INNER JOIN bas_usuario_agenda ua ON ua.id_usuario = u.id WHERE u.id = ?1 ORDER BY u.login";

    public Uni<java.util.List<Object>> buscarAgendasDisponiveis(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_AGENDAS_DISPONIVEIS)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select u from Usuario u left join fetch u.perfis perfis where ?1 in (perfis) and u.ativo = true order by u.login
    public static final String SQL_BUSCAR_USUARIO_POR_PERFIL =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_usuario_perfil u_perfis_jt ON u_perfis_jt.id_usuario = u.id LEFT JOIN bas_perfil perfis ON perfis.id = u_perfis_jt.id_perfil WHERE ?1 in (perfis) and u.fl_ativo = true ORDER BY u.login";

    public Uni<java.util.List<Usuario>> buscarUsuarioPorPerfil(Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_POR_PERFIL, Usuario.class)
                        .setParameter(1, perfilId)
                        .getResultList());
    }


    // select distinct u from Usuario u left join fetch u.perfis p where p in (?1) and u.ativo = true order by u.login
    public static final String SQL_BUSCAR_USUARIO_POR_PERFIS =
            "SELECT DISTINCT u.* FROM bas_usuario u LEFT JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id LEFT JOIN bas_perfil p ON p.id = u_p_jt.id_perfil WHERE p in (?1) and u.fl_ativo = true ORDER BY u.login";

    public Uni<java.util.List<Usuario>> buscarUsuarioPorPerfis(List<Long> perfilIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_POR_PERFIS, Usuario.class)
                        .setParameter(1, perfilIds)
                        .getResultList());
    }


    // select distinct u from Usuario u inner join u.unidades p where p = ?1 and p.ativo = true and u.ativo = true order by u.login
    public static final String SQL_BUSCAR_USUARIO_POR_UNIDADE =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_unidade u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_unidade p ON p.id = u_p_jt.id_unidade WHERE p.id = ?1 and p.fl_ativo = true and u.fl_ativo = true ORDER BY u.login LIMIT 10";

    public Uni<java.util.List<Usuario>> buscarUsuarioPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_POR_UNIDADE, Usuario.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Busca o Usuario da sessao pelo login (case-insensitive) - usado pela atualizacao de foto do usuario logado
    public static final String SQL_BUSCAR_POR_LOGIN =
            "SELECT u.* FROM bas_usuario u WHERE lower(u.login) = lower(?1) LIMIT 1";

    public Uni<Usuario> buscarPorLogin(String login) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_POR_LOGIN, Usuario.class)
                        .setParameter(1, login)
                        .getResultList())
                .map(list -> list.isEmpty() ? null : list.get(0));
    }


    // Select u from Usuario u where u.login = ?1
    public static final String SQL_BUSCAR_LOGIN_EXISTENTE =
            "SELECT u.* FROM bas_usuario u WHERE u.login = ?1";

    public Uni<java.util.List<Usuario>> buscarLoginExistente(String login) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LOGIN_EXISTENTE, Usuario.class)
                        .setParameter(1, login)
                        .getResultList());
    }


    // Select u from Usuario u where u.login = ?1 and u.pessoa.email = ?2
    public static final String SQL_BUSCAR_LOGIN_EEMAIL_EXISTENTE =
            "SELECT u.* FROM bas_usuario u LEFT JOIN bas_pessoa j_u_pessoa ON j_u_pessoa.id = u.id_pessoa WHERE u.login = ?1 and j_u_pessoa.email = ?2";

    public Uni<java.util.List<Usuario>> buscarLoginEemailExistente(String login, String email) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LOGIN_EEMAIL_EXISTENTE, Usuario.class)
                        .setParameter(1, login)
                        .setParameter(2, email)
                        .getResultList());
    }


    // select distinct u from Usuario u inner join u.unidades un where un.ativo = true and ( lower(u.login) like '%' || ?1 || '%' or str(u.id) = ?1 and u.ativo = true ) AND un in (?2) order by u.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id INNER JOIN bas_unidade un ON un.id = u_un_jt.id_unidade WHERE un.fl_ativo = true and ( lower(u.login) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1 and u.fl_ativo = true ) AND un in (?2) ORDER BY u.login LIMIT 10";

    public Uni<java.util.List<Usuario>> autoCompleteComUnidade(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE, Usuario.class)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // select u from Usuario u inner join u.perfis p  inner join p.perfisModulos pf  where u=?1 AND pf.modulo = ?2 AND pf.novo = true AND pf.editar =true AND pf.remover = true AND pf.relatorio = true order by u.login
    public static final String SQL_ACESSO_COMPLETO_MODULO =
            "SELECT u.* FROM bas_usuario u INNER JOIN bas_usuario_perfil u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_perfil p ON p.id = u_p_jt.id_perfil INNER JOIN bas_perfil_modulo pf ON pf.id_perfil = p.id WHERE u.id=?1 AND pf.id_modulo = ?2 AND pf.novo = true AND pf.editar =true AND pf.remover = true AND pf.relatorio = true ORDER BY u.login";

    public Uni<java.util.List<Usuario>> acessoCompletoModulo(Long uId, Long mId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ACESSO_COMPLETO_MODULO, Usuario.class)
                        .setParameter(1, uId)
                        .setParameter(2, mId)
                        .getResultList());
    }


    // select distinct usu from Usuario usu inner join usu.unidades u where u = ?1  and u.ativo = true  and usu.ativo = true order by usu.login
    public static final String SQL_USUARIO_COM_UNIDADES =
            "SELECT DISTINCT usu.* FROM bas_usuario usu INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE u.id = ?1 and u.fl_ativo = true and usu.fl_ativo = true ORDER BY usu.login";

    public Uni<java.util.List<Usuario>> usuarioComUnidades(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_USUARIO_COM_UNIDADES, Usuario.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // select distinct u from Usuario u inner join u.unidades p where p in (?1) and p.ativo = true and u.ativo = true order by u.login
    public static final String SQL_BUSCAR_USUARIO_POR_UNIDADES =
            "SELECT DISTINCT u.* FROM bas_usuario u INNER JOIN bas_usuario_unidade u_p_jt ON u_p_jt.id_usuario = u.id INNER JOIN bas_unidade p ON p.id = u_p_jt.id_unidade WHERE p in (?1) and p.fl_ativo = true and u.fl_ativo = true ORDER BY u.login";

    public Uni<java.util.List<Usuario>> buscarUsuarioPorUnidades(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_POR_UNIDADES, Usuario.class)
                        .setParameter(1, unidadeIds)
                        .getResultList());
    }


    // select distinct usu from Usuario usu inner join usu.usuarioAgendas p inner join usu.unidades u where u in (?1) and u.ativo = true and p.agenda = ?2 and usu.ativo = true order by usu.login
    public static final String SQL_USUARIOS_COM_UNIDADES_AGENDAS =
            "SELECT DISTINCT usu.* FROM bas_usuario usu INNER JOIN bas_usuario_agenda p ON p.id_usuario = usu.id INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE u in (?1) and u.fl_ativo = true and p.id_agenda = ?2 and usu.fl_ativo = true ORDER BY usu.login";

    public Uni<java.util.List<Usuario>> usuariosComUnidadesAgendas(List<Long> unidadesIds, Long agendaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_USUARIOS_COM_UNIDADES_AGENDAS, Usuario.class)
                        .setParameter(1, unidadesIds)
                        .setParameter(2, agendaId)
                        .getResultList());
    }


    // select distinct usu from Usuario usu inner join usu.perfis p inner join usu.unidades u where u in (?1) and u.ativo = true and p = ?2 and usu.ativo = true order by usu.login
    public static final String SQL_USUARIO_COM_UNIDADES_PERFIL =
            "SELECT DISTINCT usu.* FROM bas_usuario usu INNER JOIN bas_usuario_perfil usu_p_jt ON usu_p_jt.id_usuario = usu.id INNER JOIN bas_perfil p ON p.id = usu_p_jt.id_perfil INNER JOIN bas_usuario_unidade usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_unidade u ON u.id = usu_u_jt.id_unidade WHERE u in (?1) and u.fl_ativo = true and p.id = ?2 and usu.fl_ativo = true ORDER BY usu.login";

    public Uni<java.util.List<Usuario>> usuarioComUnidadesPerfil(List<Long> unidadesIds, Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_USUARIO_COM_UNIDADES_PERFIL, Usuario.class)
                        .setParameter(1, unidadesIds)
                        .setParameter(2, perfilId)
                        .getResultList());
    }


    // Sub-recursos de acesso do usuario (Acessos no formUsuario): perfis, agendas e unidades.
    // Tabelas de associacao sem entidade mapeada neste microsservico (mesmo padrao de AgendaRepository).
    private static final String SQL_LISTAR_PERFIS =
            "SELECT id_perfil FROM bas_usuario_perfil WHERE id_usuario = ?1 ORDER BY id_perfil";
    private static final String SQL_LIMPAR_PERFIS =
            "DELETE FROM bas_usuario_perfil WHERE id_usuario = ?1";
    private static final String SQL_INSERIR_PERFIL =
            "INSERT INTO bas_usuario_perfil (id_usuario, id_perfil) VALUES (?1, ?2)";

    private static final String SQL_LISTAR_AGENDAS =
            "SELECT id_agenda FROM bas_usuario_agenda WHERE id_usuario = ?1 ORDER BY id_agenda";
    private static final String SQL_LIMPAR_AGENDAS =
            "DELETE FROM bas_usuario_agenda WHERE id_usuario = ?1";
    private static final String SQL_INSERIR_AGENDA =
            "INSERT INTO bas_usuario_agenda (id_usuario, id_agenda, atender, iniciar, fechar, alterar, agendar) VALUES (?1, ?2, false, false, false, false, false)";

    private static final String SQL_LISTAR_UNIDADES =
            "SELECT id_unidade FROM bas_usuario_unidade WHERE id_usuario = ?1 ORDER BY id_unidade";
    private static final String SQL_LIMPAR_UNIDADES =
            "DELETE FROM bas_usuario_unidade WHERE id_usuario = ?1";
    private static final String SQL_INSERIR_UNIDADE =
            "INSERT INTO bas_usuario_unidade (id_usuario, id_unidade) VALUES (?1, ?2)";

    public Uni<java.util.List<Long>> listarPerfisIds(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PERFIS, Long.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }

    public Uni<Void> substituirPerfis(Long usuarioId, java.util.List<Long> perfis) {
        return substituirFilhos(SQL_LIMPAR_PERFIS, SQL_INSERIR_PERFIL, usuarioId, perfis);
    }

    public Uni<java.util.List<Long>> listarAgendasIds(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_AGENDAS, Long.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }

    public Uni<Void> substituirAgendas(Long usuarioId, java.util.List<Long> agendas) {
        return substituirFilhos(SQL_LIMPAR_AGENDAS, SQL_INSERIR_AGENDA, usuarioId, agendas);
    }

    public Uni<java.util.List<Long>> listarUnidadesIds(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_UNIDADES, Long.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }

    public Uni<Void> substituirUnidades(Long usuarioId, java.util.List<Long> unidades) {
        return substituirFilhos(SQL_LIMPAR_UNIDADES, SQL_INSERIR_UNIDADE, usuarioId, unidades);
    }

    private Uni<Void> substituirFilhos(String sqlLimpar, String sqlInserir, Long usuarioId, java.util.List<Long> filhos) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sqlLimpar)
                        .setParameter(1, usuarioId)
                        .executeUpdate()
                        .chain(ignored -> {
                            Uni<Void> insercoes = Uni.createFrom().voidItem();
                            for (Long filho : filhos) {
                                final Long filhoId = filho;
                                insercoes = insercoes.onItem().transformToUni(v ->
                                        session.createNativeQuery(sqlInserir)
                                                .setParameter(1, usuarioId)
                                                .setParameter(2, filhoId)
                                                .executeUpdate()
                                                .map(i -> (Void) null));
                            }
                            return insercoes;
                        }));
    }

}