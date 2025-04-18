const express = require('express');
const router = express.Router();
const controller = require('../controllers/featuresController');

router.post('/', controller.insertFeature);
router.get('/', controller.getFeatures);
router.put('/:featureId', controller.updateFeature);
router.delete('/:featureId', controller.deleteFeature);

module.exports = router;
