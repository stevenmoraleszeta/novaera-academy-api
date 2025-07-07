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
      'SELECT email FROM users WHERE userid = $1',
      [userId]
    );

    const mentorResult = await pool.query(
      'SELECT u.email, u.roleid FROM users u INNER JOIN mentors m ON u.userid = m.userid WHERE m.mentorid = $1',
      [mentorId]
    );

    if (studentResult.rows.length === 0 && mentorResult.rows.length === 0) {
      throw new Error('No se encontró el estudiante o el mentor');
    }

    const studentEmail = studentResult.rows[0].email;

    // Insertamos el proyecto y obtenemos los datos del proyecto creado
    const projectResult = await pool.query(
      'INSERT INTO projects (title, duedate, fileurl, orderproject, courseid, mentorid, userid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, dueDate, fileUrl, orderProject, courseId, mentorId, userId]
    );

    const newProject = projectResult.rows[0];
    console.log("Proyecto creado:", newProject);

    // Crear automáticamente registros en student_projects para todos los estudiantes del curso
    if (courseId) {
      console.log("Creando asignaciones para todos los estudiantes del curso", courseId);

      // Obtener todos los estudiantes inscritos en el curso
      const studentsInCourse = await pool.query(
        'SELECT userid FROM student_courses WHERE courseid = $1',
        [courseId]
      );

      console.log(`Encontrados ${studentsInCourse.rows.length} estudiantes en el curso`);

      // Crear registro en student_projects para cada estudiante
      const studentProjectPromises = studentsInCourse.rows.map(async (student) => {
        try {
          const result = await pool.query(
            `INSERT INTO student_projects 
             (title, duedate, submissiondate, fileurl, studentfileurl, comments, score, courseid, projectid, userid, mentorid, statusid)
             VALUES ($1, $2, NULL, $3, NULL, NULL, NULL, $4, $5, $6, $7, 2)
             RETURNING studentprojectid`,
            [
              newProject.title,
              newProject.duedate,
              newProject.fileurl,
              newProject.courseid,
              newProject.projectid,
              student.userid,
              newProject.mentorid,
            ]
          );
          return { success: true, studentId: student.userid, recordId: result.rows[0].studentprojectid };
        } catch (error) {
          return { success: false, studentId: student.userid, error: error.message };
        }
      });

      const assignmentResults = await Promise.all(studentProjectPromises);
      const successfulAssignments = assignmentResults.filter(result => result.success);
      const failedAssignments = assignmentResults.filter(result => !result.success);

      console.log(`Asignaciones exitosas: ${successfulAssignments.length}`);
      if (failedAssignments.length > 0) {
        console.warn(`Asignaciones fallidas: ${failedAssignments.length}`, failedAssignments);
      }
    }

    // Enviamos la notificación al estudiante (si falla, no debe afectar la creación del proyecto)
    try {
      await sendProjectNotification(
        studentEmail,
        'Nuevo Proyecto Asignado',
        `Se te ha asignado un nuevo proyecto: "${title}". Fecha de entrega: ${dueDate}`
      );
      console.log("Notificación enviada exitosamente");
    } catch (notificationError) {
      console.error("Error enviando notificación:", notificationError);
      // No lanzamos el error para que no afecte la creación del proyecto
    }

    const responseData = {
      message: 'Proyecto creado exitosamente y asignado a todos los estudiantes del curso.',
      project: newProject
    };

    console.log("Enviando respuesta:", responseData);
    res.status(201).json(responseData);
  } catch (error) {
    console.error("Error en insertProject:", error);
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
    console.log(`Iniciando eliminación del proyecto ${projectId}`);

    // Primero eliminar todos los student-projects relacionados
    const studentProjectsResult = await pool.query(
      'DELETE FROM student_projects WHERE projectid = $1 RETURNING *',
      [projectId]
    );

    console.log(`Eliminados ${studentProjectsResult.rowCount} student-projects relacionados`);

    // Luego eliminar el proyecto principal
    await pool.query('SELECT sp_delete_project($1)', [projectId]);

    console.log(`Proyecto ${projectId} eliminado exitosamente`);
    res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
  } catch (error) {
    console.error(`Error al eliminar proyecto ${projectId}:`, error);
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

// Asignar proyectos existentes a un estudiante recién inscrito
const assignExistingProjectsToStudent = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const projectsResult = await pool.query(
      'SELECT * FROM projects WHERE courseid = $1 ORDER BY orderproject',
      [courseId]
    );

    if (projectsResult.rows.length === 0) {
      return res.status(200).json({
        message: 'No hay proyectos en este curso para asignar.',
        assignedProjects: 0
      });
    }

    console.log(`Encontrados ${projectsResult.rows.length} proyectos en el curso`);

    // Verificar qué proyectos ya están asignados al estudiante
    const existingAssignments = await pool.query(
      'SELECT projectid FROM student_projects WHERE userid = $1 AND courseid = $2',
      [userId, courseId]
    );

    const alreadyAssignedProjects = existingAssignments.rows.map(row => row.projectid);
    console.log(`Proyectos ya asignados al estudiante: ${alreadyAssignedProjects.length}`);

    // Filtrar proyectos que no están asignados
    const projectsToAssign = projectsResult.rows.filter(project =>
      !alreadyAssignedProjects.includes(project.projectid)
    );

    if (projectsToAssign.length === 0) {
      return res.status(200).json({
        message: 'El estudiante ya tiene asignados todos los proyectos del curso.',
        assignedProjects: 0
      });
    }

    const assignmentPromises = projectsToAssign.map(async (project) => {
      try {
        const result = await pool.query(
          `INSERT INTO student_projects 
           (title, duedate, submissiondate, fileurl, studentfileurl, comments, score, courseid, projectid, userid, mentorid, statusid)
           VALUES ($1, $2, NULL, $3, NULL, NULL, NULL, $4, $5, $6, $7, 2)
           RETURNING studentprojectid`,
          [
            project.title,
            project.duedate,
            project.fileurl,
            project.courseid,
            project.projectid,
            userId,
            project.mentorid,
          ]
        );
        console.log(`Proyecto ${project.projectid} asignado al estudiante ${userId}: ${result.rows[0].studentprojectid}`);
        return { success: true, projectId: project.projectid, projectTitle: project.title };
      } catch (error) {
        console.error(`Error asignando proyecto ${project.projectid} al estudiante ${userId}:`, error.message);
        return { success: false, projectId: project.projectid, error: error.message };
      }
    });

    const assignmentResults = await Promise.all(assignmentPromises);
    const successfulAssignments = assignmentResults.filter(result => result.success);
    const failedAssignments = assignmentResults.filter(result => !result.success);

    console.log(`Asignaciones exitosas: ${successfulAssignments.length}`);
    if (failedAssignments.length > 0) {
      console.warn(`Asignaciones fallidas: ${failedAssignments.length}`, failedAssignments);
    }

    res.status(200).json({
      message: `Se asignaron ${successfulAssignments.length} proyectos al estudiante.`,
      assignedProjects: successfulAssignments.length,
      totalProjects: projectsToAssign.length,
      successfulAssignments: successfulAssignments,
      failedAssignments: failedAssignments
    });

  } catch (error) {
    console.error("Error en assignExistingProjectsToStudent:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectsByCourse,
  assignExistingProjectsToStudent
};
