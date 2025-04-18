const express = require('express');
const router = express.Router();
const controller = require('../controllers/recordingsController');

router.post('/', controller.insertRecording);
router.get('/', controller.getRecordings);
router.put('/:recordingId', controller.updateRecording);
router.delete('/:recordingId', controller.deleteRecording);

module.exports = router;
