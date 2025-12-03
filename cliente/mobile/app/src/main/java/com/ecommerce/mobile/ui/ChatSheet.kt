package com.ecommerce.mobile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.icons.Icons
import androidx.compose.material3.icons.outlined.Close
import androidx.compose.runtime.*
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.ChatRequest

data class ChatMsg(val from: String, val text: String)

@Composable
fun ChatSheet(onClose: () -> Unit) {
    var input by remember { mutableStateOf("") }
    var messages by remember { mutableStateOf(listOf(ChatMsg("bot", "Hola, soy el asistente virtual. ¿En qué puedo ayudarte?"))) }
    var suggestions by remember { mutableStateOf(listOf<String>()) }
    val scope = rememberCoroutineScope()
    LaunchedEffect(true) {
        runCatching { ApiClient.service.chatHealth() }
            .onSuccess { h ->
                if (h.ok == true) {
                    messages = messages + ChatMsg("bot", "IA lista: " + (h.model ?: ""))
                } else {
                    messages = messages + ChatMsg("bot", "IA no disponible")
                }
            }
    }
    Surface(Modifier.fillMaxWidth().padding(16.dp)) {
        Column(Modifier.background(MaterialTheme.colorScheme.surface).padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text("Asistente", style = MaterialTheme.typography.titleMedium)
                Button(onClick = onClose) { Icon(Icons.Outlined.Close, contentDescription = null) }
            }
            Spacer(Modifier.height(8.dp))
            LazyColumn(modifier = Modifier.height(240.dp)) {
                items(messages) { m ->
                    Box(Modifier.fillMaxWidth().padding(4.dp)) {
                        Text("${'$'}{m.from}: ${'$'}{m.text}")
                    }
                }
            }
            if (suggestions.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    suggestions.forEach { s ->
                        Button(onClick = {
                            messages = messages + ChatMsg("tú", s)
                            scope.launch {
                                runCatching { ApiClient.service.chatAsk(ChatRequest(s)) }
                                    .onSuccess { resp ->
                                        suggestions = resp.suggestions ?: emptyList()
                                        messages = messages + ChatMsg("bot", resp.text ?: "Estoy aquí para ayudarte")
                                    }
                                    .onFailure { _ -> messages = messages + ChatMsg("bot", "No pude responder ahora") }
                            }
                        }) { Text(s) }
                    }
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                Button(onClick = {
                    val txt = input.trim()
                    if (txt.isEmpty()) return@Button
                    input = ""
                    messages = messages + ChatMsg("tú", txt)
                    scope.launch {
                        runCatching { ApiClient.service.chatAsk(ChatRequest(txt)) }
                            .onSuccess { resp ->
                                suggestions = resp.suggestions ?: emptyList()
                                messages = messages + ChatMsg("bot", resp.text ?: "Estoy aquí para ayudarte")
                            }
                            .onFailure { _ ->
                                messages = messages + ChatMsg("bot", "No pude responder ahora")
                            }
                    }
                }) { Text("Enviar") }
            }
        }
    }
}
