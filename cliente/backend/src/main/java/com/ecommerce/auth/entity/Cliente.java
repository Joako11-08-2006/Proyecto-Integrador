package com.ecommerce.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter
@Setter
@Table(name = "clientes_cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private AuthUser usuario;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(length = 300)
    private String direccion;

    @Column(length = 20)
    private String rol;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permisos_extra", columnDefinition = "jsonb")
    private Map<String, Object> permisosExtra = new HashMap<>();

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}
