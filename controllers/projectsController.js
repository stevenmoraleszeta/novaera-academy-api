const pool = require('../db');
const { sendProjectNotification } = require('../utils/mailer');

// INSERT
const insertProject = async (req, res) => {
  const {
    title, dueDate, fileUrl, orderProject,
    courseId, mentorId, userId
  } = req.body;

  try {
    // Primero obtenemos el correo del estudiante
    const studentResult = await pool.query(
      'SELECT email FROM users WHERE user_id = $1',
      [userId]
    );

    if (studentResult.rows.length === 0) {
      throw new Error('No se encontró el estudiante');
    }

    const studentEmail = studentResult.rows[0].email;

    // Insertamos el proyecto
    await pool.query(
      'SELECT sp_insert_project($1, $2, $3, $4, $5, $6, $7)',
      [title, dueDate, fileUrl, orderProject, courseId, mentorId, userId]
    );

    // Enviamos la notificación al estudiante
    await sendProjectNotification(
      studentEmail,
      'Nuevo Proyecto Asignado',
      `Se te ha asignado un nuevo proyecto: "${title}". Fecha de entrega: ${dueDate}`
    );

    res.status(201).json({ message: 'Proyecto creado exitosamente y notificación enviada al estudiante.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT
const getProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_projects()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const {
    title, dueDate, fileUrl, orderProject,
    courseId, mentorId, userId
  } = req.body;

  try {
    await pool.query(
      'SELECT sp_update_project($1, $2, $3, $4, $5, $6, $7, $8)',
      [projectId, title, dueDate, fileUrl, orderProject, courseId, mentorId, userId]
    );
    res.status(200).json({ message: 'Proyecto actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    await pool.query('SELECT sp_delete_project($1)', [projectId]);
    res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProjectsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM sp_get_projects_by_course($1)', [courseId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  insertProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectsByCourse,
};
