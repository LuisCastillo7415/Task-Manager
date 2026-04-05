function MetricCard({ title, value }) {
  return (
    <div className="tarjeta-metrica">
      <h4>{title}</h4>
      <p>{value ?? 0}%</p>
    </div>
  );
}

export default MetricCard;