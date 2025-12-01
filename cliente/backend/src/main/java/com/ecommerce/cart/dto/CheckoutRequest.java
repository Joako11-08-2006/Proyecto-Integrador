package com.ecommerce.cart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String direccion;
    private String ciudad;
    private String estado;
    private String pais;
    private String zip;
    @NotBlank
    private String paymentMethod;
}
