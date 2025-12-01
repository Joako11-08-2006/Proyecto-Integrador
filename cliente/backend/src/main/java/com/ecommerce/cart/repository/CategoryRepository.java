package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Category;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNombreIgnoreCase(String nombre);
}
