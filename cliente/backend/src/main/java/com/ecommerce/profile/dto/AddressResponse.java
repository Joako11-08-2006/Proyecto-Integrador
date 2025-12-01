package com.ecommerce.profile.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private Long id;
    private String etiqueta;
    private String nombre;
    private String telefono;
    private String direccion;
    private String ciudad;
    private String estado;
    private String pais;
    private String zipCode;
    private boolean principal;
}
