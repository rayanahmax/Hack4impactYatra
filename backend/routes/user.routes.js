const express = require('express')
const { registerUser, loginUser, getUser } = require('../controller/user.controller')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', auth, getUser)
router.get('/:id',auth,  getUser)

module.exports = router