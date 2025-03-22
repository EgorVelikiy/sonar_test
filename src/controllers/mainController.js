const pool = require('../config/db.config.js')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadImages = {}

exports.deleteCard = async (req, res) => {
    let { id } = req.params;
    try {
        const imagePath = path.join(__dirname, '../public', image, uploadImages[image].format);
        fs.unlink(imagePath)
        await pool.query('DELETE FROM cards WHERE card_id = $1', [Number(id)])
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
  
const upload = multer({ storage: storage });

exports.uploadImage = async (req, res) => {
    upload.single('file') (req, res, async(err) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        };

        const fileName = req.file.filename
        const fileUrl = `http://localhost:${process.env.PORT}/public/${fileName}`;
        const id = path.basename(fileName, path.extname(fileName));

        uploadImages[id] = {
            format: path.extname(fileName),
            url: fileUrl,
        };
        
        res.status(200).json({id: id, url: fileUrl});
    });
};

exports.createCard = async (req, res) => {
    const { plate, image} = req.body.data;
    
    try {
        const cardResult = await pool.query('INSERT INTO Cards (card_id, plate) values ($1, $2) RETURNING *', [image, plate]);
        const fileUrl = uploadImages[image].url
        const imageResult = await pool.query('INSERT INTO Images (image_id, card_id, url) values ($1, $2, $3) RETURNING *', [image, image, fileUrl]);

        const data = {
            id: cardResult.rows[0].card_id.toString(),
            plate: cardResult.rows[0].plate,
            image: {
                id: imageResult.rows[0].image_id.toString(),
                url: imageResult.rows[0].url.toString(),
            },
            createdAt: cardResult.rows[0].createdAt,
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.udpateCard = async (req, res) => {
    const { plate, image} = req.body.data;
    console.log(req.body.data)
    try {
        const updatedCard = await pool.query('')
        const updatedImage = await pool.query('')
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};