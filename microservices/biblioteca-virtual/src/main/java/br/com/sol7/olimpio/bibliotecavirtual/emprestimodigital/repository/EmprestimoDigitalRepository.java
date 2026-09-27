package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.repository;

import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.entity.EmprestimoDigital;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class EmprestimoDigitalRepository implements PanacheRepository<EmprestimoDigital> {

    public Uni<List<EmprestimoDigital>> findByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and flAtivo = true order by dataInicio desc", usuarioId);
    }

    public Uni<List<EmprestimoDigital>> findByLivroDigitalId(Long livroDigitalId) {
        return list("livroDigital.id = ?1 and flAtivo = true order by dataInicio desc", livroDigitalId);
    }

    public Uni<List<EmprestimoDigital>> findAtivosByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and status = ?2 and flAtivo = true", usuarioId, EmprestimoDigital.StatusEmprestimoDigital.ATIVO);
    }

    public Uni<List<EmprestimoDigital>> findExpirados(LocalDateTime agora) {
        return list("status = ?1 and dataExpiracao < ?2 and flAtivo = true", EmprestimoDigital.StatusEmprestimoDigital.ATIVO, agora);
    }

    public Uni<EmprestimoDigital> findAtivoByUsuarioAndLivro(Long usuarioId, Long livroDigitalId) {
        return find("usuarioId = ?1 and livroDigital.id = ?2 and status = ?3 and flAtivo = true",
                usuarioId, livroDigitalId, EmprestimoDigital.StatusEmprestimoDigital.ATIVO).firstResult();
    }
}