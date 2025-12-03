import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GroupIcon from "@mui/icons-material/Group";

import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { obtenerAlertas, getStoredAuth } from "../api";

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const rol = getStoredAuth()?.rol || "Admin";
  const currentPath = location.pathname.replace("/", "");

  // MENÚ SEGÚN ROL
  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "dashboard", roles: ["Admin", "SuperAdmin"] },
    { label: "Inventario", icon: <Inventory2Icon />, path: "inventory", roles: ["Admin", "SuperAdmin"] },
    { label: "Usuarios", icon: <GroupIcon />, path: "users", roles: ["SuperAdmin"] },
  ];

  // ALERTAS
  const [alertas, setAlertas] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = Boolean(anchorEl);

  const cargarAlertas = async () => {
    try {
      const data = await obtenerAlertas();
      const parsed = Array.isArray(data)
        ? data.map((a) => ({
            ...a,
            isRead: a.is_read ?? a.isRead ?? a.leido ?? false,
          }))
        : [];
      setAlertas(parsed);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    }
  };

  useEffect(() => {
    if (rol !== "Cliente") cargarAlertas();
  }, [rol]);

  const alertasNoVistas = Array.isArray(alertas)
    ? alertas.filter((a) => !a.isRead).length
    : 0;

  const handleOpenAlerts = (event) => setAnchorEl(event.currentTarget);
  const handleCloseAlerts = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        color: "#333",
        paddingX: 2,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* LOGO */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/833/833314.png"
            alt="logo"
            width="32"
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              TecnoMarket
            </Typography>
            <Typography variant="caption" color="gray">
              Panel Administrador
            </Typography>
          </Box>
        </Box>

        {/* MENÚ */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {menuItems
            .filter((item) => item.roles.includes(rol))
            .map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(`/${item.path}`)}
                sx={{
                  color: currentPath === item.path ? "#2563eb" : "#555",
                  fontWeight: currentPath === item.path ? "bold" : "normal",
                  textTransform: "none",
                  fontSize: "15px",
                  borderBottom:
                    currentPath === item.path ? "2px solid #2563eb" : "none",
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
        </Box>

        {/* DERECHA */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

          {/* ALERTAS */}
          {rol !== "Cliente" && (
            <IconButton onClick={handleOpenAlerts}>
              <Badge badgeContent={alertasNoVistas} color="error">
                <NotificationsIcon sx={{ color: "#444" }} />
              </Badge>
            </IconButton>
          )}

          {/* MENU DE ALERTAS */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseAlerts}
            PaperProps={{ elevation: 4, sx: { width: 350 } }}
          >
            <Box sx={{ px: 2, py: 1, fontWeight: "bold" }}>
              Alertas de Inventario
            </Box>

            <Divider />

            {alertas.length === 0 && <MenuItem disabled>No hay alertas</MenuItem>}

            {alertas.map((alerta) => (
              <MenuItem
                key={alerta.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                  backgroundColor: "#eef5ff",
                }}
              >
                <Typography fontSize="14px" fontWeight="bold">
                  {alerta.producto_nombre || alerta.nombre || "Alerta"}
                </Typography>
                <Typography fontSize="13px" color="gray">
                  Stock: {alerta.stock ?? alerta.stock_actual ?? "-"}
                </Typography>
              </MenuItem>
            ))}
          </Menu>

          {/* AVATAR */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#2563eb" }}>A</Avatar>
            <Box>
              <Typography fontWeight="bold" fontSize="14px">
                {rol}
              </Typography>
              <Typography fontSize="12px" color="gray">
                Panel
              </Typography>
            </Box>
          </Box>

          {/* SALIR */}
          <Button
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: "12px" }}
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
