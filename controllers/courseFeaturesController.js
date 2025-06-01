const pool = require('../db');

// INSERT
const insertCourseFeature = async (req, res) => {
  const { courseId, featureId, order } = req.body;
  try {
    await pool.query('SELECT sp_insert_course_features($1, $2, $3)', [courseId, featureId, order]);
    res.status(201).json({ message: 'Relación curso-funcionalidad creada.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT
const getCourseFeatures = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_course_features()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseFeaturesByCourseId = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      `SELECT cf.*, f.title, f.description, f.iconurl
       FROM course_features cf
       JOIN features f ON cf.featureid = f.featureid
       WHERE cf.courseid = $1
       ORDER BY cf.order`,
      [courseId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateCourseFeature = async (req, res) => {
  const { id } = req.params;
  const { courseId, featureId } = req.body;
  try {
    await pool.query(
      'SELECT sp_update_course_features($1, $2, $3)',
      [id, courseId, featureId]
    );
    res.status(200).json({ message: 'Relación curso-funcionalidad actualizada.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCourseFeatureOrder = async (req, res) => {
  const { id } = req.params; // id = coursefeatureid
  const { order } = req.body;
  try {
    await pool.query(
      'UPDATE course_features SET "order" = $1 WHERE coursefeatureid = $2',
      [order, id]
    );
    res.status(200).json({ message: 'Orden actualizado.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteCourseFeature = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('SELECT sp_delete_course_features($1)', [id]);
    res.status(200).json({ message: 'Relación curso-funcionalidad eliminada.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertCourseFeature,
  getCourseFeatures,
  updateCourseFeature,
  deleteCourseFeature,
  getCourseFeaturesByCourseId,
  updateCourseFeatureOrder,
};
