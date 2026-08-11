package br.com.sol7.olimpio.basico.mapamenu.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.mapamenu.entity.MapaMenu;
@ApplicationScoped public class MapaMenuRepository implements PanacheRepository<MapaMenu> {}