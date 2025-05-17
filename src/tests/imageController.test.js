const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const pool = require('../config/db.config.js');
const app = require('../server.js');
const { uploadImages } = require('../controllers/ImageController.js');
const path = require('path');
const fs = require('fs');

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
    rows: [
        {
            image_id: '3aecb88c-0acc-43e5-b9cf-561994a4b080',
            card_id: mockCardData.rows[0].card_id,
            url: 'https://example-url.ru/image.jpg',
        }
    ]
}

describe('Image API', () => {
    const fixturesDir = path.join(__dirname, 'fixtures');
    const testFilePath = path.join(fixturesDir, 'TestImg.jpg');


    before(() => {
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
        fs.writeFileSync(testFilePath, 'fake image content');
    });

    after(() => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    afterEach(() => {
        for (const key in uploadImages) {
            delete uploadImages[key];
        }
        sinon.restore();
    });

    it('Upload image 400', async () => {
        const res = await request(app)
            .post('/image-upload')
            .attach('file', testFilePath);

        expect(res.status).to.equal(400);
    });

    it('GET /images/:id 200', async () => {
        sinon.stub(pool, 'query').returns(Promise.resolve(mockImageData));

        const imageId = mockImageData.rows[0].image_id
        const res = await request(app).get(`/images/${imageId}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('image_id');
        expect(res.body).to.have.property('url');
        expect(res.body.image_id).to.equal(imageId)
    });

    it('GET /images/:id 404', async () => {
        const mockResult = { rows: [] };

        sinon.stub(pool, 'query').returns(Promise.resolve(mockResult));

        const res = await request(app).get(`/images/1`);

        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Image not found');
    });
})