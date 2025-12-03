package com.ecommerce.mobile.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.ProductResponse

@Composable
fun HomeScreen() {
    val featured = remember { mutableStateOf<List<ProductResponse>>(emptyList()) }
    LaunchedEffect(Unit) {
        runCatching { ApiClient.service.featured() }
            .onSuccess { featured.value = it }
    }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
                Text("Promociones destacadas", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Button(onClick = {}) { Text("Ver promociones") }
            }
        }
        items(featured.value) { p ->
            Card {
                Column(Modifier.fillMaxWidth().padding(12.dp)) {
                    if (!p.imagenUrl.isNullOrBlank()) {
                        Image(
                            painter = rememberAsyncImagePainter(p.imagenUrl),
                            contentDescription = null,
                            modifier = Modifier.fillMaxWidth().height(160.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Text(p.nombre ?: "Producto")
                    Text("S/ ${'$'}{p.precioConDescuento ?: p.precio}")
                }
            }
        }
    }
}
