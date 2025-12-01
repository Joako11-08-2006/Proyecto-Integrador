package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.ProductCompareRequest;
import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<ProductResponse> findAll(String search, String brand, BigDecimal minPrice, BigDecimal maxPrice, String sort) {
        List<Product> all = productRepository.findAll();

        return all.stream()
                .filter(p -> filterSearch(p, search))
                .filter(p -> filterBrand(p, brand))
                .filter(p -> filterPrice(p, minPrice, maxPrice))
                .sorted(buildComparator(sort))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse findById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        return toResponse(p);
    }

    public List<ProductResponse> featured() {
        // Por ahora: devolver los primeros 5 más baratos como "destacados"
        return productRepository.findAll().stream()
                .sorted(Comparator.comparing(Product::getPrecio, Comparator.nullsLast(BigDecimal::compareTo)))
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> compare(ProductCompareRequest request) {
        List<Long> ids = Optional.ofNullable(request.getIds()).orElse(new ArrayList<>());
        if (ids.isEmpty()) {
            return List.of();
        }
        return productRepository.findAllById(ids).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private boolean filterSearch(Product p, String search) {
        if (search == null || search.isBlank()) return true;
        String s = search.toLowerCase(Locale.ROOT);
        return (p.getNombre() != null && p.getNombre().toLowerCase(Locale.ROOT).contains(s))
                || (p.getDescripcion() != null && p.getDescripcion().toLowerCase(Locale.ROOT).contains(s));
    }

    private boolean filterBrand(Product p, String brand) {
        if (brand == null || brand.isBlank()) return true;
        // No tenemos tabla de marca; se puede inferir por el nombre que contenga la marca
        return p.getNombre() != null && p.getNombre().toLowerCase(Locale.ROOT).contains(brand.toLowerCase(Locale.ROOT));
    }

    private boolean filterPrice(Product p, BigDecimal min, BigDecimal max) {
        if (p.getPrecio() == null) return true;
        if (min != null && p.getPrecio().compareTo(min) < 0) return false;
        if (max != null && p.getPrecio().compareTo(max) > 0) return false;
        return true;
    }

    private Comparator<Product> buildComparator(String sort) {
        if (sort == null) return Comparator.comparing(Product::getNombre, Comparator.nullsLast(String::compareToIgnoreCase));
        switch (sort) {
            case "priceAsc":
                return Comparator.comparing(Product::getPrecio, Comparator.nullsLast(BigDecimal::compareTo));
            case "priceDesc":
                return Comparator.comparing(Product::getPrecio, Comparator.nullsLast(BigDecimal::compareTo)).reversed();
            case "name":
                return Comparator.comparing(Product::getNombre, Comparator.nullsLast(String::compareToIgnoreCase));
            default:
                return Comparator.comparing(Product::getNombre, Comparator.nullsLast(String::compareToIgnoreCase));
        }
    }

    private ProductResponse toResponse(Product p) {
        Integer desc = p.getDescuento() == null ? 0 : p.getDescuento();
        BigDecimal precio = p.getPrecio();
        BigDecimal precioDesc = precio;
        if (precio != null && desc != null && desc > 0) {
            BigDecimal factor = BigDecimal.valueOf(100 - desc).divide(BigDecimal.valueOf(100));
            precioDesc = precio.multiply(factor);
        }
        return ProductResponse.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(precio)
                .descuento(desc)
                .precioConDescuento(precioDesc)
                .stock(p.getStock())
                .imagenUrl(p.getImagenUrl())
                .categoriaId(p.getCategoriaId())
                .build();
    }
}
