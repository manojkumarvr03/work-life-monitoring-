import { useState } from "react";
import API from "../../services/api";

const ActivityForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    studyHours: "",
    sleepHours: "",
    physicalActivity: "",
    stressLevel: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const res = await API.post("/api/activities", form);
    onAdd(res.data);
    setForm({ studyHours: "", sleepHours: "", physicalActivity: "", stressLevel: "" });
  };

  return (
    <div className="card tracker-card">
      <h3>Log Today Activity</h3>

      <div className="tracker-form">
        <div className="input-group">
          <label>📘 Study Hours</label>
          <input name="studyHours" value={form.studyHours} onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>😴 Sleep Hours</label>
          <input name="sleepHours" value={form.sleepHours} onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>🏃 Physical Activity (min)</label>
          <input name="physicalActivity" value={form.physicalActivity} onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>⚡ Stress Level (1–10)</label>
          <input name="stressLevel" value={form.stressLevel} onChange={handleChange} />
        </div>
      </div>

      <button className="tracker-btn" onClick={handleSubmit}>
        Save Activity
      </button>
    </div>
  );
};

export default ActivityForm;
