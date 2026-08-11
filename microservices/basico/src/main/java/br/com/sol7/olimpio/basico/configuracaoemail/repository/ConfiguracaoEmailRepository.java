package br.com.sol7.olimpio.basico.configuracaoemail.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.configuracaoemail.entity.ConfiguracaoEmail;
@ApplicationScoped public class ConfiguracaoEmailRepository implements PanacheRepository<ConfiguracaoEmail> {

    // Migrado de ConfiguracaoEmailService.verificarCotaAuto (legado) - SQL nativo original (3 updates)
    public static final String SQL_VERIFICAR_COTA_DIARIO =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
            "where taxa.fl_api_email = true and periodicidade = 'DIARIO' and taxa.data_atualizacao != current_date";
    public static final String SQL_VERIFICAR_COTA_SEMANAL =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
            "where taxa.fl_api_email = true and periodicidade = 'SEMANAL' " +
            "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_atualizacao))";
    public static final String SQL_VERIFICAR_COTA_MENSAL =
            "UPDATE bas_email taxa SET data_atualizacao = now(), usado = cota " +
            "where taxa.fl_api_email = true and periodicidade = 'MENSAL' " +
            "and date_trunc('month', current_date) != date_trunc('month', taxa.data_atualizacao)";

    public Uni<Void> verificarCotaAutoNativo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_DIARIO).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_SEMANAL).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_MENSAL).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de ConfiguracaoEmailRepository.listEmailComCota (legado) - HQL original:
    // Select a from ConfiguracaoEmail a where a.habilitarApi = true and a.cota is not null
    public static final String SQL_LIST_EMAIL_COM_COTA =
            "SELECT a.* FROM bas_email a WHERE a.fl_api_email = true and a.cota is not null";

    public Uni<java.util.List<ConfiguracaoEmail>> listEmailComCota() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LIST_EMAIL_COM_COTA, ConfiguracaoEmail.class)

                    .getResultList());
    }


    // Migrado de ConfiguracaoEmailRepository.autoCompleteTokenGoogle (legado) - HQL original:
    // select u from ConfiguracaoEmail u where (u.googleMapsApi is not null or trim(u.googleMapsApi) <> '') and lower(u.username) like '%' || ?1 || '%'
    public static final String SQL_AUTO_COMPLETE_TOKEN_GOOGLE =
            "SELECT u.* FROM bas_email u WHERE (u.google_maps_api is not null or trim(u.google_maps_api) <> '') and lower(u.username) like '%' || ?1 || '%' LIMIT 10";

    public Uni<java.util.List<ConfiguracaoEmail>> autoCompleteTokenGoogle(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_TOKEN_GOOGLE, ConfiguracaoEmail.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de ConfiguracaoEmailRepository.busaConfiguracaoEmailPadrao (legado) - HQL original:
    // select u from ConfiguracaoEmail u where u.principal = true
    public static final String SQL_BUSA_CONFIGURACAO_EMAIL_PADRAO =
            "SELECT u.* FROM bas_email u WHERE u.fl_principal = true LIMIT 10";

    public Uni<java.util.List<ConfiguracaoEmail>> busaConfiguracaoEmailPadrao() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSA_CONFIGURACAO_EMAIL_PADRAO, ConfiguracaoEmail.class)

                    .getResultList());
    }

}