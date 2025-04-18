const pool = require('../db');
const { validationResult, check } = require('express-validator');

// Validaciones reutilizables
const classResourceValidations = [
  check('classId')
    .notEmpty().withMessage('El ID de la clase es obligatorio')
    .isInt().withMessage('El ID de la clase debe ser un número entero'),

  check('contentResource')
    .notEmpty().withMessage('El contenido del recurso es obligatorio')
    .isString().withMessage('El contenido debe ser una cadena de texto'),

  check('typeResource')
    .notEmpty().withMessage('El tipo de recurso es obligatorio')
    .isIn(['video', 'documento', 'imagen', 'enlace', 'quiz']).withMessage('Tipo de recurso no válido'),

  check('orderResource')
    .notEmpty().withMessage('El orden del recurso es obligatorio')
    .isInt({ min: 1 }).withMessage('El orden debe ser un número entero positivo'),

  check('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Formato de tiempo inválido (HH:MM:SS)'),

  check('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Formato de tiempo inválido (HH:MM:SS)')
    .custom((value, { req }) => {
      if (value && req.body.startTime) {
        const start = new Date(`1970-01-01T${req.body.startTime}`);
        const end = new Date(`1970-01-01T${value}`);
        if (end <= start) {
          throw new Error('El tiempo final debe ser mayor al tiempo inicial');
        }
      }
      return true;
    }),

  check('width')
    .optional()
    .isFloat({ min: 0 }).withMessage('El ancho debe ser un número positivo'),

  check('height')
    .optional()
    .isFloat({ min: 0 }).withMessage('La altura debe ser un número positivo')
];

// Obtener todos los recursos
const getClassResources = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_class_resources()');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener recursos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Crear nuevo recurso
const createClassResource = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      classId,
      contentResource,
      typeResource,
      orderResource,
      startTime,
      endTime,
      width,
      height
    } = req.body;

    // Verificar si existe la clase
    const classExists = await pool.query(
      'SELECT 1 FROM classes WHERE classId = $1',
      [classId]
    );

    if (classExists.rows.length === 0) {
      return res.status(404).json({
        error: 'La clase especificada no existe'
      });
    }

    // Verificar si ya existe un recurso con el mismo orden en la misma clase
    const orderExists = await pool.query(
      'SELECT 1 FROM class_resources WHERE classId = $1 AND orderResource = $2',
      [classId, orderResource]
    );

    if (orderExists.rows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un recurso con ese orden en esta clase'
      });
    }

    // Validaciones específicas por tipo de recurso
    if (typeResource === 'video') {
      if (!startTime || !endTime) {
        return res.status(400).json({
          error: 'Los recursos de video requieren tiempo de inicio y fin'
        });
      }
    }

    if (typeResource === 'imagen') {
      if (!width || !height) {
        return res.status(400).json({
          error: 'Los recursos de imagen requieren ancho y alto'
        });
      }
    }

    await pool.query(
      'SELECT sp_insert_class_resource($1, $2, $3, $4, $5, $6, $7, $8)',
      [classId, contentResource, typeResource, orderResource, startTime, endTime, width, height]
    );

    res.status(201).json({
      message: 'Recurso creado exitosamente',
      resource: { classId, contentResource, typeResource, orderResource, startTime, endTime, width, height }
    });
  } catch (error) {
    console.error('Error al crear recurso:', error);
    res.status(500).json({
      error: 'Error al crear el recurso',
      details: error.message
    });
  }
};

// Actualizar recurso
const updateClassResource = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      classId,
      contentResource,
      typeResource,
      orderResource,
      startTime,
      endTime,
      width,
      height
    } = req.body;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de recurso inválido'
      });
    }

    // Verificar si existe el recurso
    const resourceExists = await pool.query(
      'SELECT 1 FROM class_resources WHERE resourceId = $1',
      [id]
    );

    if (resourceExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
      });
    }

    // Verificar si existe la clase
    const classExists = await pool.query(
      'SELECT 1 FROM classes WHERE classId = $1',
      [classId]
    );

    if (classExists.rows.length === 0) {
      return res.status(404).json({
        error: 'La clase especificada no existe'
      });
    }

    // Verificar si ya existe otro recurso con el mismo orden en la misma clase
    const orderExists = await pool.query(
      'SELECT 1 FROM class_resources WHERE classId = $1 AND orderResource = $2 AND resourceId != $3',
      [classId, orderResource, id]
    );

    if (orderExists.rows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe otro recurso con ese orden en esta clase'
      });
    }

    // Validaciones específicas por tipo de recurso
    if (typeResource === 'video') {
      if (!startTime || !endTime) {
        return res.status(400).json({
          error: 'Los recursos de video requieren tiempo de inicio y fin'
        });
      }
    }

    if (typeResource === 'imagen') {
      if (!width || !height) {
        return res.status(400).json({
          error: 'Los recursos de imagen requieren ancho y alto'
        });
      }
    }

    await pool.query(
      'SELECT sp_update_class_resource($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, classId, contentResource, typeResource, orderResource, startTime, endTime, width, height]
    );

    res.json({
      message: 'Recurso actualizado exitosamente',
      resource: { id, classId, contentResource, typeResource, orderResource, startTime, endTime, width, height }
    });
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    res.status(500).json({
      error: 'Error al actualizar el recurso',
      details: error.message
    });
  }
};

// Eliminar recurso
const deleteClassResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de recurso inválido'
      });
    }

    // Verificar si existe el recurso
    const resourceExists = await pool.query(
      'SELECT 1 FROM class_resources WHERE resourceId = $1',
      [id]
    );

    if (resourceExists.rows.length === 0) {
      return res.status(404).json({
        error: 'Recurso no encontrado'
      });
    }

    await pool.query('SELECT sp_delete_class_resource($1)', [id]);

    res.json({
      message: 'Recurso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    res.status(500).json({
      error: 'Error al eliminar el recurso',
      details: error.message
    });
  }
};

module.exports = {
  classResourceValidations,
  getClassResources,
  createClassResource,
  updateClassResource,
  deleteClassResource
};