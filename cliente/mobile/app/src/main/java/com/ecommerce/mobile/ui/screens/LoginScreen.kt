package com.ecommerce.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.TextButton
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
import com.ecommerce.mobile.api.LoginRequest

@Composable
fun LoginScreen(onLogged: () -> Unit, onRegister: () -> Unit) {
    val username = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val error = remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Iniciar sesión")
        OutlinedTextField(value = username.value, onValueChange = { username.value = it }, label = { Text("Usuario o correo") })
        OutlinedTextField(value = password.value, onValueChange = { password.value = it }, label = { Text("Contraseña") })
        Spacer(Modifier.height(8.dp))
        Button(onClick = {
            scope.launch {
                runCatching { ApiClient.service.login(LoginRequest(username.value, password.value)) }
                    .onSuccess {
                        ApiClient.credentials = username.value to password.value
                        onLogged()
                    }
                    .onFailure { error.value = it.message }
            }
        }) { Text("Iniciar sesión") }
        TextButton(onClick = { onRegister() }) { Text("¿No tienes cuenta? Regístrate") }
        if (error.value != null) Text(error.value!!)
    }
}
