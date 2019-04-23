const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const sqlite = require('sqlite');
const dbConnection = sqlite.open('banco.sqlite', { Promise });

const port = process.env.PORT | 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home
app.get('/home', async (req, res) => {
    
    const db = await dbConnection;
    const categoriasDB = await db.all('SELECT * FROM categorias;');
    const vagasDB = await db.all('SELECT * FROM vagas;');

    const categorias = categoriasDB.map(categoria => {
        return {
            ...categoria,
            vagas: vagasDB.filter(vaga => vaga.categoria === categoria.id)
        }
    });

    res.render('home', { categorias });

});

app.get('/vaga/:id', async (req, res) => {
    
    const idVaga = req.params.id;
    const db = await dbConnection;
    const vaga = await db.get(`SELECT * FROM vagas WHERE id = ${idVaga};`);
    
    res.render('vaga', { vaga });

});

app.get('/admin', (req, res) => {
    res.render('admin/home-admin');
});

// Vagas
app.get('/admin/vagas', async (req, res) => {
    const db = await dbConnection;
    const vagas = await db.all('SELECT * FROM vagas;');
    res.render('admin/vagas', { vagas });
});

app.get('/admin/vagas/nova', async (req, res) => {
    const db = await dbConnection;
    const categorias = await db.all('SELECT * FROM categorias;');
    res.render('admin/nova-vaga', { categorias });
});

app.post('/admin/vagas/nova', async (req, res) => {
    const { titulo, descricao, categoria } = req.body;
    const db = await dbConnection;
    await db.run(`INSERT INTO vagas(categoria, titulo, descricao) VALUES ('${categoria}', '${titulo}', '${descricao}');`);
    res.redirect('/admin/vagas');
});

app.get('/admin/vagas/editar/:id', async (req, res) => {
    const idVaga = req.params.id;
    const db = await dbConnection;
    const categorias = await db.all('SELECT * FROM categorias;');
    const vaga = await db.get(`SELECT * FROM vagas WHERE id = ${idVaga};`);
    res.render('admin/editar-vaga', { categorias, vaga });
});

app.post('/admin/vagas/editar/:id', async (req, res) => {
    const { categoria, titulo, descricao } = req.body;
    const idVaga = req.params.id;
    const db = await dbConnection;
    await db.run(`UPDATE vagas SET categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' WHERE id = ${idVaga};`);
    res.redirect('/admin/vagas');
});

app.get('/admin/vagas/delete/:id', async(req, res) => {
    const idVaga = req.params.id;
    const db = await dbConnection;
    await db.run(`DELETE FROM vagas WHERE id = ${idVaga};`);
    res.redirect('/admin/vagas');
});


// Categorias
app.get('/admin/categorias', async (req, res) => {
    const db = await dbConnection;
    const categorias = await db.all('SELECT * FROM categorias;');
    res.render('admin/categorias', { categorias });
});

app.get('/admin/categorias/nova', (req, res) => {
    res.render('admin/nova-categoria');
});

app.post('/admin/categorias/nova', async (req, res) => {
    const categoria = req.body.categoria;
    const db = await dbConnection;
    await db.run(`INSERT INTO categorias (categoria) VALUES ('${categoria}');`);
    res.redirect('/admin/categorias');
});

app.get('/admin/categorias/editar/:id', async (req, res) => {
    const idCategoria = req.params.id;
    const db = await dbConnection;
    const categoria = await db.get(`SELECT * FROM categorias WHERE id = ${idCategoria};`);
    res.render('admin/editar-categoria', { categoria });
});

app.post('/admin/categorias/editar/:id', async (req, res) => {
    const categoria = req.body.categoria;
    const idCategoria = req.params.id;
    const db = await dbConnection;
    db.run(`UPDATE categorias SET categoria = '${categoria}' WHERE id = ${idCategoria};`);
    res.redirect('/admin/categorias');
});

app.get('/admin/categorias/delete/:id', async (req, res) => {
    const idCategoria = req.params.id;
    const db = await dbConnection;
    db.run(`DELETE FROM categorias WHERE id = ${idCategoria};`);
    res.redirect('/admin/categorias');
})


// ---------------------------------------------------------------------
const init = async () => {
    const db = await dbConnection;
    await db.run('CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY, categoria TEXT);');
    await db.run('CREATE TABLE IF NOT EXISTS vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);');
}

init();

app.listen(port, (err) => {
    if (err) {
        console.log('Erro ao conectar o servidor');
    } else {
        console.log('Servidor online http://localhost:3000/home');
    }
});