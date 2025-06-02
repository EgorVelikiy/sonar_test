const pool = require('../config/db.config.js');
const path = require('path');
const fs = require('fs');
const { uploadImages } = require('../controllers/ImageController');

exports.getGallery = async (req, res) => {
    const search = req.query.search;
    let query = `
        SELECT 
            c.card_id AS id, 
            c.plate AS plate, 
            i.image_id AS "image.id", 
            i.url AS "image.url", 
            c.createdAt as "createdAt"
        FROM Cards c
        JOIN Images i ON c.card_id = i.card_id`

    let queryParams = [];

    if (search) {
        query += ` WHERE c.plate ILIKE $1`
        queryParams.push(`%${search}%`)   
    }

    try {
        const result = await pool.query(query, queryParams);
        const gallery = result.rows.map(row => ({
            id: row.id.toString(),
            plate: row.plate,
            image: {
              id: row['image.id'].toString(),
              url: row['image.url'].toString(),
            },
            createdAt: row.createdAt,
        })); 

        res.status(200).json(gallery);
    } catch(err) {
        res.status(500).json({error: err.message})
    }
};

exports.getCard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                c.card_id as id, 
                c.plate as plate,
                i.image_id AS "image.id",
                i.url AS "image.url",
                c.createdat as "createdAt"
            FROM 
                Cards c
            JOIN
                Images i ON c.card_id = i.card_id
            WHERE c.card_id = $1`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        };

        const row = result.rows[0]
        const data = {
            id: row.id.toString(),
            plate: row.plate,
            image: {
                id: row['image.id'].toString(),
                url: row['image.url'].toString(),
            },
            createdAt: row.createdAt,
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCard = async (req, res) => {
    const { plate, image} = req.body.data;
    try {
        const cardResult = await pool.query('INSERT INTO Cards (plate) values ($1) RETURNING *', [plate]);
        const fileUrl = uploadImages[image].url
        const imageResult = await pool.query('INSERT INTO Images (image_id, card_id, url) values ($1, $2, $3) RETURNING *', [image, cardResult.rows[0].card_id, fileUrl]);

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

exports.deleteCard = async (req, res) => {
    let { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM images WHERE card_id = $1 RETURNING *', [id]);
        await pool.query('DELETE FROM cards WHERE card_id = $1', [id]);

        const image_id = result.rows[0].image_id

        if (uploadImages[image_id]) {
            const imagePath = path.join(__dirname, '../../public', image_id + uploadImages[image_id].format);
            fs.unlink(imagePath, (err) => {
                if (!err) {
                    console.log('Image deleted');
                }
            })

            delete uploadImages[image_id]
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.udpateCard = async (req, res) => {
    const { plate, image} = req.body.data;
    const { id } = req.params

    const updateCardQuery = `UPDATE Cards SET plate = $1 WHERE card_id = $2 RETURNING *`;
    let updateImageQuery = `SELECT * FROM Images WHERE card_id = $1`

    let cardParams = [plate, id];
    let imageParams = [];

    try {
        const oldImageId = await pool.query(`SELECT image_id FROM Images WHERE card_id = $1`, [id]);
        const oldImageIdResult = oldImageId.rows[0].image_id

        if (oldImageIdResult !== image) {
            let newfileUrl = uploadImages[image].url;
            updateImageQuery = `UPDATE Images SET image_id = $1, url = $2 WHERE card_id = $3 RETURNING *`;
            imageParams.push(image, newfileUrl, id)
        }

        const updateCardResult = await pool.query(updateCardQuery, cardParams)
        const updateImageResult = await pool.query(updateImageQuery, imageParams)

        const data = {
            id: updateCardResult.rows[0].card_id,
            plate: updateCardResult.rows[0].plate,
            image: {
                id: updateImageResult.rows[0].image_id,
                url: updateImageResult.rows[0].url,
            },
            createdAt: updateCardResult.rows[0].createdAt,
        }
        
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};