package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Cliente;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByUsuarioId(Long usuarioId);

    Optional<Cliente> findByEmail(String email);
}
