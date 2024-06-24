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
    const { name, height, weight, starDate, endDate, isMarried } = req.query;

    const wheres = [];
    const params = [];
    const count = []

    if (name) {
        wheres.push('name like "%" || ? || "%"')
        params.push(name)
    }

    if (height) {
        wheres.push('height = ?')
        params.push(height)
    }

    if (weight) {
        wheres.push('weight = ?')
        params.push(weight)
    }

    if (starDate && endDate) {
        wheres.push('birthdate BETWEEN ? and ?');
        params.push(starDate, endDate);
        count.push(starDate, endDate);
    } else if (starDate) {
        wheres.push('birthdate >= ?');
        params.push(starDate);
        count.push(starDate);
    } else if (endDate) {
        wheres.push('birthdate <= ?');
        params.push(endDate);
        count.push(endDate);
    }

    if (isMarried) {
        wheres.push('married = ?')
        params.push(isMarried)
    }

    let sql = 'SELECT * FROM data';

    if (wheres.length > 0) {
        sql += ` WHERE ${wheres}`
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.send(err)
        res.render('read', { rows })
    })
})

app.get('/add', (req, res) => {
    res.render('form', { rows: {} })
})

// app.get('/edit/:index', (req, res) => {
//     const id = req.params.index || 1
//     console.log(id)

//     db.all('SELECT * FROM data WHERE id = ?' [id], (err, rows) => {
//         if (err) return res.send(err)
//         res.render('form', { rows })
//     })
// })

app.listen(3000, () => {
    console.log('Example app listening on port 3000')
})