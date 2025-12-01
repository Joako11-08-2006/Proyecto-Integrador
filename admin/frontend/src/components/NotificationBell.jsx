import React, { useEffect, useState } from "react";
import api from "../api";

function NotificationBell({ onOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await api.get("/alertas/");
      const lista = Array.isArray(res.data) ? res.data : [];
      const notSeen = lista.filter(alerta => alerta.visto === false).length;
      setUnreadCount(notSeen);
    } catch (error) {
      console.error("Error fetching unread alerts:", error);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000); // refrescar cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={onOpen}>
      <span style={{ fontSize: "24px" }}>🔔</span>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "red",
            color: "white",
            padding: "2px 6px",
            borderRadius: "50%",
            fontSize: "12px"
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
}

export default NotificationBell;
