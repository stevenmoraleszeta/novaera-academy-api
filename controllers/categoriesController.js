const pool = require('../db');
const { validationResult, check } = require('express-validator');

// Validaciones reutilizables
const categoryValidations = [
  check('nameCategory')
    .notEmpty().withMessage('El nombre de la categoría es obligatorio')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/).withMessage('El nombre solo puede contener letras y espacios')
    .trim()
];

// Obtener todas las categorías
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_categories()');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Crear nueva categoría
const createCategory = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nameCategory } = req.body;

    // Verificar si la categoría ya existe
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE LOWER(nameCategory) = LOWER($1)',
      [nameCategory]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe una categoría con este nombre'
      });
    }

    await pool.query('SELECT sp_insert_categories($1)', [nameCategory]);

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: { nameCategory }
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      error: 'Error al crear la categoría',
      details: error.message
    });
  }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { nameCategory } = req.body;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de categoría inválido'
      });
    }

    // Verificar si existe la categoría
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE categoryId = $1',
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    // Verificar si el nuevo nombre ya existe en otra categoría
    const duplicateCategory = await pool.query(
      'SELECT * FROM categories WHERE LOWER(nameCategory) = LOWER($1) AND categoryId != $2',
      [nameCategory, id]
    );

    if (duplicateCategory.rows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe otra categoría con este nombre'
      });
    }

    await pool.query('SELECT sp_update_categories($1, $2)', [id, nameCategory]);

    res.json({
      message: 'Categoría actualizada exitosamente',
      category: { id, nameCategory }
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      error: 'Error al actualizar la categoría',
      details: error.message
    });
  }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de categoría inválido'
      });
    }

    // Verificar si existe la categoría
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE categoryId = $1',
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    // Verificar si la categoría está en uso
    const inUseCourses = await pool.query(
      'SELECT COUNT(*) FROM courses WHERE categoryId = $1',
      [id]
    );

    if (parseInt(inUseCourses.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque está siendo utilizada en cursos'
      });
    }

    await pool.query('SELECT sp_delete_categories($1)', [id]);

    res.json({
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      error: 'Error al eliminar la categoría',
      details: error.message
    });
  }
};

module.exports = {
  categoryValidations,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};