const pool = require('../db');

// INSERT
const insertCourse = async (req, res) => {
  const {
    title, description, discountedPrice, originalPrice,
    imageUrl, courseIcon, videoUrl, archived,
    createdAt, updatedAt,
    categoryId, mentorId, modalityId
  } = req.body;

  try {
    await pool.query('SELECT sp_insert_course($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [
      title, description, discountedPrice, originalPrice,
      imageUrl, courseIcon, videoUrl, archived,
      createdAt, updatedAt,
      categoryId, mentorId, modalityId
    ]);
    res.status(201).json({ message: 'Curso creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_courses()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const {
    title, description, discountedPrice, originalPrice,
    imageUrl, courseIcon, videoUrl, archived,
    updatedAt,
    categoryId, mentorId, modalityId
  } = req.body;

  try {
    await pool.query('SELECT sp_update_course($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [
      courseId, title, description, discountedPrice, originalPrice,
      imageUrl, courseIcon, videoUrl, archived,
      updatedAt, categoryId, mentorId, modalityId
    ]);
    res.status(200).json({ message: 'Curso actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    await pool.query('SELECT sp_delete_course($1)', [courseId]);
    res.status(200).json({ message: 'Curso eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchCoursesByTitle = async (req, res) => {
  const { title } = req.query;
  try {
    const result = await pool.query('SELECT * FROM sp_search_courses_by_title($1)', [title]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCourseById = async (req, res) => {
  const { courseId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM sp_get_course_by_id($1)', [courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCoursesByCategoryName = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('SELECT * FROM sp_get_courses_by_category_name($1)', [name]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCourseMentor = async (req, res) => {
  const { courseId } = req.params;
  let { mentorId } = req.body;
  // console.log("PUT /courses/:courseId/mentor body:", req.body);

  if (!mentorId) {
    return res.status(400).json({ error: "mentorId es requerido" });
  }

  mentorId = Number(mentorId);
  if (isNaN(mentorId)) {
    return res.status(400).json({ error: "mentorId debe ser numérico" });
  }

  try {
    await pool.query(
      'UPDATE courses SET mentorid = $1, updatedat = NOW() WHERE courseid = $2',
      [mentorId, courseId]
    );
    res.status(200).json({ message: 'Mentor actualizado en el curso.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  insertCourse,
  getCourses,
  updateCourseMentor,
  updateCourse,
  deleteCourse,
  searchCoursesByTitle,
  getCoursesByCategoryName,
  getCourseById,
};
