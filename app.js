const express = require('express')
const connectToMongo = require('./dataBase');
var cors = require('cors')
require('dotenv').config()

connectToMongo();
const app = express()

 
app.use(cors())//-->middleware
const port = process.env.PORT;
app.use(express.json())//-->Middleware

app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`cloudbook's backend listening at http://localhost:${port}`)
})