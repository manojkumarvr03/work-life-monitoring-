import { useEffect, useState } from "react";
import API from "../../services/api";

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    API.get("/api/activities")
      .then((res) => setActivities(res.data.slice(0, 2)))
      .catch(console.error);
  }, []);

  return (
    <>
      {activities.map((a) => (
        <div key={a._id} className="history-item">
          <p>{new Date(a.createdAt).toLocaleDateString()}</p>
          <p>Study: {a.studyHours} hrs</p>
          <p>Sleep: {a.sleepHours} hrs</p>
        </div>
      ))}
    </>
  );
};

export default ActivityHistory;
