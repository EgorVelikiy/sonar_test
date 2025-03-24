const request = require('supertest');
const { expect } = require('chai');
const server = require('../server.js');
const { uploadImages } = require('../controllers/ImageController.js');
const pool = require('../config/db.config.js');

const mockImageUrl = 'https://example-url.ru/image.jpg';
const mockImageId = '3aecb88c-0acc-43e5-b9cf-561994a4b080';

const mockCardData = {
    rows: [
        {
            card_id: '100',
            plate: 'в555вв55',
            createdAt: new Date(),
        }
    ]
    
};

const mockImageData = {
    image_id: '3aecb88c-0acc-43e5-b9cf-561994a4b080',
    card_id: mockCardData.rows[0].card_id,
    url: 'https://example-url.ru/image.jpg',
};

const updatedImageUrl = 'https://example-url1.ru/image.jpg';
const updatedImageId = '3aecb88c-0acc-43e5-b9cf-561994a4b090';


describe('Card API Post/patch', () => {

    afterEach(() => {

    })

    it('POST /gallery', async() => {
        const imageResult = {
            rows: [
                {
                    image_id: mockImageId,
                    card_id: mockCardData.rows[0].card_id,
                    url: mockImageUrl,
                },
            ],
        };

        uploadImages[mockImageId] = {
            format: '.jpg',
            url: mockImageUrl
        }

        pool.query = (query, params) => {
            if (query.includes('INSERT INTO Cards')) {
                return Promise.resolve(mockCardData);
            }
            
            if (query.includes('INSERT INTO Images')) {
                return Promise.resolve(imageResult);
            }
            return Promise.reject(new Error('Unknown query'));
        };
      
        const res = await request(server).post('/gallery')
            .send({
                data: {
                    plate: 'в555вв55',
                    image: mockImageId,
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', mockCardData.rows[0].card_id);
        expect(res.body).to.have.property('plate', 'в555вв55');
        expect(res.body.image).to.have.property('id', mockImageId);
        expect(res.body.image).to.have.property('url', mockImageUrl);
    });
    
    it('PATCH /gallery/:id', async() => {
        const newCardResult = {
            rows: [
                {
                    card_id: mockCardData.rows[0].card_id,
                    plate: 'б555бб55',
                    createdAt: mockCardData.rows[0].createdAt,
                },
            ],
        };
        
        const newImageResult = {
            rows: [
                {
                    image_id: updatedImageId,
                    card_id: mockCardData.card_id,
                    url: updatedImageUrl,
                },
            ],
        };

        uploadImages[updatedImageId] = {
            format: '.jpg',
            url: updatedImageUrl
        }

        pool.query = (query, params) => {
            if (query.includes('UPDATE Cards')) {
                return Promise.resolve(newCardResult);
            }
            if (query.includes('UPDATE Images')) {
                return Promise.resolve(newImageResult);
            }
            if (query.includes('SELECT image_id')) {
                return Promise.resolve({
                    rows: [{ image_id: mockImageId}]
                })
            }
            return Promise.reject(new Error('Unknown query'));
        };

        const res = await request(server)
            .patch(`/gallery/${mockCardData.rows[0].card_id}`)
            .send({
                data: {
                    plate: newCardResult.rows[0].plate,
                    image: updatedImageId
                },
            });
        
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', mockCardData.rows[0].card_id);
        expect(res.body).to.have.property('plate', newCardResult.rows[0].plate);
        expect(res.body.image).to.have.property('url', updatedImageUrl);
        expect(res.body.image).to.have.property('id', updatedImageId)
    });

    it('DELETE /gallery/:id', async () => {
        const deleteImage = {
            rows: [mockImageData],
        };

        pool.query = (query, params) => {
            if (query.includes('DELETE FROM cards')) {
                return Promise.resolve(mockCardData);
            }
            if (query.includes('DELETE FROM images')) {
                return Promise.resolve(deleteImage);
            }
            return Promise.reject(new Error('Unknown query'));
        };
        
        const res = await request(server).delete(`/gallery/100`)
        
        expect(res.status).to.equal(204);
    })
})