const METRICS = [
  { value: "14,200+", label: "Certificados emitidos" },
  { value: "99.4%", label: "Validez comprobable" },
  { value: "45+", label: "Centros técnicos" },
  { value: "0%", label: "Comisión por matrícula" },
];

export function MetricStrip() {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 border-stone-200/80 text-center">
      {METRICS.map((metric) => (
        <div key={metric.label}>
          <p className="font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight font-mono">
            {metric.value}
          </p>
          <p className="text-xs text-stone-600 font-medium mt-1">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}
