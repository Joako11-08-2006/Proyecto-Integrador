package com.tecsup.proyectointegrador.repository;

import com.tecsup.proyectointegrador.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
