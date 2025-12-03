package com.ecommerce.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.icons.Icons
import androidx.compose.material3.icons.outlined.ChatBubble
import androidx.compose.material3.icons.outlined.Home
import androidx.compose.material3.icons.outlined.Person
import androidx.compose.material3.icons.outlined.ShoppingCart
import androidx.compose.material3.icons.outlined.SwapHoriz
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ecommerce.mobile.ui.ChatSheet
import com.ecommerce.mobile.ui.screens.CartScreen
import com.ecommerce.mobile.ui.screens.CompareScreen
import com.ecommerce.mobile.ui.screens.HomeScreen
import com.ecommerce.mobile.ui.screens.ProfileScreen
import com.ecommerce.mobile.ui.screens.LoginScreen
import com.ecommerce.mobile.ui.screens.RegisterScreen
import com.ecommerce.mobile.api.ApiClient

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { App() }
    }
}

@Composable
fun App() {
    val navController = rememberNavController()
    var chatOpen by remember { mutableStateOf(false) }
    Scaffold(
        bottomBar = { BottomBar(navController) },
        floatingActionButton = {
            FloatingActionButton(onClick = { chatOpen = !chatOpen }) {
                Icon(Icons.Outlined.ChatBubble, contentDescription = null)
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            NavGraph(navController)
            if (chatOpen) {
                ChatSheet(onClose = { chatOpen = false })
            }
        }
    }
}

@Composable
fun BottomBar(navController: NavHostController) {
    val items = listOf("home", "compare", "cart", "profile")
    val icons = listOf(Icons.Outlined.Home, Icons.Outlined.SwapHoriz, Icons.Outlined.ShoppingCart, Icons.Outlined.Person)
    val labels = listOf("Inicio", "Comparar", "Carrito", "Perfil")
    val backStackEntry by navController.currentBackStackEntryAsState()
    val current = backStackEntry?.destination?.route ?: "home"
    NavigationBar {
        items.forEachIndexed { index, route ->
            NavigationBarItem(
                selected = current == route,
                onClick = { navController.navigate(route) },
                icon = { Icon(imageVector = icons[index], contentDescription = null) },
                label = { Text(labels[index]) }
            )
        }
    }
}

@Composable
fun NavGraph(navController: NavHostController) {
    val start = if (ApiClient.credentials == null) "login" else "home"
    NavHost(navController, startDestination = start) {
        composable("login") { LoginScreen(onLogged = { navController.navigate("home") }, onRegister = { navController.navigate("register") }) }
        composable("register") { RegisterScreen(onRegistered = { navController.navigate("home") }) }
        composable("home") { HomeScreen() }
        composable("compare") { CompareScreen() }
        composable("cart") { CartScreen() }
        composable("profile") { ProfileScreen() }
    }
}
