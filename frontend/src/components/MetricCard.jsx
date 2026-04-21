function MetricCard({ title, value }) {
  return (
    <div className="tarjeta-metrica">
      <div className="tm-cabecera">
        <span className="tm-etiqueta">{title}</span>
      </div>

      <div className="tm-valor">
        {value ?? 0}
        <span className="tm-unidad"> %</span>
      </div>

      <div className="tm-barra">
        <div
          className="tm-barra-relleno"
          style={{ width: `${value ?? 0}%` }}
        ></div>
      </div>
    </div>
  );
}
export default MetricCard;