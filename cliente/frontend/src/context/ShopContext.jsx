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

    // Specs locales para productos (por nombre)
    const specsByName = {
        "iPhone 15 Pro Max": {
            pantalla: '6.7" OLED Super Retina XDR 120Hz',
            procesador: "A17 Pro",
            ram: "8 GB",
            almacenamiento: "256/512GB/1TB",
            camara: "48 MP + 12 MP + 12 MP",
            bateria: "4,441 mAh",
            sistema_operativo: "iOS 17",
            stock: 12,
        },
        "iPhone 15 Pro": {
            pantalla: '6.1" OLED Super Retina 120Hz',
            procesador: "A17 Pro",
            ram: "8 GB",
            almacenamiento: "128/256/512GB/1TB",
            camara: "48 MP + 12 MP + 12 MP",
            bateria: "3,274 mAh",
            sistema_operativo: "iOS 17",
            stock: 10,
        },
        "iPhone 15 Plus": {
            pantalla: '6.7" OLED 60Hz',
            procesador: "A16 Bionic",
            ram: "6 GB",
            almacenamiento: "128/256/512GB",
            camara: "48 MP + 12 MP",
            bateria: "4,383 mAh",
            sistema_operativo: "iOS 17",
            stock: 15,
        },
        "iPhone 15": {
            pantalla: '6.1" OLED 60Hz',
            procesador: "A16 Bionic",
            ram: "6 GB",
            almacenamiento: "128/256/512GB",
            camara: "48 MP + 12 MP",
            bateria: "3,349 mAh",
            sistema_operativo: "iOS 17",
            stock: 20,
        },
        "iPhone SE 2022": {
            pantalla: '4.7" Retina IPS',
            procesador: "A15 Bionic",
            ram: "4 GB",
            almacenamiento: "64/128/256GB",
            camara: "12 MP",
            bateria: "2,018 mAh",
            sistema_operativo: "iOS 17",
            stock: 8,
        },
        "Samsung Galaxy S24 Ultra": {
            pantalla: '6.8" Dynamic AMOLED 2X 120Hz',
            procesador: "Snapdragon 8 Gen 3",
            ram: "12 GB",
            almacenamiento: "256/512GB/1TB",
            camara: "200 MP + 50 MP + 12 MP + 10 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14 (OneUI 6)",
            stock: 18,
        },
        "Samsung Galaxy S24+": {
            pantalla: '6.7" Dynamic AMOLED 120Hz',
            procesador: "Exynos 2400",
            ram: "12 GB",
            almacenamiento: "256/512GB",
            camara: "50 MP + 12 MP + 10 MP",
            bateria: "4,900 mAh",
            sistema_operativo: "Android 14",
            stock: 14,
        },
        "Samsung Galaxy S24": {
            pantalla: '6.2" Dynamic AMOLED 120Hz',
            procesador: "Exynos 2400",
            ram: "8 GB",
            almacenamiento: "128/256/512GB",
            camara: "50 MP + 12 MP + 10 MP",
            bateria: "4,000 mAh",
            sistema_operativo: "Android 14",
            stock: 22,
        },
        "Samsung Galaxy A54": {
            pantalla: '6.4" Super AMOLED 120Hz',
            procesador: "Exynos 1380",
            ram: "6/8 GB",
            almacenamiento: "128/256GB",
            camara: "50 MP + 12 MP + 5 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 25,
        },
        "Samsung Galaxy A34": {
            pantalla: '6.6" Super AMOLED 120Hz',
            procesador: "Dimensity 1080",
            ram: "6/8 GB",
            almacenamiento: "128/256GB",
            camara: "48 + 8 + 5 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 30,
        },
        "Xiaomi 14 Ultra": {
            pantalla: '6.73" AMOLED LTPO 120Hz',
            procesador: "Snapdragon 8 Gen 3",
            ram: "12/16 GB",
            almacenamiento: "256/512GB/1TB",
            camara: "50 MP cuádruple",
            bateria: "5,300 mAh",
            sistema_operativo: "HyperOS (Android 14)",
            stock: 10,
        },
        "Xiaomi 14": {
            pantalla: '6.36" AMOLED 120Hz',
            procesador: "Snapdragon 8 Gen 3",
            ram: "12 GB",
            almacenamiento: "256/512GB",
            camara: "50 MP + 50 MP + 50 MP",
            bateria: "4,610 mAh",
            sistema_operativo: "HyperOS",
            stock: 15,
        },
        "Xiaomi 13T Pro": {
            pantalla: '6.67" AMOLED 144Hz',
            procesador: "Dimensity 9200+",
            ram: "12/16 GB",
            almacenamiento: "256/512GB/1TB",
            camara: "50 + 50 + 12 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 22,
        },
        "Xiaomi Poco F5": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Snapdragon 7+ Gen 2",
            ram: "8/12 GB",
            almacenamiento: "256GB",
            camara: "64 MP + 8 + 2 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "MIUI 14",
            stock: 18,
        },
        "Xiaomi Poco X6 Pro": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Dimensity 8300 Ultra",
            ram: "8/12 GB",
            almacenamiento: "256/512GB",
            camara: "64 + 8 + 2 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "HyperOS",
            stock: 20,
        },
        "Redmi Note 13 Pro+": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Dimensity 7200 Ultra",
            ram: "8/12 GB",
            almacenamiento: "256/512GB",
            camara: "200 MP + 8 + 2",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 25,
        },
        "Redmi Note 13 Pro": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Snapdragon 7s Gen 2",
            ram: "6/8/12 GB",
            almacenamiento: "128/256/512GB",
            camara: "200 MP + 8 + 2",
            bateria: "5,100 mAh",
            sistema_operativo: "Android 14",
            stock: 30,
        },
        "Redmi Note 13": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Helio G99",
            ram: "4/6/8 GB",
            almacenamiento: "128/256GB",
            camara: "108 + 8 + 2",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 40,
        },
        "Redmi 13C": {
            pantalla: '6.74" IPS 90Hz',
            procesador: "Helio G85",
            ram: "4/6/8 GB",
            almacenamiento: "64/128/256GB",
            camara: "50 + 2 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "MIUI 14",
            stock: 35,
        },
        "Redmi Note 12 Pro 5G": {
            pantalla: '6.67" AMOLED 120Hz',
            procesador: "Dimensity 1080",
            ram: "6/8 GB",
            almacenamiento: "128/256GB",
            camara: "50 + 8 + 2 MP",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 13",
            stock: 28,
        },
        "Google Pixel 8 Pro": {
            pantalla: '6.7" LTPO OLED 120Hz',
            procesador: "Tensor G3",
            ram: "12 GB",
            almacenamiento: "128/256/512GB/1TB",
            camara: "50 + 48 + 48 MP",
            bateria: "5,050 mAh",
            sistema_operativo: "Android 14",
            stock: 12,
        },
        "Google Pixel 8": {
            pantalla: '6.2" OLED 120Hz',
            procesador: "Tensor G3",
            ram: "8 GB",
            almacenamiento: "128/256GB",
            camara: "50 + 12 MP",
            bateria: "4,575 mAh",
            sistema_operativo: "Android 14",
            stock: 20,
        },
        "Google Pixel 7 Pro": {
            pantalla: '6.7" OLED 120Hz',
            procesador: "Tensor G2",
            ram: "12 GB",
            almacenamiento: "128/256/512GB",
            camara: "50 + 48 + 12",
            bateria: "5,000 mAh",
            sistema_operativo: "Android 14",
            stock: 10,
        },
        "Google Pixel 7": {
            pantalla: '6.3" OLED 90Hz',
            procesador: "Tensor G2",
            ram: "8 GB",
            almacenamiento: "128/256GB",
            camara: "50 + 12 MP",
            bateria: "4,355 mAh",
            sistema_operativo: "Android 14",
            stock: 18,
        },
        "Pixel 7a": {
            pantalla: '6.1" OLED 90Hz',
            procesador: "Tensor G2",
            ram: "8 GB",
            almacenamiento: "128GB",
            camara: "64 + 13 MP",
            bateria: "4,385 mAh",
            sistema_operativo: "Android 14",
            stock: 25,
        },
    };

    const enrichProducts = (list) =>
        (list || []).map((p) => {
            const specs = specsByName[p.nombre];
            if (!specs) return p;
            return {
                ...p,
                specs,
                stock: specs.stock ?? p.stock,
                descripcion: specs.pantalla || p.descripcion,
            };
        });

    // Productos
    const loadProducts = useCallback(async (params = {}) => {
        setError(null);
        const data = await api.products(params);
        const mapped = enrichProducts(data || []);
        setProducts(mapped);
        return mapped;
    }, []);

    const loadFeatured = useCallback(async () => {
        setError(null);
        const data = await api.featured();
        setFeatured(enrichProducts(data || []));
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
