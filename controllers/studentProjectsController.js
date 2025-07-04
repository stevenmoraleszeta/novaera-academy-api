const pool = require('../db');
const { sendProjectNotification } = require('../utils/mailer');

// INSERT
const insertStudentProject = async (req, res) => {
  const {
    title, dueDate, submissionDate, fileUrl, studentFileUrl,
    comments, score, courseId, projectId, userId, mentorId, statusId,
    studentEmail, mentorEmail
  } = req.body;

  try {
    await pool.query(
      'SELECT sp_insert_student_project($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [
        title, dueDate, submissionDate, fileUrl, studentFileUrl,
        comments, score, courseId, projectId, userId, mentorId, statusId
      ]
    );

    // Enviar correo al estudiante
    await sendProjectNotification(
      studentEmail,
      'Nuevo Proyecto Enviado',
      `Se ha enviado tu proyecto "${title}" exitosamente. Fecha de entrega: ${dueDate}`
    );

    // Enviar correo al mentor
    await sendProjectNotification(
      mentorEmail,
      'Nuevo Proyecto Asignado',
      `Se ha recibido  un nuevo proyecto "${title}" que requiere tu revisión. Fecha de entrega: ${dueDate}`
    );

    res.status(201).json({ message: 'Entrega de proyecto registrada exitosamente y notificaciones enviadas.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const searchStudentProjectsByStudentName = async (req, res) => {
  const { studentName } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM sp_search_student_projects_by_student_name($1)',
      [studentName]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SELECT
const getStudentProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_projects_details_new()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE FALTA ESTO URGE!!!!!
const updateStudentProject = async (req, res) => {
  const { studentProjectId } = req.params;
  const {
    project_title, project_duedate, submissiondate, fileurl, studentfileurl,
    comments, score, courseid, projectid, student_userid, mentor_userid, statusid
  } = req.body;

  try {
    await pool.query(
      'SELECT sp_update_student_project($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
      [
        studentProjectId, project_title, project_duedate, submissiondate, fileurl, studentfileurl,
        comments, score, courseid, projectid, student_userid, mentor_userid, statusid
      ]
    );
    const { rows } = await pool.query('SELECT * FROM sp_select_student_project_by_id($1)', [studentProjectId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proyecto no encontrado después de la actualización.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteStudentProject = async (req, res) => {
  const { studentProjectId } = req.params;

  try {
    await pool.query('SELECT sp_delete_student_project($1)', [studentProjectId]);
    res.status(200).json({ message: 'Entrega eliminada exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getStudentProjectsByStatusName = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('SELECT * FROM sp_get_student_projects_by_status_name($1)', [name]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const submitStudentProject = async (req, res) => {
  const { studentFileUrl, userId, comments = null } = req.body;
  const { projectId } = req.params;

  try {
    console.log("Recibiendo entrega de proyecto:", { projectId, userId, studentFileUrl });

    // Buscar el registro de student_project para este usuario y proyecto
    const studentProjectResult = await pool.query(
      'SELECT * FROM student_projects WHERE projectid = $1 AND userid = $2',
      [projectId, userId]
    );

    if (studentProjectResult.rows.length === 0) {
      return res.status(404).json({
        error: 'No se encontró asignación de proyecto para este estudiante.'
      });
    }

    const studentProject = studentProjectResult.rows[0];

    // Actualizar con la entrega del estudiante
    await pool.query(
      `UPDATE student_projects 
       SET studentfileurl = $1, submissiondate = NOW(), comments = $2
       WHERE studentprojectid = $3`,
      [studentFileUrl, comments, studentProject.studentprojectid]
    );

    // Obtener el proyecto actualizado
    const updatedResult = await pool.query(
      'SELECT * FROM student_projects WHERE studentprojectid = $1',
      [studentProject.studentprojectid]
    );

    console.log("Proyecto entregado exitosamente:", updatedResult.rows[0]);

    res.status(200).json({
      message: 'Proyecto entregado exitosamente.',
      studentProject: updatedResult.rows[0]
    });
  } catch (error) {
    console.error("Error al entregar proyecto:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertStudentProject,
  getStudentProjects,
  updateStudentProject,
  deleteStudentProject,
  searchStudentProjectsByStudentName,
  getStudentProjectsByStatusName,
  submitStudentProject
};
