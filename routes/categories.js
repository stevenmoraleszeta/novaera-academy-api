const express = require('express');
const router = express.Router();
const {
    categoryValidations,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoriesController');

router.get('/', getCategories);
router.post('/', categoryValidations, createCategory);
router.put('/:id', categoryValidations, updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;