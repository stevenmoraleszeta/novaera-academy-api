const pool = require('../db');

// INSERT
const insertRole = async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_insert_roles($1)', [name]);
    res.status(201).json({ message: 'Rol creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_roles()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query('SELECT sp_update_roles($1, $2)', [id, name]);
    res.status(200).json({ message: 'Rol actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('SELECT sp_delete_roles($1)', [id]);
    res.status(200).json({ message: 'Rol eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertRole,
  getRoles,
  updateRole,
  deleteRole,
};
