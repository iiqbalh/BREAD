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

    const { name, height, weight, starDate, endDate, isMarried, search } = req.query;

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

    const page = req.query.page
    const limit = 5
    const offset = (page - 1) * limit

    let sql = 'SELECT COUNT(*) AS total FROM data';
    let sqlCount = 'SELECT * FROM data ORDER BY id LIMIT ? OFFSET ?';

    if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(` ${search} `)}`
        sqlCount += ` WHERE ${wheres.join(` ${search} `)}`
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.send(err)
        const total = rows[0].total
        const pages = math.ceil(total / limit)

        db.all(sqlCount, [limit, offset], (err, rows) => {
            if (err) return res.send(err)
            res.render('read', { rows, pages ,query: req.query })
        })
    })
})

app.get('/add', (req, res) => {
    res.render('form', { rows: {} })
})

app.post('/add', (req, res) => {

    db.run('INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)',
     [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.isMarried], (err) => {
        if(err) res.send(err)
        else res.redirect('/')
    })
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000')
})