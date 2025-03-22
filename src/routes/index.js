const express = require('express')
const mainController = require('../controllers/mainController')
const getController = require('../controllers/getController')
const router = express.Router()

router.get('/gallery', getController.getGallery); // добавить query параметры
router.get('/gallery/:id', getController.getCard);
router.get('/images/:id', getController.getImage); // вроде всё норм

router.post('/image-upload', mainController.uploadImage); // вроде всё норм, мб реализовать удалиение старых картинок и сделать subFolders 
router.post('/gallery', mainController.createCard); // не работает на фронте

router.delete('/gallery/:id', mainController.deleteCard); 

router.patch('/gallery/:id', mainController.udpateCard);  // надо вернуть старый id

module.exports = router