const pool = require('../db');
const { validationResult, check } = require('express-validator');

// Validaciones reutilizables
const classValidations = [
  check('courseId')
    .notEmpty().withMessage('El ID del curso es obligatorio'),

  check('moduleId')
    .notEmpty().withMessage('El ID del módulo es obligatorio'),

  check('title')
    .notEmpty().withMessage('El título de la clase es obligatorio'),

  check('orderClass')
    .notEmpty().withMessage('El orden de la clase es obligatorio'),

  check('restricted')
    .isBoolean().withMessage('El campo restricted debe ser un valor booleano')
];

// Obtener todas las clases
const getClasses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_classes()');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clases:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Crear nueva clase
const createClass = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, moduleId, title, orderClass, restricted } = req.body;

    // Verificar si existe el curso
    const courseExists = await pool.query(
      'SELECT 1 FROM courses WHERE courseId = $1',
      [courseId]
    );

    if (courseExists.rows.length === 0) {
      return res.status(404).json({
        error: 'El curso especificado no existe'
      });
    }

    // Verificar si existe el módulo
    const moduleExists = await pool.query(
      'SELECT 1 FROM modules WHERE moduleId = $1',
      [moduleId]
    );

    if (moduleExists.rows.length === 0) {
      return res.status(404).json({
        error: 'El módulo especificado no existe'
      });
    }

    // Verificar si ya existe una clase con el mismo orden en el mismo módulo
    const orderExists = await pool.query(
      'SELECT 1 FROM classes WHERE moduleId = $1 AND orderClass = $2',
      [moduleId, orderClass]
    );

    if (orderExists.rows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe una clase con ese orden en este módulo'
      });
    }

    await pool.query(
      'SELECT sp_insert_class($1, $2, $3, $4, $5)',
      [courseId, moduleId, title, orderClass, restricted]
    );

    res.status(201).json({
      message: 'Clase creada exitosamente',
      class: { courseId, moduleId, title, orderClass, restricted }
    });
  } catch (error) {
    console.error('Error al crear clase:', error);
    res.status(500).json({
      error: 'Error al crear la clase',
      details: error.message
    });
  }
};

// Actualizar clase
const updateClass = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { courseId, moduleId, title, orderClass, restricted } = req.body;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de clase inválido'
      });
    }

    // Verificar si existe la clase
    const classExists = await pool.query(
      'SELECT 1 FROM classes WHERE classId = $1',
      [id]
    );

    if (classExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    // Verificar si existe el curso
    const courseExists = await pool.query(
      'SELECT 1 FROM courses WHERE courseId = $1',
      [courseId]
    );

    if (courseExists.rows.length === 0) {
      return res.status(404).json({
        error: 'El curso especificado no existe'
      });
    }

    // Verificar si existe el módulo
    const moduleExists = await pool.query(
      'SELECT 1 FROM modules WHERE moduleId = $1',
      [moduleId]
    );

    if (moduleExists.rows.length === 0) {
      return res.status(404).json({
        error: 'El módulo especificado no existe'
      });
    }

    await pool.query(
      'SELECT sp_update_class($1, $2, $3, $4, $5, $6)',
      [id, courseId, moduleId, title, orderClass, restricted]
    );

    res.json({
      message: 'Clase actualizada exitosamente',
      class: { id, courseId, moduleId, title, orderClass, restricted }
    });
  } catch (error) {
    console.error('Error al actualizar clase:', error);
    res.status(500).json({
      error: 'Error al actualizar la clase',
      details: error.message
    });
  }
};

// Eliminar clase
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de clase inválido'
      });
    }

    // Verificar si existe la clase
    const classExists = await pool.query(
      'SELECT 1 FROM classes WHERE classId = $1',
      [id]
    );

    if (classExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Clase no encontrada'
      });
    }

    // Verificar si la clase tiene recursos asociados
    const hasResources = await pool.query(
      'SELECT 1 FROM class_resources WHERE classId = $1',
      [id]
    );

    if (hasResources.rows.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la clase porque tiene recursos asociados'
      });
    }

    // Eliminar referencias en completed_classes antes de eliminar la clase
    await pool.query('DELETE FROM completed_classes WHERE classid = $1', [id]);
    await pool.query('SELECT sp_delete_class($1)', [id]);

    res.json({
      message: 'Clase eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar clase:', error);
    res.status(500).json({
      error: 'Error al eliminar la clase',
      details: error.message
    });
  }
};
const getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener clase
    const classResult = await pool.query('SELECT * FROM classes WHERE classId = $1', [id]);

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const classData = classResult.rows[0];

    // Obtener recursos de la clase
    const resourcesResult = await pool.query(
      'SELECT * FROM class_resources WHERE classId = $1 ORDER BY orderResource ASC',
      [id]
    );

    classData.resources = resourcesResult.rows;

    res.json(classData);
  } catch (error) {
    console.error('Error al obtener clase por ID:', error);
    res.status(500).json({
      error: 'Error interno al obtener la clase',
      details: error.message
    });
  }
};

const getClassesByCourseModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM classes WHERE courseId = $1 AND moduleId = $2 ORDER BY orderClass',
      [courseId, moduleId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las clases del módulo:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  classValidations,
  getClasses,
  createClass,
  updateClass,
  getClassById,
  deleteClass,
  getClassesByCourseModule
};