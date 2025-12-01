// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    ShoppingCartIcon,
    TrashIcon,
    MinusIcon,
    PlusIcon,
    XMarkIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useShop } from "../context/ShopContext";

export default function CartPage() {
    const {
        cart,
        products,
        loadCart,
        loadProducts,
        increaseItem,
        decreaseItem,
        deleteItem,
        clearCart,
        createOrder,
        uploadVoucher,
    } = useShop();

    const [showPayment, setShowPayment] = useState(false);
    const [message, setMessage] = useState(null);
    const [checkout, setCheckout] = useState({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        ciudad: "",
        estado: "",
        pais: "",
        zip: "",
        paymentMethod: "tarjeta",
    });

    useEffect(() => {
        loadCart().catch(() => {});
        if (!products || products.length === 0) {
            loadProducts().catch(() => {});
        }
    }, [loadCart, loadProducts, products]);

    const items = cart?.items || [];
    const subtotal = items.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const handleProceedToPay = () => {
        if (items.length === 0) return;
        setShowPayment(true);
    };

    const handleConfirmOrder = async (voucherPayload) => {
        try {
            const order = await createOrder(checkout);
            if (checkout.paymentMethod === "yape") {
                if (!voucherPayload?.file) {
                    setMessage("Sube el voucher de Yape para continuar.");
                    return;
                }
                await uploadVoucher(order.id, voucherPayload.file, voucherPayload.operationCode);
                setMessage("Voucher enviado. Tu pago está en revisión.");
            } else {
                setMessage("Pedido creado correctamente.");
            }
            setShowPayment(false);
            if (checkout.paymentMethod === "paypal") {
                const amount = total || 0;
                const returnUrl = encodeURIComponent(window.location.origin + "/carrito");
                const paypalUrl = "https://www.paypal.com/checkoutnow?amount=" + amount + "&returnUrl=" + returnUrl;
                window.open(paypalUrl, "_blank");
            }
        } catch (e) {
            setMessage(e.message || "No se pudo crear el pedido");
        }
    };

    return (
        <>
            <Navbar />

            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Carrito de Compras</h1>
                            <p className="text-xs text-gray-500">
                                {items.length} producto{items.length !== 1 && "s"} en tu carrito
                            </p>
                        </div>
                    </div>

                    {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{message}</p>}

                    {items.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                                <ShoppingCartIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <h2 className="font-semibold text-gray-800">Tu carrito está vacío</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Agrega productos desde la página de inicio para comenzar tu compra.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.imagenUrl || "https://via.placeholder.com/80"}
                                                alt={item.productName}
                                                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {item.productName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <MinusIcon className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <span className="w-6 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => increaseItem(item.id)}
                                                    className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <PlusIcon className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                {renderPrecio(products, item)}
                                            </div>

                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="p-2 rounded-full hover:bg-red-50"
                                            >
                                                <TrashIcon className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={clearCart}
                                    className="text-xs text-red-500 hover:text-red-600 mt-2"
                                >
                                    Vaciar carrito
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-5 h-max">
                                <h2 className="font-semibold text-gray-900 mb-4">
                                    Resumen del Pedido
                                </h2>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">S/ {subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Envío</span>
                                        <span className="font-medium">
                                            {shipping === 0 ? "Gratis" : `S/ ${shipping}`}
                                        </span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Total</span>
                                        <span>S/ {total}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToPay}
                                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
                                >
                                    <CreditCardIcon className="w-5 h-5" />
                                    Proceder al Pago
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showPayment && (
                <PaymentModal
                    onClose={() => setShowPayment(false)}
                    total={total}
                    items={items}
                    onConfirm={handleConfirmOrder}
                    checkout={checkout}
                    setCheckout={setCheckout}
                    uploadVoucher={uploadVoucher}
                />
            )}
        </>
    );
}

