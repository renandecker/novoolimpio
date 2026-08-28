package br.com.sol7.olimpio.educacao.shared;

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

    @ConfigProperty(name = "olimpio.storage.apresentacao-imagem-path", defaultValue = "apresentacaoimagem")
    String apresentacaoImagemPath;

    @ConfigProperty(name = "olimpio.storage.apresentacao-video-path", defaultValue = "apresentacaovideo")
    String apresentacaoVideoPath;

    private Path getBasePath() {
        return Paths.get(basePath).toAbsolutePath().normalize();
    }

    private Path getDir(String relativePath) {
        Path dir = getBasePath().resolve(relativePath);
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao criar diretório: " + relativePath, e);
        }
        return dir;
    }

    public String saveApresentacaoImagem(InputStream inputStream, String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!extension.matches("\\.(jpg|jpeg|png|gif)")) {
                extension = ".jpg";
            }
        } else {
            extension = ".jpg";
        }

        String filename = UUID.randomUUID() + extension;
        Path filePath = getDir(apresentacaoImagemPath).resolve(filename);

        try {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar imagem de apresentação", e);
        }

        return apresentacaoImagemPath + "/" + filename;
    }

    public String saveApresentacaoVideo(InputStream inputStream, String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!extension.matches("\\.(avi|mp4|mov)")) {
                extension = ".avi";
            }
        } else {
            extension = ".avi";
        }

        String filename = UUID.randomUUID() + extension;
        Path filePath = getDir(apresentacaoVideoPath).resolve(filename);

        try {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar vídeo de apresentação", e);
        }

        return apresentacaoVideoPath + "/" + filename;
    }

    public void deleteApresentacaoImagem(String relativePath) {
        if (relativePath == null) return;
        Path filePath = getBasePath().resolve(relativePath);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // ignore
        }
    }

    public void deleteApresentacaoVideo(String relativePath) {
        if (relativePath == null) return;
        Path filePath = getBasePath().resolve(relativePath);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // ignore
        }
    }

    public String getApresentacaoImagemUrl(String relativePath) {
        if (relativePath == null) return null;
        return "/app-resources/" + relativePath;
    }

    public String getApresentacaoVideoUrl(String relativePath) {
        if (relativePath == null) return null;
        return "/app-resources/" + relativePath;
    }
}