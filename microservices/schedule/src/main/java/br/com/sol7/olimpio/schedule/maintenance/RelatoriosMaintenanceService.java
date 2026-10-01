package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;

/**
 * Rotina do dominio "relatorios" migrada de ExtratorService.remove() (chamado por
 * SchedulingService.tudo()). Acessa "olimpio_relatorios" diretamente pelo datasource reativo
 * "relatorios-db". Tambem remove arquivos temporarios da pasta "tabelas" conforme o legado.
 */
@ApplicationScoped
public class RelatoriosMaintenanceService {

    private static final Logger LOG = Logger.getLogger(RelatoriosMaintenanceService.class);

    @Inject
    Pool pool;

    private static final String SQL_MARCAR_REMOVIDOS_ANTIGOS =
            "UPDATE rel_extrator SET situacao = 'Removido' where cast(data_fim as date) <= current_date-1 and data_fim is not null";
    private static final String SQL_MARCAR_REMOVIDOS_SEM_FIM =
            "UPDATE rel_extrator SET situacao = 'Removido', data_fim = data_inicio where cast(data_inicio as date) <= current_date-1 and data_fim is null";

    public Uni<Void> removerExtratoresAntigos() {
        return pool.query(SQL_MARCAR_REMOVIDOS_ANTIGOS).execute()
                .chain(r -> pool.query(SQL_MARCAR_REMOVIDOS_SEM_FIM).execute())
                .chain(r -> Uni.createFrom().item(deleteTabelasDir()))
                .replaceWithVoid();
    }

    /**
     * Remove todo o conteudo da pasta "tabelas" e recria a pasta vazia,
     * conforme o legado (ExtratorService.remove()).
     * O path e configuravel via env RELATORIOS_TABELAS_PATH (default: /tmp/olimpio/tabelas).
     */
    private Void deleteTabelasDir() {
        String pathStr = System.getenv().getOrDefault("RELATORIOS_TABELAS_PATH", "/tmp/olimpio/tabelas");
        Path tabelasPath = Path.of(pathStr);

        if (!Files.exists(tabelasPath)) {
            LOG.debugf("removerExtratoresAntigos - pasta '%s' nao existe, nada a limpar", pathStr);
            return null;
        }

        try {
            if (Files.isDirectory(tabelasPath)) {
                Files.walkFileTree(tabelasPath, new SimpleFileVisitor<>() {
                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                        Files.delete(file);
                        return FileVisitResult.CONTINUE;
                    }

                    @Override
                    public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                        if (!dir.equals(tabelasPath)) {
                            Files.delete(dir);
                        }
                        return FileVisitResult.CONTINUE;
                    }
                });
                LOG.infof("removerExtratoresAntigos - pasta '%s' limpa com sucesso", pathStr);
            }
        } catch (IOException e) {
            LOG.errorf(e, "removerExtratoresAntigos - falha ao limpar pasta '%s'", pathStr);
        }
        return null;
    }
}
