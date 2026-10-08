import React from "react";
import { TaskList } from "../components/TaskList";

export const Tasks: React.FC = () => {
  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">All Tasks</h1>
      </div>
      <TaskList />
    </div>
  );
};
