import React, { useEffect } from "react";
import { FaClipboardList, FaSpinner, FaCheckSquare } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const TaskOverview = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out' });
  }, []);

  // Mock data for task status
  const taskStatusData = [
    {
      id: 1,
      title: "Pending Tasks",
      value: 25,
      color: "text-orange-500",
      icon: <FaClipboardList size={28} />,
      description: "Tasks waiting to be started.",
    },
    {
      id: 2,
      title: "Tasks In Progress",
      value: 12,
      color: "text-yellow-500",
      icon: <FaSpinner size={28} className="animate-spin" />,
      description: "Tasks currently being worked on.",
    },
    {
      id: 3,
      title: "Completed Tasks",
      value: 63,
      color: "text-green-500",
      icon: <FaCheckSquare size={28} />,
      description: "Tasks that have been finished.",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white" data-aos="fade-down">
          Task & Workflow Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {taskStatusData.map((task, index) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 text-center transition-transform transform hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={`${index * 150}`}
            >
              <div className={`mb-4 mx-auto w-16 h-16 flex items-center justify-center rounded-full ${task.color} bg-opacity-20`}>
                {task.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {task.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {task.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TaskOverview;