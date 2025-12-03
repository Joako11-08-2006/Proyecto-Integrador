// src/App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import Comparar from "./pages/Comparar";
import CartPage from "./pages/CartPage";
import Perfil from "./pages/Perfil";
import AdminOrders from "./pages/AdminOrders";
import AdminStats from "./pages/AdminStats";
import ChatWidget from "./components/ChatWidget";

import { AuthProvider } from "./context/AuthContext";
import { ShopProvider } from "./context/ShopContext";
import { useLocation } from "react-router-dom";

function AppRoutes() {
    const location = useLocation();
    const hiddenRoutes = ["/", "/register"];
    const showChat = !hiddenRoutes.includes(location.pathname);

    return (
        <>
            {showChat && <ChatWidget />}
            <Routes>
                {/* Auth */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Cliente */}
                <Route path="/home" element={<Home />} />
                <Route path="/comparar" element={<Comparar />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/admin-orders" element={<AdminOrders />} />
                <Route path="/admin-stats" element={<AdminStats />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <ShopProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </ShopProvider>
        </AuthProvider>
    );
}

export default App;
