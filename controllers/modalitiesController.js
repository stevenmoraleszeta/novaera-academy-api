const pool = require('../db');

// INSERT
const insertModality = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_insert_modalities($1)', [name]);
    res.status(201).json({ message: 'Modalidad creada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getModalities = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_modalities()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateModality = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_update_modalities($1, $2)', [id, name]);
    res.status(200).json({ message: 'Modalidad actualizada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteModality = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('SELECT sp_delete_modalities($1)', [id]);
    res.status(200).json({ message: 'Modalidad eliminada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertModality,
  getModalities,
  updateModality,
  deleteModality,
};
