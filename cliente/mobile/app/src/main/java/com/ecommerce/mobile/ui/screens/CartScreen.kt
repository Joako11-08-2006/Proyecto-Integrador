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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.CartResponse

@Composable
fun CartScreen() {
    val cart = remember { mutableStateOf<CartResponse?>(null) }
    val scope = rememberCoroutineScope()
    fun refresh() {
        LaunchedEffect(Unit) {
            runCatching { ApiClient.service.myCart() }.onSuccess { cart.value = it }
        }
    }
    LaunchedEffect(Unit) { refresh() }
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Mi carrito")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            val items = cart.value?.items ?: emptyList()
            items(items.size) { idx ->
                val it = items[idx]
                Card(Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(12.dp)) {
                        Column(Modifier.weight(1f)) {
                            Text(it.productName ?: "Producto")
                            Text("S/ ${'$'}{it.subtotal}")
                        }
                        Row {
                            Button(onClick = {
                                scope.launch {
                                    runCatching { ApiClient.service.decrease(it.id) }.onSuccess { cart.value = it }
                                }
                            }) { Text("-") }
                            Spacer(Modifier.width(8.dp))
                            Button(onClick = {
                                scope.launch {
                                    runCatching { ApiClient.service.increase(it.id) }.onSuccess { cart.value = it }
                                }
                            }) { Text("+") }
                            Spacer(Modifier.width(8.dp))
                            Button(onClick = {
                                scope.launch {
                                    runCatching { ApiClient.service.delete(it.id) }.onSuccess { cart.value = it }
                                }
                            }) { Text("Eliminar") }
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text("Total: S/ ${'$'}{cart.value?.total}")
    }
}
