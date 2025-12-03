package com.ecommerce.mobile.api

// Evitar BigDecimal para parseo sencillo con Moshi

data class LoginRequest(val username: String, val password: String)
data class LoginResponse(val message: String?, val user: UserProfileResponse?)

data class UserProfileResponse(
    val id: Long?,
    val username: String?,
    val email: String?,
    val nombre: String?,
    val telefono: String?,
    val direccion: String?,
    val rol: String?,
    val permisosExtra: Map<String, Any>?,
    val creadoEn: String?,
    val fotoUrl: String?
)

data class ProductResponse(
    val id: Long,
    val nombre: String?,
    val descripcion: String?,
    val precio: Double?,
    val descuento: Int?,
    val precioConDescuento: Double?,
    val stock: Int?,
    val imagenUrl: String?,
    val categoriaId: Long?
)

data class CartItemResponse(
    val id: Long,
    val productId: Long,
    val productName: String?,
    val unitPrice: Double?,
    val quantity: Int,
    val subtotal: Double?
)

data class CartResponse(
    val id: Long?,
    val items: List<CartItemResponse>,
    val total: Double?
)

data class ChatRequest(val message: String)
data class ChatResponse(val text: String?, val suggestions: List<String>?)
data class ChatHealthResponse(val ok: Boolean?, val provider: String?, val model: String?, val message: String?, val error: String?)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val nombre: String,
    val telefono: String,
    val direccion: String?
)
