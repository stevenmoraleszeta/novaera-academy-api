const express = require('express');
const router = express.Router();
const {
    classResourceValidations,
    getClassResources,
    createClassResource,
    updateClassResource,
    deleteClassResource,
    getClassResourcesByModuleAndClass
} = require('../controllers/classesResourcesController');

router.get('/', getClassResources);
router.post('/', classResourceValidations, createClassResource);
router.put('/:id', classResourceValidations, updateClassResource);
router.delete('/:id', deleteClassResource);

router.get('/by-course-module-class/:courseId/:moduleId/:classId', async (req, res) => {
    return getClassResourcesByModuleAndClass(req, res);
});

module.exports = router;