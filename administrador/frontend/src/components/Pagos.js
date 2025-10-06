import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Pagos = () => {
    const [monto, setMonto] = useState("");
    const [mensaje, setMensaje] = useState("");

    const pagar = async () => {
        try {
            const res = await axios.post("http://localhost:8080/api/pagos/culqi", {
                monto: monto,
                token: "token_simulado",
            });
            setMensaje(res.data.mensaje);
            alert(`✅ ${res.data.mensaje}`);
        } catch (error) {
            alert("❌ Error al procesar el pago");
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">💳 Pagos con Culqi (Simulado)</h2>

            <div className="card p-4 shadow-sm">
                <input
                    type="number"
                    className="form-control mb-3"
                    placeholder="Monto en soles"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                />

                <button className="btn btn-success w-100" onClick={pagar}>
                    Pagar ahora
                </button>
            </div>

            {mensaje && (
                <div className="alert alert-info mt-3 text-center">
                    {mensaje}
                </div>
            )}
        </div>
    );
};

export default Pagos;
