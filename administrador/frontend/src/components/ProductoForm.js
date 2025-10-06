// src/components/ProductoForm.js
import React, { useEffect, useState } from "react";

const vacio = {
    nombre: "", descripcion: "", categoria: "",
    precio: "", stock: "", stockMinimo: 5,
    imagenUrl: "", marca: "", modelo: "",
    estado: true
};

function ProductoForm({ initialData, onCreate, onUpdate }) {
    const [form, setForm] = useState(vacio);
    const [errors, setErrors] = useState({}); // errores que vengan del backend

    useEffect(() => {
        setErrors({});
        if (initialData) {
            setForm({
                nombre: initialData.nombre ?? "",
                descripcion: initialData.descripcion ?? "",
                categoria: initialData.categoria ?? "",
                precio: initialData.precio ?? "",
                stock: initialData.stock ?? "",
                stockMinimo: initialData.stockMinimo ?? 5,
                imagenUrl: initialData.imagenUrl ?? "",
                marca: initialData.marca ?? "",
                modelo: initialData.modelo ?? "",
                estado: initialData.estado ?? true
            });
        } else {
            setForm(vacio);
        }
    }, [initialData]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});

        // preparar payload con números
        const payload = {
            ...form,
            precio: form.precio === "" ? null : parseFloat(form.precio),
            stock: form.stock === "" ? null : parseInt(form.stock, 10),
            stockMinimo: form.stockMinimo === "" ? 0 : parseInt(form.stockMinimo, 10),
        };

        try {
            if (initialData?.id) {
                await onUpdate(initialData.id, payload);
            } else {
                await onCreate(payload);
            }
        } catch (err) {
            // Si usas GlobalExceptionHandler devuelve { campo: "mensaje" }
            const data = err?.response?.data;
            if (data && typeof data === "object") setErrors(data);
            else alert("Error al guardar");
        }
    };

    return (
        <form onSubmit={submit} className="card card-body shadow-sm">
            <h5 className="mb-3">
                {initialData ? "Editar producto" : "Nuevo producto"}
            </h5>

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Nombre</label>
                    <input className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                           name="nombre" value={form.nombre} onChange={onChange} required />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                <div className="col-md-3">
                    <label className="form-label">Categoría</label>
                    <input className={`form-control ${errors.categoria ? "is-invalid" : ""}`}
                           name="categoria" value={form.categoria} onChange={onChange} required />
                    {errors.categoria && <div className="invalid-feedback">{errors.categoria}</div>}
                </div>

                <div className="col-md-2">
                    <label className="form-label">Precio</label>
                    <input type="number" step="0.01" className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                           name="precio" value={form.precio} onChange={onChange} required />
                    {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
                </div>

                <div className="col-md-1">
                    <label className="form-label">Stock</label>
                    <input type="number" className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                           name="stock" value={form.stock} onChange={onChange} required />
                    {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>

                <div className="col-md-2">
                    <label className="form-label">Stock mínimo</label>
                    <input type="number" className={`form-control ${errors.stockMinimo ? "is-invalid" : ""}`}
                           name="stockMinimo" value={form.stockMinimo} onChange={onChange} />
                    {errors.stockMinimo && <div className="invalid-feedback">{errors.stockMinimo}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Descripción</label>
                    <input className="form-control" name="descripcion" value={form.descripcion} onChange={onChange} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Marca</label>
                    <input className="form-control" name="marca" value={form.marca} onChange={onChange} />
                </div>
                <div className="col-md-3">
                    <label className="form-label">Modelo</label>
                    <input className="form-control" name="modelo" value={form.modelo} onChange={onChange} />
                </div>

                <div className="col-md-9">
                    <label className="form-label">Imagen URL</label>
                    <input className="form-control" name="imagenUrl" value={form.imagenUrl} onChange={onChange} />
                </div>

                <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="estado"
                               name="estado" checked={form.estado} onChange={onChange} />
                        <label className="form-check-label" htmlFor="estado">Activo</label>
                    </div>
                </div>
            </div>

            <div className="mt-3 d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                    {initialData ? "Guardar cambios" : "Agregar"}
                </button>
                {initialData && (
                    <button type="button" className="btn btn-outline-secondary"
                            onClick={() => window.location.reload()}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

export default ProductoForm;
