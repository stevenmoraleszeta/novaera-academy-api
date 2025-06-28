const pool = require('../db'); 

const getStudent = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_users_students()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 2. INSERTAR un nuevo estudiante (un usuario con rol 9)
const insertStudent = async (req, res) => {
    try {
        const {
            firstname, lastname1, lastname2, age, email, phone, country,
            occupation, learningstyle, interests, initiallevel, personalgoals
        } = req.body;

        const result = await pool.query(
          'SELECT * FROM sp_insert_user_with_profile($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', 
          [firstname, lastname1, lastname2, age, email, phone, country, 9, occupation, learningstyle, interests, initiallevel, personalgoals]
        );
        const newStudentId = result.rows[0].sp_insert_user_with_profile;
        if (!newStudentId) {
            throw new Error('La función de inserción no devolvió un ID de usuario.');
        }
        const { rows } = await pool.query('SELECT * FROM sp_get_student_by_id($1)', [newStudentId]);
       if (rows.length === 0) {
            return res.status(404).json({ message: 'No se pudo encontrar el estudiante recién creado.' });
        }
        res.status(201).json(rows[0]); 
    } catch (error) {
        console.error("Error al insertar estudiante:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear el estudiante.' });
    }
};

// UPDATE
const updateStudent = async (req, res) => {
  const userId = parseInt(req.params.userid, 10);
  const {
    firstname, lastname1, lastname2, age, email, phone, country,
    photourl, roleid, 
    occupation, learningstyle, interests, initiallevel, personalgoals
  } = req.body;

  try {
    await pool.query(
      'SELECT * FROM sp_update_user($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [userId, firstname, lastname1,
        lastname2, age, email, phone, country, photourl, parseInt(roleid, 10), new Date()]
    );

    await pool.query('SELECT * FROM sp_update_student_profile_new($1, $2, $3, $4, $5, $6)', [userId, occupation, learningstyle, 
        interests, initiallevel, personalgoals ]
    );

    const { rows: allStudents } = await pool.query('SELECT * FROM sp_select_users_students()');
    const updatedStudent = allStudents.find(student => student.userid === userId);

    if (!updatedStudent) {
        return res.status(404).json({ message: 'Usuario no encontrado...' });
    }
    res.status(200).json(updatedStudent);

  } catch (error) {
    console.error("Error al actualizar el perfil completo del usuario:", error);
    res.status(500).json({ error: error.message });
  }
};


// DELETE
const deleteStudent = async (req, res) => {
    const userId = parseInt(req.params.userid, 10);

  try {
    await pool.query('SELECT sp_delete_user_new($1)', [userId]);
    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
    getStudent,
    insertStudent,
    updateStudent,
    deleteStudent,
};