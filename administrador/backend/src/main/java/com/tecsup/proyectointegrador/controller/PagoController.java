package com.tecsup.proyectointegrador.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    @PostMapping("/culqi")
    public Map<String, Object> simularPago(@RequestBody Map<String, Object> datos) {
        Map<String, Object> respuesta = new HashMap<>();
        try {
            double monto = Double.parseDouble(datos.get("monto").toString());
            String token = (String) datos.getOrDefault("token", "fake_token_123");

            if (monto > 0) {
                respuesta.put("estado", "PAGADO");
                respuesta.put("mensaje", "Pago simulado exitoso 💳");
                respuesta.put("token", token);
                respuesta.put("monto", monto);
            } else {
                respuesta.put("estado", "ERROR");
                respuesta.put("mensaje", "Monto inválido ❌");
            }
        } catch (Exception e) {
            respuesta.put("estado", "ERROR");
            respuesta.put("mensaje", "Error al procesar pago ⚠️");
        }
        return respuesta;
    }
}
