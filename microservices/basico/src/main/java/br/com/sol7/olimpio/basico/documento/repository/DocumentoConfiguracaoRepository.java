package br.com.sol7.olimpio.basico.documento.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.documento.entity.DocumentoConfiguracao;

@ApplicationScoped
public class DocumentoConfiguracaoRepository implements PanacheRepository<DocumentoConfiguracao> {
}