import pool from "../config/db.js";

// ✅ Crear hábito
export const createHabit = async (req, res) => {
  try {
    const { title, description, frequency } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: "El título es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO habits (user_id, title, description, frequency)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, description, frequency]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Obtener hábitos del usuario
export const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Actualizar hábito
export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, frequency } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE habits
       SET title = $1, description = $2, frequency = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [title, description, frequency, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Eliminar hábito
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hábito no encontrado" });
    }

    res.json({ message: "Hábito eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};