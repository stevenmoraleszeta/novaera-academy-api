const express = require('express');
const router = express.Router();
const {
    classResourceValidations,
    getClassResources,
    createClassResource,
    updateClassResource,
    deleteClassResource
} = require('../controllers/classesResourcesController');

router.get('/', getClassResources);
router.post('/', classResourceValidations, createClassResource);
router.put('/:id', classResourceValidations, updateClassResource);
router.delete('/:id', deleteClassResource);

module.exports = router;