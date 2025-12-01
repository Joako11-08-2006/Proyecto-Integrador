import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [cart, setCart] = useState({ id: null, items: [], total: 0 });
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Productos
    const loadProducts = useCallback(async (params = {}) => {
        setError(null);
        const data = await api.products(params);
        setProducts(data || []);
        return data;
    }, []);

    const loadFeatured = useCallback(async () => {
        setError(null);
        const data = await api.featured();
        setFeatured(data || []);
    }, []);

    // Cart
    const loadCart = useCallback(async () => {
        if (!user) {
            setCart({ id: null, items: [], total: 0 });
            return;
        }
        const data = await api.myCart();
        setCart(data || { id: null, items: [], total: 0 });
        return data;
    }, [user]);

    const addToCart = async (productId, quantity = 1) => {
        const data = await api.cartAdd({ productId, quantity });
        setCart(data);
        return data;
    };
    const increaseItem = async (itemId) => {
        const data = await api.cartIncrease(itemId);
        setCart(data);
        return data;
    };
    const decreaseItem = async (itemId) => {
        const data = await api.cartDecrease(itemId);
        setCart(data);
        return data;
    };
    const deleteItem = async (itemId) => {
        const data = await api.cartDelete(itemId);
        setCart(data);
        return data;
    };
    const clearCart = async () => {
        await api.cartClear();
        setCart({ id: null, items: [], total: 0 });
    };

    // Orders
    const createOrder = async (checkoutPayload) => {
        const data = checkoutPayload ? await api.checkout(checkoutPayload) : await api.createOrder();
        await loadCart();
        await loadOrders();
        return data;
    };
    const loadOrders = useCallback(async () => {
        if (!user) {
            setOrders([]);
            return;
        }
        const data = await api.myOrders();
        setOrders(data || []);
        return data;
    }, [user]);

    // Notifications (campanita)
    const loadNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return [];
        }
        try {
            const data = await api.notifications();
            setNotifications(data || []);
            return data;
        } catch (err) {
            const promos = (products || [])
                .filter((p) => p.descuento && Number(p.descuento) > 0)
                .slice(0, 5)
                .map((p) => ({
                    id: `promo-${p.id}`,
                    title: "Oferta",
                    message: `${p.nombre} con ${p.descuento}% de descuento`,
                    read: false,
                }));
            setNotifications(promos);
            return promos;
        }
    }, [user, products]);
    const markNotificationRead = async (id) => {
        try { await api.markNotificationRead(id); } catch (e) {}
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true, leido: true } : n));
    };
    const markAllNotificationsRead = async () => {
        try { await api.markAllNotificationsRead(); } catch (e) {}
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true, leido: true })));
    };
    const deleteNotification = async (id) => {
        try { await api.deleteNotification(id); } catch (e) {}
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    useEffect(() => {
        loadFeatured().catch(() => {});
    }, [loadFeatured]);

    useEffect(() => {
        if (user) {
            loadCart().catch(() => {});
            loadOrders().catch(() => {});
            loadNotifications().catch(() => {});
        } else {
            setCart({ id: null, items: [], total: 0 });
            setOrders([]);
            setNotifications([]);
        }
    }, [user, loadCart, loadOrders, loadNotifications]);

    return (
        <ShopContext.Provider
            value={{
                products,
                featured,
                cart,
                orders,
                notifications,
                loading,
                error,
                setError,
                loadProducts,
                loadFeatured,
                loadCart,
                addToCart,
                increaseItem,
                decreaseItem,
                deleteItem,
                clearCart,
                createOrder,
                uploadVoucher: api.uploadVoucher,
                loadOrders,
                loadNotifications,
                markNotificationRead,
                markAllNotificationsRead,
                deleteNotification,
                setNotifications,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => useContext(ShopContext);
