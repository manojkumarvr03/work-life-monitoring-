import { useState } from "react";

const QuestionCard = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState(null);

  const handleClick = (option) => {
    if (selected) return;
    setSelected(option);
    onAnswer(option === question.answer);
  };

  return (
    <div className="question-card">
      <h4>{question.question}</h4>

      <div className="options">
        {question.options.map((opt, i) => {
          let cls = "option";
          if (selected) {
            if (opt === question.answer) cls += " correct";
            else if (opt === selected) cls += " wrong";
          }

          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleClick(opt)}
              disabled={!!selected}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
