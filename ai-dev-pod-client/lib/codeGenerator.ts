/**
 * Code generation utility for project starter templates
 * Generates boilerplate code based on project descriptions
 */

export interface CodeTemplate {
  language: string;
  filename: string;
  code: string;
  description: string;
}

export const generateProjectCode = (projectName: string, projectDescription: string): CodeTemplate[] => {
  const templates: CodeTemplate[] = [];

  const combinedText = `${projectName} ${projectDescription}`.toLowerCase();
  const isSchedulePlanner =
    combinedText.includes('schedule') ||
    combinedText.includes('planner') ||
    combinedText.includes('task');
  const isCalculator =
    combinedText.includes('calculator') ||
    combinedText.includes('calc') ||
    combinedText.includes('arithmetic');

  if (isSchedulePlanner) {
    templates.push(
      {
        language: 'typescript',
        filename: 'types.ts',
        description: 'Type definitions for Schedule Planner',
        code: `export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: string;
  notes?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  reminder?: boolean;
}

export interface DailySchedule {
  date: Date;
  tasks: Task[];
  events: ScheduleEvent[];
  notes: string;
}

export interface SchedulePlannerState {
  schedules: DailySchedule[];
  selectedDate: Date;
  filter: 'all' | 'completed' | 'pending';
}`
      },
      {
        language: 'typescript',
        filename: 'useSchedule.ts',
        description: 'Custom hook for schedule management',
        code: `import { useState, useCallback } from 'react';
import { Task, ScheduleEvent, DailySchedule } from './types';

export function useSchedule() {
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);

  const addTask = useCallback((date: Date, task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };

    setSchedules(prev => {
      const existingSchedule = prev.find(s => 
        s.date.toDateString() === date.toDateString()
      );

      if (existingSchedule) {
        return prev.map(s =>
          s.date.toDateString() === date.toDateString()
            ? { ...s, tasks: [...s.tasks, newTask] }
            : s
        );
      }

      return [...prev, {
        date,
        tasks: [newTask],
        events: [],
        notes: '',
      }];
    });
  }, []);

  const addEvent = useCallback((date: Date, event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = {
      ...event,
      id: Date.now().toString(),
    };

    setSchedules(prev => {
      const existingSchedule = prev.find(s => 
        s.date.toDateString() === date.toDateString()
      );

      if (existingSchedule) {
        return prev.map(s =>
          s.date.toDateString() === date.toDateString()
            ? { ...s, events: [...s.events, newEvent] }
            : s
        );
      }

      return [...prev, {
        date,
        tasks: [],
        events: [newEvent],
        notes: '',
      }];
    });
  }, []);

  const completeTask = useCallback((date: Date, taskId: string) => {
    setSchedules(prev =>
      prev.map(s =>
        s.date.toDateString() === date.toDateString()
          ? {
              ...s,
              tasks: s.tasks.map(t =>
                t.id === taskId ? { ...t, completed: true } : t
              ),
            }
          : s
      )
    );
  }, []);

  const deleteTask = useCallback((date: Date, taskId: string) => {
    setSchedules(prev =>
      prev.map(s =>
        s.date.toDateString() === date.toDateString()
          ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
          : s
      )
    );
  }, []);

  const updateNotes = useCallback((date: Date, notes: string) => {
    setSchedules(prev => {
      const existingSchedule = prev.find(s => 
        s.date.toDateString() === date.toDateString()
      );

      if (existingSchedule) {
        return prev.map(s =>
          s.date.toDateString() === date.toDateString()
            ? { ...s, notes }
            : s
        );
      }

      return [...prev, {
        date,
        tasks: [],
        events: [],
        notes,
      }];
    });
  }, []);

  const getScheduleForDate = useCallback((date: Date) => {
    return schedules.find(s => s.date.toDateString() === date.toDateString());
  }, [schedules]);

  return {
    schedules,
    addTask,
    addEvent,
    completeTask,
    deleteTask,
    updateNotes,
    getScheduleForDate,
  };
}`
      },
      {
        language: 'typescript',
        filename: 'ScheduleComponent.tsx',
        description: 'React component for displaying schedule',
        code: `'use client';

import React, { useState } from 'react';
import { useSchedule } from './useSchedule';
import { Task, ScheduleEvent } from './types';

export function ScheduleComponent() {
  const {
    schedules,
    addTask,
    addEvent,
    completeTask,
    deleteTask,
    updateNotes,
    getScheduleForDate,
  } = useSchedule();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentSchedule = getScheduleForDate(selectedDate);

  const handleAddTask = (title: string, description: string) => {
    addTask(selectedDate, {
      title,
      description,
      dueDate: selectedDate,
      priority: 'medium',
      completed: false,
    });
  };

  const handleAddEvent = (title: string, startTime: Date, endTime: Date) => {
    addEvent(selectedDate, {
      title,
      startTime,
      endTime,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tasks Section */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-bold">Tasks</h3>
          <div className="space-y-2">
            {currentSchedule?.tasks.map(task => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded border p-3"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => completeTask(selectedDate, task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={task.completed ? 'line-through' : ''}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm opacity-75">{task.description}</p>
                  )}
                  <span className={\`text-xs px-2 py-1 rounded mt-1 inline-block \${
                    task.priority === 'high' ? 'bg-red-100' :
                    task.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }\`}>
                    {task.priority}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(selectedDate, task.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Events Section */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-bold">Events</h3>
          <div className="space-y-2">
            {currentSchedule?.events.map(event => (
              <div key={event.id} className="rounded border p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm opacity-75">
                  {event.startTime.toLocaleTimeString()} - {event.endTime.toLocaleTimeString()}
                </p>
                {event.location && (
                  <p className="text-sm opacity-75">📍 {event.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-bold">Notes</h3>
        <textarea
          value={currentSchedule?.notes || ''}
          onChange={(e) => updateNotes(selectedDate, e.target.value)}
          placeholder="Add notes for this day..."
          className="w-full rounded border p-3 min-h-32"
        />
      </div>
    </div>
  );
}`
      }
    );
  }

  if (isCalculator) {
    templates.push(
      {
        language: 'html',
        filename: 'index.html',
        description: 'Calculator layout and button structure',
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple Calculator</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="calculator">
      <input id="display" class="display" type="text" value="0" readonly />
      <div class="keys">
        <button data-action="clear" class="key utility">C</button>
        <button data-action="delete" class="key utility">DEL</button>
        <button data-value="/" class="key operator">/</button>
        <button data-value="*" class="key operator">*</button>

        <button data-value="7" class="key">7</button>
        <button data-value="8" class="key">8</button>
        <button data-value="9" class="key">9</button>
        <button data-value="-" class="key operator">-</button>

        <button data-value="4" class="key">4</button>
        <button data-value="5" class="key">5</button>
        <button data-value="6" class="key">6</button>
        <button data-value="+" class="key operator">+</button>

        <button data-value="1" class="key">1</button>
        <button data-value="2" class="key">2</button>
        <button data-value="3" class="key">3</button>
        <button data-action="equals" class="key equals" rowspan="2">=</button>

        <button data-value="0" class="key key-zero">0</button>
        <button data-value="." class="key">.</button>
      </div>
    </main>

    <script src="script.js"></script>
  </body>
</html>`
      },
      {
        language: 'css',
        filename: 'styles.css',
        description: 'Responsive calculator styling with proper spacing',
        code: `:root {
  --bg: #f6f7fb;
  --panel: #ffffff;
  --text: #1f2937;
  --muted: #e5e7eb;
  --operator: #2563eb;
  --operator-text: #ffffff;
  --equals: #059669;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #ffffff, var(--bg));
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.calculator {
  width: min(360px, 92vw);
  background: var(--panel);
  border: 1px solid var(--muted);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.display {
  width: 100%;
  border: 1px solid var(--muted);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 1.8rem;
  text-align: right;
  color: var(--text);
}

.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.key {
  border: 1px solid var(--muted);
  border-radius: 10px;
  min-height: 52px;
  font-size: 1rem;
  background: #fff;
  cursor: pointer;
}

.key:hover {
  background: #f9fafb;
}

.operator {
  background: var(--operator);
  color: var(--operator-text);
  border-color: transparent;
}

.utility {
  background: #eef2ff;
}

.equals {
  background: var(--equals);
  color: #fff;
  border-color: transparent;
}

.key-zero {
  grid-column: span 2;
}`
      },
      {
        language: 'javascript',
        filename: 'script.js',
        description: 'Calculator logic for basic arithmetic operations',
        code: `const display = document.getElementById('display');
const keys = document.querySelector('.keys');

let expression = '0';

function updateDisplay() {
  display.value = expression;
}

function appendValue(value) {
  if (expression === '0' && value !== '.') {
    expression = value;
  } else {
    expression += value;
  }
  updateDisplay();
}

function clearAll() {
  expression = '0';
  updateDisplay();
}

function removeLast() {
  expression = expression.slice(0, -1);
  if (!expression) expression = '0';
  updateDisplay();
}

function calculate() {
  try {
    const result = Function('"use strict"; return (' + expression + ')')();
    expression = String(result);
  } catch {
    expression = 'Error';
  }
  updateDisplay();
}

keys.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const value = target.dataset.value;
  const action = target.dataset.action;

  if (value) {
    appendValue(value);
    return;
  }

  if (action === 'clear') {
    clearAll();
  } else if (action === 'delete') {
    removeLast();
  } else if (action === 'equals') {
    calculate();
  }
});`
      }
    );
  }

  return templates;
};

export const getCodeTemplates = (
  projectName: string,
  projectDescription: string
): CodeTemplate[] => {
  return generateProjectCode(projectName, projectDescription);
};
