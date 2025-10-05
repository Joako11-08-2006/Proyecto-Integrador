package com.tecsup.proyectointegrador.service;

import com.tecsup.proyectointegrador.model.Producto;
import com.tecsup.proyectointegrador.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    /**
     * Lista todos los productos existentes
     */
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    /**
     * Busca un producto por su ID
     */
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    /**
     * Guarda un nuevo producto y verifica si el stock es bajo
     */
    public Producto guardar(Producto producto) {
        verificarStock(producto);
        return productoRepository.save(producto);
    }

    /**
     * Actualiza un producto existente y vuelve a verificar el stock
     */
    public Producto actualizar(Long id, Producto productoDetalles) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(productoDetalles.getNombre());
        producto.setDescripcion(productoDetalles.getDescripcion());
        producto.setCategoria(productoDetalles.getCategoria());
        producto.setPrecio(productoDetalles.getPrecio());
        producto.setStock(productoDetalles.getStock());
        producto.setStockMinimo(productoDetalles.getStockMinimo());
        producto.setImagenUrl(productoDetalles.getImagenUrl());
        producto.setMarca(productoDetalles.getMarca());
        producto.setModelo(productoDetalles.getModelo());
        producto.setEstado(productoDetalles.getEstado());

        verificarStock(producto);
        return productoRepository.save(producto);
    }

    /**
     * Elimina un producto por su ID
     */
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    /**
     * Verifica si el producto tiene stock bajo
     */
    private void verificarStock(Producto producto) {
        if (producto.getStock() != null && producto.getStockMinimo() != null) {
            if (producto.getStock() < producto.getStockMinimo()) {
                System.out.println("⚠️ ALERTA: El producto '" + producto.getNombre() +
                        "' tiene stock bajo (" + producto.getStock() +
                        " unidades, mínimo recomendado: " + producto.getStockMinimo() + ")");
            }
        }
    }
}
