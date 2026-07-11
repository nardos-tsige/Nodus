// src/mockData.js

export const mockTopics = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Components, state, props, and hooks.",
    status: "in_progress",
    created_at: "2024-01-15T10:00:00",
    updated_at: "2024-01-20T14:30:00"
  },
  {
    id: 2,
    title: "FastAPI and Python Backend",
    description: "REST APIs, SQLAlchemy, Pydantic, auth.",
    status: "not_started",
    created_at: "2024-01-15T10:00:00",
    updated_at: "2024-01-15T10:00:00"
  },
  {
    id: 3,
    title: "Database Design",
    description: "SQL, relationships, indexes, and migrations.",
    status: "complete",
    created_at: "2024-01-16T09:00:00",
    updated_at: "2024-01-18T16:20:00"
  }
]

export const mockTopicDetail = {
  id: 1,
  title: "React Fundamentals",
  description: "Components, state, props, and hooks.",
  status: "in_progress",
  created_at: "2024-01-15T10:00:00",
  updated_at: "2024-01-20T14:30:00",
  resources: [
    {
      id: 1,
      topic_id: 1,
      url: "https://react.dev",
      label: "Official React Docs",
      created_at: "2024-01-16T10:00:00"
    },
    {
      id: 2,
      topic_id: 1,
      url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
      label: "React Course for Beginners",
      created_at: "2024-01-17T11:00:00"
    }
  ],
  notes: [
    {
      id: 1,
      topic_id: 1,
      body: "useState returns a value and a setter function.",
      created_at: "2024-01-16T09:00:00",
      updated_at: "2024-01-16T09:00:00"
    },
    {
      id: 2,
      topic_id: 1,
      body: "useEffect runs after render. Empty array = run once.",
      created_at: "2024-01-17T14:30:00",
      updated_at: "2024-01-17T15:00:00"
    }
  ]
}