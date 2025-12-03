// Base del backend (se fuerza localhost:8081 para evitar URLs incorrectas tipo ":8081")
const API_BASE = "http://localhost:8081";

const jsonHeaders = { "Content-Type": "application/json" };

const authHeader = (credentials) =>
    credentials
        ? { Authorization: "Basic " + btoa(`${credentials.username}:${credentials.password}`) }
        : {};

const handleResponse = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : await res.text();
    if (!res.ok) {
        const message = (data && data.message) || (typeof data === "string" ? data : "Error de servidor");
        throw new Error(message);
    }
    return data;
};

let currentCredentials = null;

export const setAuthCredentials = (creds) => {
    currentCredentials = creds;
};

export const api = {
    // Productos
    products: async (params = {}) => {
        const url = new URL(`${API_BASE}/api/products`);
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, v);
        });
        const res = await fetch(url.toString());
        return handleResponse(res);
    },
    product: async (id) => {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        return handleResponse(res);
    },
    featured: async () => {
        const res = await fetch(`${API_BASE}/api/products/featured`);
        return handleResponse(res);
    },
    compareProducts: async (ids) => {
        const res = await fetch(`${API_BASE}/api/products/compare`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({ ids }),
        });
        return handleResponse(res);
    },

    login: async (payload) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    register: async (payload) => {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    profile: async (credentials) => {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                ...authHeader(credentials),
            },
        });
        return handleResponse(res);
    },
    updateProfile: async (credentials, payload) => {
        const res = await fetch(`${API_BASE}/api/auth/me/profile`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(credentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    changePassword: async (credentials, payload) => {
        const res = await fetch(`${API_BASE}/api/auth/me/password`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(credentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    uploadPhoto: async (file) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${API_BASE}/api/auth/me/photo`, {
            method: "POST",
            body: form,
        });
        return handleResponse(res);
    },
    notifications: async (credentials) => {
        const res = await fetch(`${API_BASE}/api/auth/me/notifications`, {
            headers: { ...authHeader(credentials) },
        });
        return handleResponse(res);
    },

    // Carrito
    myCart: async () => {
        const res = await fetch(`${API_BASE}/api/cart/my-cart`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    cartAdd: async (payload) => {
        const res = await fetch(`${API_BASE}/api/cart/add`, {
            method: "POST",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    cartIncrease: async (itemId) => {
        const res = await fetch(`${API_BASE}/api/cart/increase/${itemId}`, {
            method: "PUT",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    cartDecrease: async (itemId) => {
        const res = await fetch(`${API_BASE}/api/cart/decrease/${itemId}`, {
            method: "PUT",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    cartDelete: async (itemId) => {
        const res = await fetch(`${API_BASE}/api/cart/delete/${itemId}`, {
            method: "DELETE",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    cartClear: async () => {
        const res = await fetch(`${API_BASE}/api/cart/clear`, {
            method: "DELETE",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },

    // Ordenes
    createOrder: async () => {
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    checkout: async (payload) => {
        const res = await fetch(`${API_BASE}/api/orders/checkout`, {
            method: "POST",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    myOrders: async () => {
        const res = await fetch(`${API_BASE}/api/orders/my-orders`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    updateOrderStatus: async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    ordersAll: async () => {
        const res = await fetch(`${API_BASE}/api/orders/admin/all`, {
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    uploadVoucher: async (id, file, operationCode) => {
        const form = new FormData();
        form.append("file", file);
        if (operationCode) form.append("operationCode", operationCode);
        const res = await fetch(`${API_BASE}/api/orders/${id}/voucher`, {
            method: "POST",
            headers: { ...authHeader(currentCredentials) },
            body: form,
        });
        return handleResponse(res);
    },
    receipt: async (id) => {
        const res = await fetch(`${API_BASE}/api/orders/${id}/receipt`, {
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    topProducts: async () => {
        const res = await fetch(`${API_BASE}/api/orders/admin/top-products`, {
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    verify2fa: async (code) => {
        const res = await fetch(`${API_BASE}/api/auth/2fa/verify?code=${encodeURIComponent(code)}`, {
            method: "POST",
        });
        return handleResponse(res);
    },

    // Perfil & direcciones & notificaciones prefs
    profile: async () => {
        const res = await fetch(`${API_BASE}/api/profile`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    profileUpdate: async (payload) => {
        const res = await fetch(`${API_BASE}/api/profile`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    profilePassword: async (payload) => {
        const res = await fetch(`${API_BASE}/api/profile/password`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    addresses: async () => {
        const res = await fetch(`${API_BASE}/api/profile/addresses`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    addressCreate: async (payload) => {
        const res = await fetch(`${API_BASE}/api/profile/addresses`, {
            method: "POST",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    addressUpdate: async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/profile/addresses/${id}`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    addressDelete: async (id) => {
        const res = await fetch(`${API_BASE}/api/profile/addresses/${id}`, {
            method: "DELETE",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    notificationPrefs: async () => {
        const res = await fetch(`${API_BASE}/api/profile/notifications`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    updateNotificationPrefs: async (payload) => {
        const res = await fetch(`${API_BASE}/api/profile/notifications`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
    profileSummary: async () => {
        const res = await fetch(`${API_BASE}/api/profile/summary`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    deleteAccount: async (email) => {
        const res = await fetch(`${API_BASE}/api/profile/delete-account`, {
            method: "DELETE",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify({ email }),
        });
        return handleResponse(res);
    },

    // Campanita de notificaciones
    notifications: async () => {
        const res = await fetch(`${API_BASE}/api/notifications`, { headers: { ...authHeader(currentCredentials) } });
        return handleResponse(res);
    },
    markNotificationRead: async (id) => {
        const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
            method: "PUT",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    markAllNotificationsRead: async () => {
        const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
            method: "PUT",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    deleteNotification: async (id) => {
        const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
            method: "DELETE",
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },

    // Alertas de stock (HU-03)
    lowStock: async () => {
        const res = await fetch(`${API_BASE}/api/alerts/low-stock`);
        return handleResponse(res);
    },

    // Chatbot
    chatAsk: async (message) => {
        const res = await fetch(`${API_BASE}/api/chat/ask`, {
            method: "POST",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify({ message }),
        });
        return handleResponse(res);
    },
    chatStatus: async () => {
        const res = await fetch(`${API_BASE}/api/chat/status`);
        return handleResponse(res);
    },
    chatHealth: async () => {
        const res = await fetch(`${API_BASE}/api/chat/health`);
        return handleResponse(res);
    },
    chatKnowledge: async () => {
        const res = await fetch(`${API_BASE}/api/chat/knowledge`, {
            headers: { ...authHeader(currentCredentials) },
        });
        return handleResponse(res);
    },
    chatKnowledgeSave: async (payload) => {
        const res = await fetch(`${API_BASE}/api/chat/knowledge`, {
            method: "PUT",
            headers: { ...jsonHeaders, ...authHeader(currentCredentials) },
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },
};
