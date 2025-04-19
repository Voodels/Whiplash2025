import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LearningPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/learning-plans/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!plan) return <div>Plan not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{plan.topic}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Frequency</h3>
          <p>{plan.frequency}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Daily Time</h3>
          <p>{plan.dailyTime} minutes</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">Target Days</h3>
          <p>{plan.targetDays} days</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Study Plan</h2>
        {/* Add your learning resources and progress tracking here */}
      </div>
    </div>
  );
};

export default LearningPlanDetail;