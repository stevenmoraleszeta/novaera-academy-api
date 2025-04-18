const pool = require('../db');

// INSERT
const insertProjectStatus = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_insert_project_statuses($1)', [name]);
    res.status(201).json({ message: 'Estado del proyecto creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getProjectStatuses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_project_statuses()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_update_project_statuses($1, $2)', [id, name]);
    res.status(200).json({ message: 'Estado del proyecto actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteProjectStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('SELECT sp_delete_project_statuses($1)', [id]);
    res.status(200).json({ message: 'Estado del proyecto eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertProjectStatus,
  getProjectStatuses,
  updateProjectStatus,
  deleteProjectStatus,
};
