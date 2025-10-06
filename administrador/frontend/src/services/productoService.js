import axios from "axios";

const API_URL = "http://localhost:8080/api/productos";

const obtenerProductos = () => axios.get(API_URL);
const crearProducto = (producto) => axios.post(API_URL, producto);

const productoService = {
    obtenerProductos,
    crearProducto
};

export default productoService;
