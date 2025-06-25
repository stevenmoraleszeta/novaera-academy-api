const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// INSERT
// Necesito hacer otro modal
const insertUser = async (req, res) => {
  const {
    firstName, lastName1, lastName2, age, email, phone, country,
    photoUrl, roleId, password
  } = req.body;

  try {
    // Encriptar la contraseña usando bcrypt
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    await pool.query('SELECT sp_insert_user($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [
      firstName, lastName1, lastName2, age, email, phone, country,
      photoUrl, roleId, encryptedPassword, new Date(), new Date()
    ]);
    res.status(201).json({ message: 'Usuario creado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// SELECT ALL
const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sp_select_users()');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateUser = async (req, res) => {
  const userId = parseInt(req.params.userId);
  const {
    firstname, lastname1, lastname2, age, email, phone, country,
    photourl, roleid, updatedAt
  } = req.body;

  try {
    const roleIdAsInt = parseInt(roleid, 10);
    await pool.query('SELECT sp_update_user($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [
      userId, firstname, lastname1, lastname2, age, email, phone, country,
      photourl, roleIdAsInt, updatedAt
    ]);
    const { rows } = await pool.query('SELECT * FROM sp_select_user_by_id_new($1)', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado después de la actualización.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    await pool.query('SELECT sp_delete_user($1)', [userId]);
    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET USER PROFILE
const getLoggedInUserProfile = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó un token de autenticación' });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el userId del token decodificado
    const userId = decoded.userId;
    const result = await pool.query('SELECT * FROM sp_select_user_by_id($1)', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  insertUser,
  getUsers,
  updateUser,
  deleteUser,
  getLoggedInUserProfile
};
