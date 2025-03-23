const pool = require('../config/db.config.js')
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadImages = {}

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

uploadImage = async (req, res) => {
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

getImage = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT CAST(image_id as varchar) as id, url FROM images WHERE image_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        };

        res.status(200).json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    uploadImages,
    uploadImage,
    getImage,
}