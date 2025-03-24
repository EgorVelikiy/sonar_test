const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const server = require('../server.js');
const pool = require('../config/db.config.js');

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
    // let poolStub;

    // beforeEach(() => {
    //     poolStub = sinon.stub(pool, 'query');
    //     // server.listen(7070, done);
    // });

    // afterEach(() => {
    //     poolStub.restore();
    //     // server.close(done)
    // });


    it('GET /gallery', async() => {
        const res = await request(server).get('/gallery');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').that.has.lengthOf(1);
        expect(res.body[0]).to.have.property('id', '39');
        expect(res.body[0]).to.have.property('plate', 'м777мм74');
        expect(res.body[0].image).to.have.property('id');
        expect(res.body[0].image).to.have.property('url');
    });

    it('GET /gallery with query', async() => {
        const res = await request(server).get('/gallery').query({ search: '4' });
        
        expect(res.status).to.equal(200);
        expect(res.body[0].plate).to.contain('4');
        expect(res.body).to.be.an('array').that.has.lengthOf(1);
    });

    it('GET /gallery with wrong query', async() => {
        const res = await request(server).get('/gallery').query({ search: '0' });

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').that.has.lengthOf(0);
    });


    it('GET /gallery/:id', async() => {
        const res = await request(server).get('/gallery/39');
        expect(res.status).to.equal(200);

        const newres = await request(server).get('/gallery/1');
        expect(newres.status).to.equal(404);
    });
    
})
