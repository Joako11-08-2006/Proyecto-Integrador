package com.ecommerce.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.ProductResponse

@Composable
fun CompareScreen() {
    val search = remember { mutableStateOf("") }
    val results = remember { mutableStateOf<List<ProductResponse>>(emptyList()) }
    val selected = remember { mutableStateOf<List<Long>>(emptyList()) }
    val scope = rememberCoroutineScope()
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth()) {
            OutlinedTextField(value = search.value, onValueChange = { search.value = it }, modifier = Modifier.weight(1f))
            Spacer(Modifier.width(8.dp))
            Button(onClick = {
                scope.launch {
                    runCatching { ApiClient.service.products(search.value) }
                        .onSuccess { results.value = it }
                }
            }) { Text("Buscar") }
        }
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(results.value.size) { idx ->
                val p = results.value[idx]
                Card(Modifier.fillMaxWidth().padding(2.dp)) {
                    Row(Modifier.padding(12.dp)) {
                        Column(Modifier.weight(1f)) {
                            Text(p.nombre ?: "Producto")
                            Text("S/ ${'$'}{p.precioConDescuento ?: p.precio}")
                        }
                        val isSelected = selected.value.contains(p.id)
                        Button(onClick = {
                            selected.value = if (isSelected) selected.value - p.id else (selected.value + p.id).take(3)
                        }) { Text(if (isSelected) "Quitar" else "Añadir") }
                    }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Button(onClick = {
            scope.launch {
                runCatching { ApiClient.service.compare(mapOf("ids" to selected.value)) }
                    .onSuccess { results.value = it }
            }
        }, enabled = selected.value.isNotEmpty()) { Text("Comparar") }
    }
}
