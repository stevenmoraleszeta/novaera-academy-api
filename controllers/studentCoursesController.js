const pool = require('../db');

// INSERT
const insertStudentCourse = async (req, res) => {
  // console.log("Body recibido:", req.body);
  const { userId, courseId, enrollmentDate } = req.body;

  try {
    await pool.query('SELECT sp_insert_student_courses($1, $2, $3)', [
      userId,
      courseId,
      enrollmentDate,
    ]);
    res.status(201).json({ message: 'Curso del estudiante registrado correctamente.' });
  } catch (error) {
    console.error("Error en insertStudentCourse:", error); // <-- agrega esto
    res.status(400).json({ error: error.message, detail: error.detail });
  }
};

// SELECT
const getStudentCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_student_courses()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentCoursesById = async (req, res) => {
  const { courseId, id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM student_courses WHERE userId = $1 AND courseId = $2', [id, courseId]);
    if (result.rows.length === 0) {
      // return res.status(404).json({ message: 'El estudiante no se encuentra inscrito en este curso.' });
      return res.status(200).json([]);
    }
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// SELECT BY COURSE
const getStudentCoursesByCourse = async (req, res) => {
  const { courseId } = req.params;
  const numericCourseId = Number(courseId);
  try {
    const result = await pool.query('SELECT * FROM sp_select_student_courses_by_course($1)', [
      numericCourseId,
    ]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error en getStudentCoursesByCourse:", error);
    res.status(500).json({ error: error.message, detail: error.detail });
  }
};

// UPDATE
const updateStudentCourse = async (req, res) => {
  const { id } = req.params;
  const { userId, courseId, enrollmentDate } = req.body;

  try {
    await pool.query('SELECT sp_update_student_courses($1, $2, $3, $4)', [
      id,
      userId,
      courseId,
      enrollmentDate,
    ]);
    res.status(200).json({ message: 'Curso del estudiante actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteStudentCourse = async (req, res) => {
  const { id } = req.params;
  // console.log("Intentando eliminar studentcourseid:", id);
  try {
    await pool.query('SELECT sp_delete_student_courses($1)', [Number(id)]);
    res.status(200).json({ message: 'Curso del estudiante eliminado exitosamente.' });
  } catch (error) {
    console.error("Error en deleteStudentCourse:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertStudentCourse,
  getStudentCourses,
  updateStudentCourse,
  deleteStudentCourse,
  getStudentCoursesById,
  getStudentCoursesByCourse
};
