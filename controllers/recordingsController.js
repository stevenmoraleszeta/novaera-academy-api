const pool = require('../db');

// INSERT
const insertRecording = async (req, res) => {
  const { title, url, orderRecording, courseId } = req.body;
  try {
    await pool.query('SELECT sp_insert_recording($1, $2, $3, $4)', [title, url, orderRecording, courseId]);
    res.status(201).json({ message: 'Grabación creada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT
const getRecordings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_recordings()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateRecording = async (req, res) => {
  const { recordingId } = req.params;
  const { title, url, orderRecording, courseId } = req.body;
  try {
    await pool.query('SELECT sp_update_recording($1, $2, $3, $4, $5)', [recordingId, title, url, orderRecording, courseId]);
    res.status(200).json({ message: 'Grabación actualizada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteRecording = async (req, res) => {
  const { recordingId } = req.params;
  try {
    await pool.query('SELECT sp_delete_recording($1)', [recordingId]);
    res.status(200).json({ message: 'Grabación eliminada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertRecording,
  getRecordings,
  updateRecording,
  deleteRecording,
};