function PaymentModal({ onClose, total, items, onConfirm, checkout, setCheckout, uploadVoucher }) {
    const [method, setMethod] = useState(checkout.paymentMethod || "tarjeta");
    const [voucherFile, setVoucherFile] = useState(null);
    const [operationCode, setOperationCode] = useState("");
    const [localMessage, setLocalMessage] = useState("");

    useEffect(() => {
        setCheckout({ ...checkout, paymentMethod: method });
    }, [method]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl p-6 overflow-y-auto relative">
                {/** QR configurable por env o archivo en public/img/yape-qr.png */ }
                {method === "yape" && (
                    <input type="hidden" value={process.env.REACT_APP_YAPE_QR_URL || "/img/yape-qr.png"} />
                )}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>

                <h2 className="text-lg font-bold text-gray-900 mb-1">Finalizar Compra</h2>
                <p className="text-xs text-gray-500 mb-4">
                    Completa tus datos y elige tu método de pago.
                </p>

                <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Información Personal
                    </h3>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nombre completo" value={checkout.nombre} onChange={(e) => setCheckout({ ...checkout, nombre: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Teléfono" value={checkout.telefono} onChange={(e) => setCheckout({ ...checkout, telefono: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Correo electrónico" value={checkout.email} onChange={(e) => setCheckout({ ...checkout, email: e.target.value })} />
                </div>

                <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Dirección de envío
                    </h3>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Dirección" value={checkout.direccion} onChange={(e) => setCheckout({ ...checkout, direccion: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ciudad" value={checkout.ciudad} onChange={(e) => setCheckout({ ...checkout, ciudad: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Estado" value={checkout.estado} onChange={(e) => setCheckout({ ...checkout, estado: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="País" value={checkout.pais} onChange={(e) => setCheckout({ ...checkout, pais: e.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ZIP" value={checkout.zip} onChange={(e) => setCheckout({ ...checkout, zip: e.target.value })} />
                </div>

                <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-800">Método de Pago</h3>

                        {[{ id: "tarjeta", label: "Tarjeta de Crédito/Débito" }, { id: "paypal", label: "PayPal" }, { id: "transferencia", label: "Transferencia Bancaria" }, { id: "yape", label: "Yape (QR)" }].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm mb-1 ${
                                    method === m.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                <span>{m.label}</span>
                                <span
                                    className={`w-3 h-3 rounded-full border ${
                                        method === m.id
                                            ? "bg-blue-500 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                />
                            </button>
                        ))}
                </div>

                {method === "paypal" && (
                    <div className="bg-blue-50 rounded-xl p-3 text-sm mb-4 border border-blue-200">
                        <p className="font-semibold">PayPal</p>
                        <p className="text-xs text-gray-600">Serás redirigido a PayPal para completar el pago.</p>
                    </div>
                )}

                {method === "yape" && (
                    <div className="bg-purple-50 rounded-xl p-3 text-sm mb-4 border border-purple-200">
                        <p className="font-semibold text-purple-800">Paga con Yape</p>
                        <p className="text-xs text-gray-600 mb-3">Escanea el código QR, paga y sube tu voucher.</p>
                        <img
                            src={process.env.REACT_APP_YAPE_QR_URL || "/img/yape-qr.png"}
                            alt="QR Yape"
                            className="w-48 h-48 object-contain bg-white border mx-auto mb-3"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setVoucherFile(e.target.files?.[0] || null)}
                            className="w-full text-xs"
                        />
                        <input
                            type="text"
                            placeholder="Código de operación (opcional)"
                            className="w-full border rounded px-3 py-2 text-sm mt-2"
                            value={operationCode}
                            onChange={(e) => setOperationCode(e.target.value)}
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                            Verificaremos el voucher. Recibirás confirmación en tu perfil/notificaciones.
                        </p>
                    </div>
                )}

                {localMessage && (
                    <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1">{localMessage}</p>
                )}

                <button
                    onClick={async () => {
                        if (method === "yape" && !voucherFile) {
                            setLocalMessage("Sube tu voucher para continuar.");
                            return;
                        }
                        setLocalMessage("");
                        await onConfirm({
                            file: voucherFile,
                            operationCode,
                            uploadVoucher,
                        });
                        onClose();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-sm font-semibold"
                >
                    Confirmar Pedido
                </button>
            </div>
        </div>
    );
}

function renderPrecio(products, item) {
    const prod = (products || []).find((p) => p.id === item.productId);
    const desc = prod?.descuento && Number(prod.descuento) > 0;
    const finalPrice = prod?.precioConDescuento || prod?.precio || item.unitPrice;
    return (
        <div className="text-right">
            {desc && (
                <span className="text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-1">
                    -{prod.descuento}%
                </span>
            )}
            {desc && (
                <p className="text-[11px] text-gray-400 line-through">
                    S/ {prod.precio}
                </p>
            )}
            <p className="text-sm font-semibold text-gray-900">S/ {item.subtotal}</p>
            {item.quantity > 1 && (
                <p className="text-[11px] text-gray-400">S/ {finalPrice} c/u</p>
            )}
        </div>
    );
}
