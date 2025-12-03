package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.ProductCompareRequest;
import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Value("${media.base.url:http://localhost:8000/media/producto/}")
    private String mediaBaseUrl;

    private static final Map<String, String> IMAGE_BY_NAME = buildImageMap();

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
        String imageUrl = resolveImageUrl(p);
        return ProductResponse.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(precio)
                .descuento(desc)
                .precioConDescuento(precioDesc)
                .stock(p.getStock())
                .imagenUrl(imageUrl)
                .categoriaId(p.getCategoriaId())
                .build();
    }

    private String resolveImageUrl(Product p) {
        String raw = p.getImagenUrl();
        if (raw != null && !raw.isBlank()) {
            return ensureAbsoluteUrl(raw);
        }
        String normalizedName = normalizeName(p.getNombre());
        String filename = IMAGE_BY_NAME.get(normalizedName);
        if (filename == null || filename.isBlank()) {
            return raw;
        }
        return ensureAbsoluteUrl(filename);
    }

    private String ensureAbsoluteUrl(String value) {
        if (value == null || value.isBlank()) return value;
        if (value.startsWith("http://") || value.startsWith("https://")) return value;
        return joinUrl(mediaBaseUrl, value);
    }

    private String joinUrl(String base, String path) {
        if (path == null) return base;
        String cleanBase = base == null ? "" : base.trim();
        if (!cleanBase.endsWith("/")) cleanBase += "/";
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return cleanBase + cleanPath;
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim().toLowerCase(Locale.ROOT);
    }

    private static Map<String, String> buildImageMap() {
        Map<String, String> map = new HashMap<>();
        map.put("iphone 15 pro max", "15promax.jpg");
        map.put("iphone 15 pro", "15pro.jpg");
        map.put("iphone 15 plus", "15plus.jpg");
        map.put("iphone 15", "iphone15.jpg");
        map.put("iphone se 2022", "sejpg.jpg");
        map.put("pixel 8 pro", "pixel8pro.jpeg");
        map.put("pixel 8", "pixel8.jpeg");
        map.put("google pixel 7 pro", "pixel7pro.jpg");
        map.put("pixel 7 pro", "pixel7pro.jpg");
        map.put("google pixel 7", "Pixel7.jpg");
        map.put("pixel 7", "Pixel7.jpg");
        map.put("pixel 7a", "pixel7a.jpg");
        map.put("redmi note 12 pro 5g", "Redmi Note 12 Pro 5G.jpg");
        map.put("redmi note 13 pro+", "Redmi Note 13 Pro (1).jpg");
        map.put("redmi note 13 pro", "Redmi Note 13 Pro.jpg");
        map.put("redmi note 13", "Redmi Note 13.jpg");
        map.put("redmi 13c", "redmi13c.jpg");
        map.put("samsung galaxy a34", "Samsung Galaxy A34.jpg");
        map.put("samsung galaxy a54", "Samsung Galaxy A54.jpg");
        map.put("samsung galaxy s24 ultra", "Samsung-Galaxy-S24-Ultra.jpg");
        map.put("samsung galaxy s24+", "Samsung Galaxy S24+.jpg");
        map.put("samsung galaxy s24 plus", "Samsung Galaxy S24+.jpg");
        map.put("samsung galaxy s24", "Samsung-Galaxy-S24.jpg");
        map.put("xiaomi 13t pro", "Xiaomi 13T Pro.jpg");
        map.put("xiaomi 14 ultra", "Xiaomi 14 Ultra.jpeg");
        map.put("xiaomi 14", "Xiaomi 14.jpg");
        map.put("xiaomi poco f5", "Xiaomi Poco F5.jpg");
        map.put("xiaomi poco x6 pro", "Xiaomi Poco X6 Pro.jpeg");
        return map;
    }
}
