const cron = require('node-cron');
const pool = require('../db');
const { sendProjectNotification } = require('./mailer');

const checkUpcomingProjects = async () => {
    try {
        const result = await pool.query(`
      SELECT p.*, u.email as student_email
      FROM projects p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.due_date BETWEEN CURRENT_DATE + INTERVAL '2 days' AND CURRENT_DATE + INTERVAL '3 days'
    `);

        for (const project of result.rows) {
            await sendProjectNotification(
                project.student_email,
                'Recordatorio: Proyecto próximo a vencer',
                `El proyecto "${project.title}" vence en 2 días (${project.due_date}). Por favor, asegúrate de completarlo a tiempo.`
            );
        }

        console.log(`Se enviaron ${result.rows.length} notificaciones de recordatorio`);
    } catch (error) {
        console.error('Error al enviar notificaciones automáticas:', error);
    }
};

const startNotificationScheduler = () => {
    cron.schedule('0 9 * * *', checkUpcomingProjects);
    console.log('Programador de notificaciones iniciado');
};

module.exports = {
    startNotificationScheduler
}; 