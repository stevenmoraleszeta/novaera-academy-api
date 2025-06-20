const pool = require('../db');

const insertRecording = async (req, res) => {
  const { title, url, orderrecording, courseid } = req.body;

  if (!title || !url || !courseid) {
    return res.status(400).json({ error: 'Título, URL y ID del curso son requeridos.' });
  }
  try {
    const result = await pool.query('SELECT * FROM sp_insert_recording($1, $2, $3, $4)', [title, url, orderrecording, courseid]);
  
    if (result.rows && result.rows.length > 0) {
      const newRecording = result.rows[0];
      res.status(201).json(newRecording);
    } else {
      res.status(500).json({ error: 'Error en el servidor al confirmar la inserción.' });
    }
  } catch (error) {
    console.error('!! ERROR en el controlador insertRecording:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get recording by ID
const getRecordingsById = async (req, res) => {
  const { courseId } = req.params; 
  try {
    const result = await pool.query('SELECT * FROM sp_select_recordings_by_course($1)', [courseId]); 
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  const { title, url } = req.body;  
  try {
    const result = await pool.query('SELECT * FROM sp_update_recording($1, $2, $3)', [recordingId, title, url]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Grabación no encontrada.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error en updateRecording:', error);
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
  getRecordingsById,
  updateRecording,
  deleteRecording,
};
