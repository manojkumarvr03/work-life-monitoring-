const ResultCard = ({ score, total }) => {
  return (
    <div className="result-card">
      <h2>🎉 Today Result</h2>
      <p>
        Score: <strong>{score}</strong> / {total}
      </p>
    </div>
  );
};

export default ResultCard;
