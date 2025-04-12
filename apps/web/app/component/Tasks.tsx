import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Week {
    title: string;
    goals: string[];
    resources: string[];
}

interface Task {
    id: string;
    title: string;
    totalWeeks: number;
    weeks: string[]; // Changed to string[] since weeks are stored as JSON strings
}

function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/tasks');
                console.log("Tasks response:", response.data);
                
                if (response.data.tasks && Array.isArray(response.data.tasks)) {
                    setTasks(response.data.tasks);
                    setError(null);
                } else {
                    setError("No tasks found");
                }
            } catch (e) {
                console.error("Error fetching tasks:", e);
                setError("Failed to fetch tasks. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) {
        return <div className="p-4 text-lg text-gray-600">Loading tasks...</div>;
    }

    if (error) {
        return <div className="p-4 text-lg text-red-600">{error}</div>;
    }

    if (tasks.length === 0) {
        return <div className="p-4 text-lg text-gray-600">No tasks available</div>;
    }

    return (
        <div className="h-screen overflow-y-auto">
            <div className="max-w-4xl mt-2">
                {tasks.map((task) => (
                    <div key={task.id} className="mb-8 bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
                        <div className="mb-4">
                            <span className="font-semibold">Total Weeks: </span>
                            {task.totalWeeks}
                        </div>
                        <div className="space-y-4">
                            {task.weeks.map((weekStr, index) => {
                                try {
                                    const week: Week = JSON.parse(weekStr);
                                    return (
                                        <div key={index} className="bg-gray-50 rounded-md p-4">
                                            <h3 className="text-xl font-semibold mb-3">{week.title}</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-2">Goals:</h4>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {week.goals.map((goal, i) => (
                                                            <li key={i} className="text-gray-600">{goal}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 mb-2">Resources:</h4>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {week.resources.map((resource, i) => (
                                                            <li key={i} className="text-gray-600">{resource}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    console.error("Error parsing week data:", e);
                                    return (
                                        <div key={index} className="text-red-600">
                                            Error displaying week {index + 1}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tasks;
