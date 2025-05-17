const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon')
const pool = require('../config/db.config.js');
const app = require('../server.js');

const mockData = {
    rows: [
        {
            id: '1',
            plate: 'м777мм77',
            'image.id': 'img1',
            'image.url': 'http://example.com/img1.jpg',
            createdAt: '2025-03-23T00:00:00Z',
        },
        {
            id: '2',
            plate: 'м777мм78',
            'image.id': 'img2',
            'image.url': 'http://example.com/img2.jpg',
            createdAt: '2025-03-24T00:00:00Z',
        },
    ],
};

describe('Card API GET', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(pool, 'query')
    })

    afterEach(() => {
        queryStub.restore()
    })

    it('GET /gallery 200', async() => {
        pool.query = (query, params) => {
            if (query.includes('SELECT')) {
                return Promise.resolve(mockData);
            }
            return Promise.reject(new Error('Unknown query'));
        };

        const res = await request(app).get('/gallery');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').that.has.lengthOf(2);
        expect(res.body[0]).to.have.property('id', '1');
        expect(res.body[0]).to.have.property('plate', 'м777мм77');
        expect(res.body[0].image).to.have.property('id', 'img1');
        expect(res.body[0].image).to.have.property('url', 'http://example.com/img1.jpg');
        expect(queryStub.calledWithMatch('ILIKE')).to.be.false;
    });

    
    it('GET /gallery search 200', async() => {
        queryStub.resolves({
            rows: [
                {
                    id: '1',
                    plate: 'м777мм77',
                    'image.id': 'img1',
                    'image.url': 'http://example.com/img1.jpg',
                    createdAt: '2025-03-23T00:00:00Z',
                },
                {
                    id: '2',
                    plate: 'м777мм78',
                    'image.id': 'img2',
                    'image.url': 'http://example.com/img2.jpg',
                    createdAt: '2025-03-24T00:00:00Z',
                },
            ],
        })

        const res = await request(app).get('/gallery').query({ search: '8' });

        expect(queryStub.calledWithMatch('ILIKE')).to.be.true;
        expect(res.status).to.equal(200);
    });

    it('GET /gallery search 500', async() => {
        queryStub.resolves()

        const res = await request(app).get('/gallery').query({ search: '7' });

        expect(queryStub.calledWithMatch('ILIKE')).to.be.true;
        expect(res.status).to.equal(500);
    });

    it('GET /gallery/:id 200', async() => {
        queryStub.resolves(mockData)

        const res = await request(app).get('/gallery/1');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', '1')
    });

    it('GET /gallery/:id 404', async() => {
        queryStub.resolves({ rows: [] })

        const res = await request(app).get('/gallery/2');
        expect(res.status).to.equal(404);
    });

    it('GET /gallery/:id 500', async() => {
        queryStub.resolves({ rows: mockData.rows[1] })

        const res = await request(app).get('/gallery/2');
        expect(res.status).to.equal(500);
    });
})