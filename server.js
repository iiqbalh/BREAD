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
    const url = req.url == '/' ? '/?page=1' : req.url
    const { page = 1, name, height, weight, starDate, endDate, isMarried, search } = req.query;

    const wheres = [];
    const params = [];
    const count = [];
    const limit = 5;
    const offset = (page - 1) * limit;

    if (name) {
        wheres.push('name like "%" || ? || "%"')
        params.push(name)
        count.push(name)
    }

    if (height) {
        wheres.push('height = ?')
        params.push(height)
        count.push(height)
    }

    if (weight) {
        wheres.push('weight = ?')
        params.push(weight)
        count.push(weight)
    }

    if (starDate && endDate) {
        wheres.push(`birthdate BETWEEN ? and ?`)
        params.push(starDate, endDate)
        count.push(starDate, endDate)
    } else if (starDate) {
        wheres.push('birthdate >= ?')
        params.push(starDate)
        count.push(starDate)
    } else if (endDate) {
        wheres.push('birthdate <= ?')
        params.push(endDate)
        count.push(endDate)
    }

    if (isMarried) {
        wheres.push('married = ?')
        params.push(isMarried)
        count.push(isMarried);
    }

    let sqlCount = 'SELECT COUNT(*) AS total FROM data';
    let sql = 'SELECT * FROM data';

    if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(` ${search} `)}`
        sqlCount += ` WHERE ${wheres.join(` ${search} `)}`
    }

    sql += ' ORDER BY id LIMIT ? OFFSET ?'
    params.push(limit, offset)

    console.log(sqlCount, count)

    db.get(sqlCount, count, (err, rows) => {
        const total = rows.total
        const pages = Math.ceil(total / limit)

        db.all(sql, params, (err, rows) => {
            console.log(page, pages)
            if (err) res.send(err)
            else res.render('read', { rows, page: Number(page), pages, offset, query: req.query, url })
        })
    })
})

app.get('/add', (req, res) => {
    const header = 'Adding Data'
    res.render('form', { rows: {}, header })
})

app.post('/add', (req, res) => {

    db.run('INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)',
        [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.isMarried], (err) => {
            if (err) res.send(err)
            else res.redirect('/')
        })
})

app.get('/edit/:id', (req, res) => {
    const id = req.params.id
    const header = 'Updating Data'
    db.get('SELECT * FROM data WHERE id = ?', [id], (err, rows) => {
        if (err) res.send(err)
        else res.render('form', { rows, header })
    })
})

app.post('/edit/:id', (req, res) => {
    const id = req.params.id
    db.run('UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?',
     [req.body.name, req.body.height, req.body.weight, req.body.birthdate, req.body.isMarried, id], (err) => {
        if (err) res.send(err)
        else res.redirect('/')
    })
})

app.get('/delete/:id', (req, res) => {
    const id = req.params.id
    db.get('DELETE FROM data WHERE id = ?', [id], (err, rows) => {
        if (err) res.send(err)
        else res.redirect('/')
    })
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000')
})