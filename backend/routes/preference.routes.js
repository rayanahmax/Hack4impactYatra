const express = require('express')
const { createPreference, getAllPreference, getInterestEnum } = require('../controller/preference.controller')
const router = express.Router()

router.post('/create', createPreference)
router.get('/:id', getAllPreference)

module.exports = router