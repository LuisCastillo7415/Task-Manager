import { useEffect, useState } from "react";

function Topbar() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString("en-US", { hour12: true }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="barra-superior">
      <div className="insignia-estado">
        <div className="punto-estado" />
        System Healthy
      </div>
      <div className="barra-superior-derecha">
        <div className="reloj-vivo">
          🕐 <span>{hora}</span>
          <span className="etiqueta-vivo">LIVE</span>
        </div>
        <div className="boton-notificacion" title="Notificaciones">
          🔔<div className="punto-notificacion" />
        </div>
        <div className="info-usuario">
          <div className="texto-usuario">
            <div className="nombre-usuario">Admin User</div>
            <div className="rol-usuario">Superuser</div>
          </div>
          <div className="avatar-usuario">AU</div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;