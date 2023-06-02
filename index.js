import express from 'express'
import http from 'http'
import fs from 'fs'
import bodyParser from 'body-parser';
import cors from 'cors'
import path from 'path';
import multer from 'multer';

const app = express();
app.use(cors())
const server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

const upload = multer({
    dest: 'uploads/'
});

const dataFilePath = './users.json';
let data = [];
try {
    const rawData = fs.readFileSync(dataFilePath, {
        encoding: 'utf8'
    });
    if (rawData) {
        data = JSON.parse(rawData);
    }
} catch (error) {
    console.error(error);

}


// Create
app.post('/users', (req, res) => {
    const {
        name,
        email
    } = req.body;
    if (!name || !email) {
        return res.status(400).send({
            message: 'Name and email are required'
        });
    }

    let data = [];
    try {
        const rawData = fs.readFileSync(dataFilePath);
        data = JSON.parse(rawData);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error reading data file'
        });
    }

    const id = Date.now().toString();
    const newItem = {
        id,
        name,
        email
    };
    data.push(newItem);

    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error writing data file'
        });
    }

    return res.status(201).send(newItem);
});

// Read All
app.get('/users', (req, res) => {
    let data = [];
    try {
        const rawData = fs.readFileSync(dataFilePath);
        data = JSON.parse(rawData);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error reading data file'
        });
    }

    return res.send(data);
});

// Update
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const {
        name,
        email
    } = req.body;
    const itemIndex = data.findIndex((item) => item.id === id);

    if (itemIndex < 0) {
        return res.status(404).send({
            message: `Item with id ${id} not found`
        });
    }

    const updatedItem = {
        id,
        name,
        email
    };
    data[itemIndex] = updatedItem;

    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error writing data file'
        });
    }

    return res.send(updatedItem);
});

// Delete
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const itemIndex = data.findIndex((item) => item.id === id);

    if (itemIndex < 0) {
        return res.status(404).send({
            message: `Item with id ${id} not found`
        });
    }

    data.splice(itemIndex, 1);

    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error writing data file'
        });
    }

    return res.send({
        message: `Item with id ${id} deleted`
    });
});

app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const item = data.find((item) => item.id === id);

    if (!item) {
        return res.status(404).send({
            message: `Item with id ${id} not found`
        });
    }

    return res.send(item);
});


// upload 
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please upload a file');
        error.status = 400;
        return next(error);
    }
    res.status(200).json({
        message: 'File uploaded successfully'
    });
});

server.listen(3001, () => {
    console.log('my lovely server on sky')
})