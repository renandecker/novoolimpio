package br.com.sol7.olimpio.basico.usuario.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@ApplicationScoped
public class FileStorageService {

    @ConfigProperty(name = "olimpio.storage.base-path", defaultValue = "${user.home}/repositorio-olimpio")
    String basePath;

    @ConfigProperty(name = "olimpio.storage.foto-usuario-path", defaultValue = "fotousuario")
    String fotoUsuarioPath;

    private Path getBasePath() {
        return Paths.get(basePath).toAbsolutePath().normalize();
    }

    private Path getFotoUsuarioDir() {
        Path dir = getBasePath().resolve(fotoUsuarioPath);
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao criar diretório de fotos de usuário", e);
        }
        return dir;
    }

    public String saveFotoUsuario(String username, InputStream inputStream, String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!extension.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                extension = ".jpg";
            }
        } else {
            extension = ".jpg";
        }

        String filename = username + extension;
        Path filePath = getFotoUsuarioDir().resolve(filename);

        try {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar foto do usuário", e);
        }

        return fotoUsuarioPath + "/" + filename;
    }

    public void deleteFotoUsuario(String username) {
        Path dir = getFotoUsuarioDir();
        try {
            Files.list(dir)
                    .filter(path -> path.getFileName().toString().startsWith(username + "."))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            // ignore
                        }
                    });
        } catch (IOException e) {
            // ignore
        }
    }

    public Path getFotoUsuarioFile(String username) {
        Path dir = getFotoUsuarioDir();
        try {
            return Files.list(dir)
                    .filter(path -> path.getFileName().toString().startsWith(username + "."))
                    .findFirst()
                    .orElse(null);
        } catch (IOException e) {
            return null;
        }
    }

    public String getFotoUsuarioUrl(String username) {
        Path file = getFotoUsuarioFile(username);
        if (file != null) {
            return "/app-resources/" + fotoUsuarioPath + "/" + file.getFileName();
        }
        return null;
    }
}