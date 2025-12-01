package com.ecommerce.cart.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer descuento;
    private BigDecimal precioConDescuento;
    private Integer stock;
    private String imagenUrl;
    private Long categoriaId;
}
