import { useEffect, useState } from "react";
import { getSettings, saveSettings, getSysInfo } from "../services/api";

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 46, height: 26, borderRadius: 13,
        background: checked ? "var(--acento)" : "var(--borde-brillante)",
        cursor: "pointer", position: "relative",
        transition: "background 0.25s", flexShrink: 0,
        boxShadow: checked ? "0 0 10px rgba(108,99,255,0.4)" : "none",
      }}
    >
      <div style={{
        position: "absolute", top: 3,
        left: checked ? 23 : 3,
        width: 20, height: 20,
        borderRadius: "50%", background: "#fff",
        transition: "left 0.25s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

function SettingRow({ label, desc, settingKey, settings, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid var(--borde)",
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--texto-primario)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--texto-secundario)", marginTop: 3 }}>{desc}</div>
      </div>
      <Toggle
        checked={!!settings[settingKey]}
        onChange={val => onChange(settingKey, val)}
      />
    </div>
  );
}

function SettingsGroup({ title, icon, children }) {
  return (
    <div className="tarjeta" style={{ padding: "20px 24px" }}>
      <div style={{
        fontSize: 15, fontWeight: 700, marginBottom: 4,
        display: "flex", alignItems: "center", gap: 8
      }}>
        <span>{icon}</span> {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SysInfoCard({ label, value, sub }) {
  return (
    <div className="tarjeta" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 10, color: "var(--texto-tenue)", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--texto-primario)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--texto-secundario)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [sysinfo, setSysinfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error);
    getSysInfo().then(setSysinfo).catch(console.error);
  }, []);

  const handleChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSaving(true);
    setSaved(false);
    try {
      await saveSettings({ [key]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return (
    <div className="cabecera-pagina">
      <div>
        <div className="titulo-pagina">Configuración</div>
        <div className="subtitulo-pagina">Cargando ajustes…</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="cabecera-pagina">
        <div>
          <div className="titulo-pagina">Configuración</div>
          <div className="subtitulo-pagina">Personaliza el comportamiento del monitor.</div>
        </div>
        {(saving || saved) && (
          <div style={{
            fontSize: 12, fontWeight: 600, padding: "7px 16px",
            borderRadius: 8, fontFamily: "'JetBrains Mono', monospace",
            background: saved ? "rgba(0,229,160,0.12)" : "rgba(108,99,255,0.12)",
            color: saved ? "var(--exito)" : "var(--acento)",
            border: `1px solid ${saved ? "rgba(0,229,160,0.3)" : "rgba(108,99,255,0.3)"}`,
          }}>
            {saving ? "💾 Guardando…" : "✓ Guardado"}
          </div>
        )}
      </div>

      {/* Two-column settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* General */}
        <SettingsGroup title="General" icon="⚙️">
          <SettingRow
            label="Alertas de temperatura"
            desc="Notificar cuando >85°C"
            settingKey="tempAlerts"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Auto-refresh"
            desc="Actualizar cada 1000ms"
            settingKey="autoRefresh"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Modo oscuro"
            desc="Tema actual: Dark Pro"
            settingKey="darkMode"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Sonido de alerta"
            desc="Beep al superar umbrales"
            settingKey="alertSound"
            settings={settings} onChange={handleChange}
          />
        </SettingsGroup>

        {/* Monitoreo */}
        <SettingsGroup title="Monitoreo" icon="📊">
          <SettingRow
            label="Historial en disco"
            desc="Guardar datos localmente"
            settingKey="historyOnDisk"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Monitoreo GPU"
            desc={sysinfo?.gpu_name || "NVIDIA GPU"}
            settingKey="gpuMonitor"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Monitoreo de red"
            desc="Ethernet + WiFi"
            settingKey="networkMonitor"
            settings={settings} onChange={handleChange}
          />
          <SettingRow
            label="Modo compacto"
            desc="Reducir tamaño de cards"
            settingKey="compactMode"
            settings={settings} onChange={handleChange}
          />
        </SettingsGroup>
      </div>

      {/* System detected */}
      <div className="tarjeta" style={{ padding: "20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          🖥️ Sistema Detectado
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <SysInfoCard
            label="CPU"
            value={sysinfo ? (sysinfo.cpu_name?.split(' ').slice(0, 4).join(' ') || "CPU") : "—"}
            sub={sysinfo ? `${sysinfo.cpu_cores} núcleos / ${sysinfo.cpu_threads} hilos` : ""}
          />
          <SysInfoCard
            label="GPU"
            value={sysinfo?.gpu_name || "—"}
            sub="Detectado"
          />
          <SysInfoCard
            label="RAM"
            value={sysinfo ? `${sysinfo.ram_total_gb} GB` : "—"}
            sub={sysinfo?.ram_speed || ""}
          />
          <SysInfoCard
            label="OS"
            value={sysinfo?.os_name || "—"}
            sub={sysinfo?.os_build || ""}
          />
        </div>
      </div>

      {/* Uptime & version strip */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: "var(--texto-tenue)",
        fontFamily: "'JetBrains Mono', monospace", padding: "2px 0"
      }}>
        <span>Uptime: {sysinfo?.uptime || "—"} · Polling: 1000ms</span>
        <span>© 2026 PC Monitor Pro v2.4.0</span>
      </div>
    </>
  );
}
