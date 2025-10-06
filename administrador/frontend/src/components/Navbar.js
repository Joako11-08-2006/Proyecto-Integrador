import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Navbar() {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container-fluid px-4">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <i className="bi bi-shop me-2 text-primary fs-4"></i>
                    <span className="fw-bold">TecnoMarket</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto">
                        <li className="nav-item mx-2">
                            <Link
                                className={`nav-link ${
                                    location.pathname === "/dashboard" ? "active-link" : ""
                                }`}
                                to="/dashboard"
                            >
                                <i className="bi bi-grid-3x3-gap me-1"></i> Dashboard
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <Link
                                className={`nav-link ${
                                    location.pathname === "/inventario" ? "active-link" : ""
                                }`}
                                to="/inventario"
                            >
                                <i className="bi bi-box-seam me-1"></i> Inventario
                            </Link>
                        </li>

                        <li className="nav-item mx-2">
                            <Link
                                className={`nav-link ${
                                    location.pathname === "/comprobantes" ? "active-link" : ""
                                }`}
                                to="/comprobantes"
                            >
                                <i className="bi bi-file-earmark-text me-1"></i> Comprobantes
                            </Link>
                        </li>
                    </ul>

                    <Link className="btn btn-outline-light d-flex align-items-center" to="#">
                        <i className="bi bi-person me-1"></i> Cliente
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
