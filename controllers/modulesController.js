const pool = require('../db');

// INSERT
const insertModule = async (req, res) => {
  const { title, orderModule, courseId } = req.body;
  try {
    await pool.query('SELECT sp_insert_module($1, $2, $3)', [title, orderModule, courseId]);
    res.status(201).json({ message: 'Módulo creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getModulesByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const resultModules = await pool.query(
      'SELECT * FROM sp_select_modules_by_course($1)',
      [courseId]
    );

    const modules = resultModules.rows;

    const modulesWithClasses = await Promise.all(
      modules.map(async (mod) => {
        const resultClasses = await pool.query(
          'SELECT * FROM classes WHERE moduleId = $1 ORDER BY orderClass',
          [mod.moduleid]
        );
        return {
          ...mod,
          classes: resultClasses.rows,
        };
      })
    );

    res.status(200).json(modulesWithClasses);
  } catch (error) {
    console.error("Error al obtener módulos con clases:", error);
    res.status(500).json({ error: error.message });
  }
};

// SELECT
const getModules = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_modules()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateModule = async (req, res) => {
  const { moduleId } = req.params;
  const { title, orderModule, courseId } = req.body;
  try {
    await pool.query('SELECT sp_update_module($1, $2, $3, $4)', [moduleId, title, orderModule, courseId]);
    res.status(200).json({ message: 'Módulo actualizado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteModule = async (req, res) => {
  const { moduleId } = req.params;
  try {
    await pool.query('SELECT sp_delete_module($1)', [moduleId]);
    res.status(200).json({ message: 'Módulo eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertModule,
  getModules,
  getModulesByCourse,
  updateModule,
  deleteModule,
};
