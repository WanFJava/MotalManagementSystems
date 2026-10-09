const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// «boundary» Routes
router.post('/rooms', roomController.createRoom);          // POST   /api/rooms
router.get('/rooms', roomController.getAllRooms);          // GET    /api/rooms
router.get('/rooms/:id', roomController.getRoomById);      // GET    /api/rooms/:id
router.put('/rooms/:id', roomController.updateRoom);       // PUT    /api/rooms/:id
router.delete('/rooms/:id', roomController.deleteRoom);    // DELETE /api/rooms/:id

module.exports = router;
