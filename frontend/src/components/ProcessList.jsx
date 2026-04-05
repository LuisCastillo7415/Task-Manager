function ProcessList({ processes }) {
  return (
    <div>
      <h3>Procesos</h3>
      {processes.map((p, i) => (
        <div key={i}>{p.name} - {p.cpu}%</div>
      ))}
    </div>
  );
}

export default ProcessList;