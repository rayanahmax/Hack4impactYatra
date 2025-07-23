require('dotenv').config()
const express = require('express')
const { connectDB } = require('./config/db')
const app = express()
const cors = require('cors')



app.use(express.json())
app.use(express.urlencoded({ extended: true }));
connectDB()
app.use(cors())



app.use('/api/user', require('./routes/user.routes'))
app.use('/api/preference', require('./routes/preference.routes'))


const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`sercer is running on http://localhost:${port}`)
})