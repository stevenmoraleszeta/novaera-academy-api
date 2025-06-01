const pool = require('../db');

// INSERT
const insertFeature = async (req, res) => {
  const { title, description, iconurl } = req.body;
  try {
    await pool.query(
      'SELECT sp_insert_features($1, $2, $3)',
      [title, description, iconurl]
    );
    res.status(201).json({ message: 'Funcionalidad creada.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT
const getFeatures = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_features()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateFeature = async (req, res) => {
  const { featureId } = req.params;
  const { title, description, iconUrl } = req.body;
  try {
    await pool.query(
      'SELECT sp_update_features($1, $2, $3, $4)',
      [featureId, title, description, iconUrl]
    );
    res.status(200).json({ message: 'Funcionalidad actualizada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteFeature = async (req, res) => {
  const { featureId } = req.params;
  try {
    await pool.query('SELECT sp_delete_features($1)', [featureId]);
    res.status(200).json({ message: 'Funcionalidad eliminada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertFeature,
  getFeatures,
  updateFeature,
  deleteFeature,
};
