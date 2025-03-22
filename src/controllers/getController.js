const pool = require('../config/db.config.js')

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

    let queryParams = []
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
}

exports.getImage = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT CAST(image_id as varchar) as id, url FROM images WHERE image_id = $1', [Number(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        };

        res.status(200).json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};