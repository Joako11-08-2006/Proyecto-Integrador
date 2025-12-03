package com.ecommerce.mobile.ui.screens

import android.util.Patterns
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Store
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.RegisterRequest
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(onRegistered: () -> Unit) {
    val nombre = remember { mutableStateOf("") }
    val email = remember { mutableStateOf("") }
    val telefono = remember { mutableStateOf("+51") }
    val direccion = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val confirm = remember { mutableStateOf("") }
    val showPass = remember { mutableStateOf(false) }
    val showConfirm = remember { mutableStateOf(false) }
    val accept = remember { mutableStateOf(false) }
    val error = remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun validEmail(s: String) = Patterns.EMAIL_ADDRESS.matcher(s).matches()
    fun validPhone(s: String) = Regex("^\\+51\\d{9}").matches(s)
    fun validPassword(p: String) = p.length >= 8 && Regex(".*[A-Z].*").containsMatchIn(p) && Regex(".*[!@#$%^&*()_+\-\\[\\]{};':\"\\|,.<>/?].*").containsMatchIn(p)

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Card { Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Outlined.Store, contentDescription = null)
                Text("TecnoMarket", style = MaterialTheme.typography.titleMedium)
            }
            Text("Crear Cuenta", style = MaterialTheme.typography.titleLarge)
            OutlinedTextField(value = nombre.value, onValueChange = { nombre.value = it }, label = { Text("Nombre Completo") }, leadingIcon = { Icon(Icons.Outlined.Person, null) })
            OutlinedTextField(value = email.value, onValueChange = { email.value = it }, label = { Text("Correo Electrónico") }, leadingIcon = { Icon(Icons.Outlined.Email, null) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
            OutlinedTextField(value = telefono.value, onValueChange = {
                var v = it
                if (!v.startsWith("+51")) v = "+51" + v.filter { ch -> ch.isDigit() }
                val digits = v.removePrefix("+51").filter { it.isDigit() }.take(9)
                telefono.value = "+51" + digits
            }, label = { Text("Teléfono") }, leadingIcon = { Icon(Icons.Outlined.Phone, null) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone))
            OutlinedTextField(value = password.value, onValueChange = { password.value = it }, label = { Text("Contraseña") }, leadingIcon = { Icon(Icons.Outlined.Lock, null) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), visualTransformation = if (showPass.value) VisualTransformation.None else PasswordVisualTransformation(), trailingIcon = { TextButton(onClick = { showPass.value = !showPass.value }) { Text(if (showPass.value) "Ocultar" else "Ver") } })
            OutlinedTextField(value = confirm.value, onValueChange = { confirm.value = it }, label = { Text("Confirmar Contraseña") }, leadingIcon = { Icon(Icons.Outlined.Lock, null) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password), visualTransformation = if (showConfirm.value) VisualTransformation.None else PasswordVisualTransformation(), trailingIcon = { TextButton(onClick = { showConfirm.value = !showConfirm.value }) { Text(if (showConfirm.value) "Ocultar" else "Ver") } })
            OutlinedTextField(value = direccion.value, onValueChange = { direccion.value = it }, label = { Text("Dirección (opcional)") })
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = accept.value, onCheckedChange = { accept.value = it })
                Text("Acepto los Términos y Condiciones y la Política de Privacidad")
            }
            Button(onClick = {
                error.value = null
                val allFilled = nombre.value.isNotBlank() && email.value.isNotBlank() && telefono.value.length == 12 && password.value.isNotBlank() && confirm.value.isNotBlank() && accept.value
                if (!allFilled) { error.value = "Completa los campos y acepta los términos"; return@Button }
                if (!validEmail(email.value)) { error.value = "Correo inválido"; return@Button }
                if (!validPhone(telefono.value)) { error.value = "Teléfono debe ser +51 y 9 dígitos"; return@Button }
                if (!validPassword(password.value)) { error.value = "Contraseña: 8+, una mayúscula y un caracter especial"; return@Button }
                if (password.value != confirm.value) { error.value = "Las contraseñas no coinciden"; return@Button }
                val username = email.value
                scope.launch {
                    runCatching {
                        ApiClient.service.register(
                            RegisterRequest(
                                username = username,
                                email = email.value,
                                password = password.value,
                                nombre = nombre.value,
                                telefono = telefono.value,
                                direccion = if (direccion.value.isBlank()) null else direccion.value
                            )
                        )
                    }.onSuccess {
                        ApiClient.credentials = username to password.value
                        onRegistered()
                    }.onFailure { e -> error.value = e.message ?: "Error al registrarte" }
                }
            }, enabled = accept.value) { Text("Crear Cuenta") }
            if (error.value != null) Text(error.value!!)
        } }
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.CheckCircle, null); Spacer(Modifier.width(8.dp)); Text("Ofertas Exclusivas") }
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.CheckCircle, null); Spacer(Modifier.width(8.dp)); Text("Compra Rápida") }
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.CheckCircle, null); Spacer(Modifier.width(8.dp)); Text("Seguimiento de Pedidos") }
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.CheckCircle, null); Spacer(Modifier.width(8.dp)); Text("Soporte Prioritario") }
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.CheckCircle, null); Spacer(Modifier.width(8.dp)); Text("100% Seguro") }
        }
    }
}
