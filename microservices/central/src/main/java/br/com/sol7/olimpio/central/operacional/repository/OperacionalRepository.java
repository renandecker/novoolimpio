package br.com.sol7.olimpio.central.operacional;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class OperacionalRepository implements PanacheRepository<Operacional> {

    // Migrado de OperacionalRepository.buscarOperacionalComCoordenador (legado) - HQL original:
    // select op from Operacional op left join fetch op.coordenador where op.id = ?1
    public static final String SQL_BUSCAR_OPERACIONAL_COM_COORDENADOR =
            "SELECT op.* FROM cen_operacional op WHERE op.id = ?1";

    public Uni<java.util.List<Operacional>> buscarOperacionalComCoordenador(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OPERACIONAL_COM_COORDENADOR, Operacional.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Migrado de OperacionalRepository.buscarOperacionaisDoCoordenador (legado) - HQL original:
    // select op from Operacional op where op.coordenador = ?1 AND op.status = 'INICIADO'
    public static final String SQL_BUSCAR_OPERACIONAIS_DO_COORDENADOR =
            "SELECT op.* FROM cen_operacional op WHERE op.id_coordenador = ?1 AND op.status = 'INICIADO'";

    public Uni<java.util.List<Operacional>> buscarOperacionaisDoCoordenador(Long coordenadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OPERACIONAIS_DO_COORDENADOR, Operacional.class)
                        .setParameter(1, coordenadorId)
                        .getResultList());
    }


    // Migrado de OperacionalRepository.buscarOperacionalExpirados (legado) - HQL original:
    // SELECT op from Operacional op WHERE op.status <> 'CONCLUIDO' AND op.status <> 'EXPIRADO' AND op.pacote.acaoDeCampanha.dataFinal < current_date
    public static final String SQL_BUSCAR_OPERACIONAL_EXPIRADOS =
            "SELECT op.* FROM cen_operacional op LEFT JOIN com_pacote j_op_pacote ON j_op_pacote.id = op.id_pacote LEFT JOIN com_acao_de_campanha j_j_op_pacote_acaoDeCampanha ON j_j_op_pacote_acaoDeCampanha.id = j_op_pacote.id_acao_de_campanha WHERE op.status <> 'CONCLUIDO' AND op.status <> 'EXPIRADO' AND j_j_op_pacote_acaoDeCampanha.data_final < current_date";

    public Uni<java.util.List<Operacional>> buscarOperacionalExpirados() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OPERACIONAL_EXPIRADOS, Operacional.class)

                        .getResultList());
    }


    // Migrado de OperacionalRepository.buscarCoordenadorOperacional (legado) - HQL original:
    // Select o.coordenador from Operacional o where o = ?1
    public static final String SQL_BUSCAR_COORDENADOR_OPERACIONAL =
            "SELECT o.id_coordenador FROM cen_operacional o WHERE o.id = ?1";

    public Uni<java.util.List<Object>> buscarCoordenadorOperacional(Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COORDENADOR_OPERACIONAL)
                        .setParameter(1, operacionalId)
                        .getResultList());
    }


    // Migrado de OperacionalRepository.buscarProspectos (legado) - HQL original:
    // Select distinct po from Operacional o inner join o.pacote p  inner join p.prospectos po left join fetch po.prospectoCampos pc  where o = ?1
    public static final String SQL_BUSCAR_PROSPECTOS =
            "SELECT DISTINCT po.* FROM cen_operacional o INNER JOIN com_pacote p ON p.id = o.id_pacote INNER JOIN com_pacote_prospecto p_po_jt ON p_po_jt.id_pacote = p.id INNER JOIN com_prospecto po ON po.id = p_po_jt.id_prospecto LEFT JOIN com_prospecto_campo pc ON pc.id_prospecto = po.id WHERE o.id = ?1";

    // Atencao: a query original seleciona 'Prospecto', nao 'Operacional'.
    // Se 'Prospecto' existir como entidade neste microsservico, troque Object por Prospecto.class abaixo.
    public Uni<java.util.List<Object>> buscarProspectos(Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROSPECTOS)
                        .setParameter(1, operacionalId)
                        .getResultList());
    }


    // Migrado de OperacionalRepository.atualizarStatusExpirado (legado) - HQL original:
    // Update Operacional op set op.status='EXPIRADO' where op = ?1
    public static final String SQL_ATUALIZAR_STATUS_EXPIRADO =
            "UPDATE cen_operacional SET status ='EXPIRADO' WHERE op.id = ?1";

    public Uni<Integer> atualizarStatusExpirado(Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ATUALIZAR_STATUS_EXPIRADO)
                        .setParameter(1, operacionalId)
                        .executeUpdate());
    }

}