import express from 'express'
import path from "path"
import bodyParser from "body-parser"
import sqlite3 from 'sqlite3'

const app = express();
const dbPath = path.join(path.resolve(), 'data', 'data.db')
const db = new sqlite3.Database(dbPath)

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



app.get('/', (req, res) => {
    res.render('read')
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000')
})