const pool = require('../db');

// INSERT
const insertStudentProfile = async (req, res) => {
  const {
    userId, interests, course, learningStyle,
    initialLevel, personalGoals, occupation
  } = req.body;

  try {
    await pool.query(
      'SELECT sp_insert_student_profile($1, $2, $3, $4, $5, $6, $7)',
      [userId, interests, course, learningStyle, initialLevel, personalGoals, occupation]
    );
    res.status(201).json({ message: 'Perfil de estudiante creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getStudentProfiles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_student_profiles()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateStudentProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    interests, course, learningStyle,
    initialLevel, personalGoals, occupation
  } = req.body;

  try {
    await pool.query(
      'SELECT sp_update_student_profile($1, $2, $3, $4, $5, $6, $7)',
      [userId, interests, course, learningStyle, initialLevel, personalGoals, occupation]
    );
    res.status(200).json({ message: 'Perfil actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteStudentProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query('SELECT sp_delete_student_profile($1)', [userId]);
    res.status(200).json({ message: 'Perfil eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertStudentProfile,
  getStudentProfiles,
  updateStudentProfile,
  deleteStudentProfile,
};
