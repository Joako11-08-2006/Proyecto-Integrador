package com.ecommerce.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.ecommerce.mobile.api.ApiClient
import com.ecommerce.mobile.api.UserProfileResponse

@Composable
fun ProfileScreen() {
    val profile = remember { mutableStateOf<UserProfileResponse?>(null) }
    LaunchedEffect(Unit) {
        runCatching { ApiClient.service.me() }.onSuccess { profile.value = it }
    }
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Perfil")
        OutlinedTextField(value = profile.value?.nombre ?: "", onValueChange = {}, readOnly = true)
        OutlinedTextField(value = profile.value?.email ?: "", onValueChange = {}, readOnly = true)
        OutlinedTextField(value = profile.value?.telefono ?: "", onValueChange = {}, readOnly = true)
        OutlinedTextField(value = profile.value?.direccion ?: "", onValueChange = {}, readOnly = true)
    }
}
