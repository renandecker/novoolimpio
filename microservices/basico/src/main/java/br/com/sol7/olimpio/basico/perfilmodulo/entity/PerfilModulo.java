package br.com.sol7.olimpio.basico.perfilmodulo.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import br.com.sol7.olimpio.basico.modulo.entity.Modulo;
import br.com.sol7.olimpio.basico.perfil.entity.Perfil;

@Entity
@Table(name = "bas_perfil_modulo")
public class PerfilModulo extends PanacheEntity {

    @ManyToOne
    @JoinColumn(name = "id_perfil")
    public Perfil perfil;

    @ManyToOne
    @JoinColumn(name = "id_modulo")
    public Modulo modulo;

    @Column(name = "novo")
    public Boolean novo = true;

    @Column(name = "editar")
    public Boolean editar = true;

    @Column(name = "remover")
    public Boolean remover = true;

    @Column(name = "relatorio")
    public Boolean relatorio = true;
}