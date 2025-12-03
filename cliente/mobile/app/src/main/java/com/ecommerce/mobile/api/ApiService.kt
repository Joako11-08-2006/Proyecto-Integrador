package com.ecommerce.mobile.api

import android.util.Base64
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.DELETE
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body req: LoginRequest): LoginResponse

    @POST("api/auth/register")
    suspend fun register(@Body req: RegisterRequest): UserProfileResponse

    @GET("api/auth/me")
    suspend fun me(): UserProfileResponse

    @GET("api/products/featured")
    suspend fun featured(): List<ProductResponse>

    @GET("api/products")
    suspend fun products(@Query("search") search: String? = null): List<ProductResponse>

    @POST("api/products/compare")
    suspend fun compare(@Body body: Map<String, List<Long>>): List<ProductResponse>

    @GET("api/cart/my-cart")
    suspend fun myCart(): CartResponse

    @POST("api/cart/add")
    suspend fun addToCart(@Body body: Map<String, Any>): CartResponse

    @PUT("api/cart/increase/{itemId}")
    suspend fun increase(@Path("itemId") itemId: Long): CartResponse

    @PUT("api/cart/decrease/{itemId}")
    suspend fun decrease(@Path("itemId") itemId: Long): CartResponse

    @DELETE("api/cart/delete/{itemId}")
    suspend fun delete(@Path("itemId") itemId: Long): CartResponse

    @POST("api/chat/ask")
    suspend fun chatAsk(@Body req: ChatRequest): ChatResponse

    @GET("api/chat/health")
    suspend fun chatHealth(): ChatHealthResponse
}

object ApiClient {
    private var BASE_URL = "http://10.0.2.2:8081/"

    var credentials: Pair<String, String>? = null

    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()
        val builder = original.newBuilder()
        credentials?.let { (u, p) ->
            val token = Base64.encodeToString("$u:$p".toByteArray(), Base64.NO_WRAP)
            builder.header("Authorization", "Basic $token")
        }
        chain.proceed(builder.build())
    }

    private val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }

    private var client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(logging)
        .retryOnConnectionFailure(true)
        .callTimeout(java.time.Duration.ofSeconds(30))
        .connectTimeout(java.time.Duration.ofSeconds(15))
        .readTimeout(java.time.Duration.ofSeconds(15))
        .build()

    var service: ApiService = build()

    private fun build(): ApiService = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    fun setBaseUrl(url: String) {
        BASE_URL = url
        client = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .retryOnConnectionFailure(true)
            .callTimeout(java.time.Duration.ofSeconds(30))
            .connectTimeout(java.time.Duration.ofSeconds(15))
            .readTimeout(java.time.Duration.ofSeconds(15))
            .build()
        service = build()
    }
}
