-- USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HABITOS
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    frequency VARCHAR(50), -- daily, weekly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REGISTRO DE HABITOS
CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INT REFERENCES habits(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    date DATE NOT NULL
);

-- TAREAS / AGENDA
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROGRESO (estadísticas)
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- habit, task, gym
    value INT,
    date DATE
);