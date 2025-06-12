const pool = require('../db');

// Obtener clases completadas por un usuario
const getCompletedClassesByUser = async (req, res) => {
    const { userid } = req.params;

    try {
        const result = await pool.query(
            'SELECT classid FROM completed_classes WHERE userid = $1',
            [userid]
        );
        const completedClassIds = result.rows.map(row => row.classid);
        res.json({ completedClasses: completedClassIds });
    } catch (error) {
        console.error('Error al obtener clases completadas:', error);
        res.status(500).json({
            error: 'Error al obtener clases completadas',
            details: error.message
        });
    }
};

// Actualizar el progreso (completar o descompletar clases)
const updateCompletedClasses = async (req, res) => {
    const { userid } = req.params;
    let { completedClasses } = req.body;

    if (!Array.isArray(completedClasses)) {
        return res.status(400).json({ error: 'El campo completedClasses debe ser un arreglo' });
    }

    completedClasses = [...new Set(completedClasses)].filter(id => !!id);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Borrar las clases anteriores completadas
        await client.query('DELETE FROM completed_classes WHERE userid = $1', [userid]);

        // Insertar nuevas
        for (const classid of completedClasses) {
            await client.query(
                'INSERT INTO completed_classes (userid, classid) VALUES ($1, $2)',
                [userid, classid]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Progreso actualizado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al actualizar clases completadas:', error);
        res.status(500).json({
            error: 'Error al actualizar clases completadas',
            details: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getCompletedClassesByUser,
    updateCompletedClasses
};
