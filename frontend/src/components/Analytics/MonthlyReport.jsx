const MonthlyReport = ({ data }) => {
  return (
    <ul style={{ marginTop: "12px" }}>
      {data.map((m, i) => (
        <li key={i}>
          📅 <strong>{m.month}</strong> — {m.hours} hrs
        </li>
      ))}
    </ul>
  );
};

export default MonthlyReport;
