import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useShop } from "../context/ShopContext";

export default function Home() {
    const [search, setSearch] = useState("");
    const [marca, setMarca] = useState("Todas");
    const [orden, setOrden] = useState("Destacados");

    const { addToCart, products, featured, loadProducts } = useShop();

    const refPromos = useRef(null);

    const scrollToPromos = () => {
        refPromos.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadProducts({}).catch(() => {});
    }, [loadProducts]);

    const marcas = ["Todas", "Xiaomi", "Apple", "Google", "Samsung", "OnePlus", "Motorola"];

    const productosFiltrados = products
        .filter((p) => marca === "Todas" || (p.nombre && p.nombre.toLowerCase().includes(marca.toLowerCase())))
        .filter((p) => p.nombre && p.nombre.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const pa = a.precioConDescuento || a.precio || 0;
            const pb = b.precioConDescuento || b.precio || 0;
            if (orden === "PrecioAsc") return pa - pb;
            if (orden === "PrecioDesc") return pb - pa;
            if (orden === "AZ") return (a.nombre || "").localeCompare(b.nombre || "");
            return 0;
        });

    return (
        <>
            <Navbar />

            <div className="px-6 py-8">

                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-10 rounded-2xl text-white shadow-lg max-w-6xl mx-auto">
                    <span className="px-4 py-1 bg-green-400 text-green-900 rounded-full text-xs font-semibold">
                        Ofertas de Noviembre
                    </span>

                    <h2 className="text-3xl font-bold mt-4">
                        Los mejores celulares al mejor precio
                    </h2>

                    <p className="mt-3 text-blue-100 max-w-xl">
                        Descubre las últimas promociones en smartphones de gama alta y media. Envío gratis en compras superiores a $500.
                    </p>

                    <button
                        onClick={scrollToPromos}
                        className="mt-6 bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold shadow hover:bg-gray-100 transition"
                    >
                        Ver Promociones
                    </button>
                </div>

                <div ref={refPromos} className="max-w-6xl mx-auto mt-12">
                    <h3 className="text-2xl font-bold text-gray-900">Promociones Destacadas</h3>
                    <p className="text-gray-600 text-sm">Los mejores descuentos de la semana</p>
                </div>

                <div className="max-w-6xl mx-auto mt-8 grid md:grid-cols-3 gap-8">
                    {featured.map((p) => (
                        <ProductoCard key={p.id} p={p} addToCart={addToCart} />
                    ))}
                </div>

                <div className="max-w-6xl mx-auto mt-16">
                    <h3 className="text-2xl font-bold text-gray-900">Todos los Productos</h3>
                    <p className="text-gray-600 text-sm">{productosFiltrados.length} productos disponibles</p>
                </div>

                <div className="max-w-6xl mx-auto mt-6 flex flex-col md:flex-row md:items-center gap-4">

                    <div className="flex items-center border rounded-xl px-4 py-2 bg-white shadow w-full">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-3 outline-none"
                            placeholder="Buscar productos..."
                        />
                    </div>

                    <select
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        className="border px-4 py-2 rounded-xl shadow bg-white"
                    >
                        {marcas.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                        className="border px-4 py-2 rounded-xl shadow bg-white"
                    >
                        <option value="Destacados">Destacados</option>
                        <option value="PrecioAsc">Precio: Menor a Mayor</option>
                        <option value="PrecioDesc">Precio: Mayor a Menor</option>
                        <option value="AZ">Nombre A-Z</option>
                    </select>
                </div>

                <div className="max-w-6xl mx-auto mt-8 grid md:grid-cols-3 gap-8">
                    {productosFiltrados.map((p) => (
                        <ProductoCard key={p.id} p={p} addToCart={addToCart} />
                    ))}
                </div>

            </div>
        </>
    );
}

function ProductoCard({ p, addToCart }) {
    const tieneDescuento = p.descuento && Number(p.descuento) > 0;
    const precioFinal = p.precioConDescuento || p.precio;
    return (
        <div className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4">
            <div className="relative">
                <img
                    src={p.imagenUrl || p.imagen || "https://via.placeholder.com/400x300"}
                    alt={p.nombre}
                    className="rounded-xl h-52 w-full object-cover"
                />
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-lg">{p.nombre}</h4>

                <div className="mt-2">
                    {tieneDescuento && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full mr-2">
                            -{p.descuento}%
                        </span>
                    )}
                    <div className="flex items-baseline gap-2">
                        {tieneDescuento && (
                            <span className="text-xs text-gray-400 line-through">S/ {p.precio}</span>
                        )}
                        <span className="text-blue-600 font-bold text-xl">S/ {precioFinal}</span>
                    </div>
                </div>

                <button
                    onClick={() => addToCart(p.id, 1)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition font-semibold"
                >
                    Agregar
                </button>
            </div>
        </div>
    );
}
