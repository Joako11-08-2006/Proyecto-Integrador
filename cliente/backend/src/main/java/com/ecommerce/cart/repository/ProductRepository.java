package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByNombreIgnoreCase(String nombre);
    long countByCategoriaId(Long categoriaId);
}
