const pool = require('../db');

// INSERT
const insertMentor = async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query('SELECT sp_insert_mentor($1)', [userId]);
    res.status(201).json({ message: 'Mentor creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT
const getMentors = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_mentors()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateMentor = async (req, res) => {
  const { mentorId } = req.params;
  const { userId } = req.body;

  try {
    await pool.query('SELECT sp_update_mentor($1, $2)', [mentorId, userId]);
    res.status(200).json({ message: 'Mentor actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteMentor = async (req, res) => {
  const { mentorId } = req.params;
  try {
    await pool.query('SELECT sp_delete_mentor($1)', [mentorId]);
    res.status(200).json({ message: 'Mentor eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertMentor,
  getMentors,
  updateMentor,
  deleteMentor,
};
