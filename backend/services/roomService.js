const Room = require('../models/Room');
const Contract = require('../models/Contract');

/**
 * «application logic» / «business logic»
 * RoomService: Tách biệt hoàn toàn Business Logic và tương tác Database khỏi Controller
 */
class RoomService {
  // Tạo phòng mới kèm validation nghiệp vụ
  async createRoom(data) {
    const { roomNumber, basePrice, maxOccupants, status } = data;
    
    if (!roomNumber || !roomNumber.toString().trim()) {
      throw new Error('Số phòng không được để trống!');
    }

    const trimmedNumber = roomNumber.toString().trim();

    // Kiểm tra xem số phòng đã tồn tại chưa
    const existingRoom = await Room.findOne({ roomNumber: trimmedNumber });
    if (existingRoom) {
      throw new Error(`Phòng số ${trimmedNumber} đã tồn tại trong hệ thống!`);
    }

    if (!basePrice || basePrice <= 0) {
      throw new Error('Giá thuê phòng phải lớn hơn 0!');
    }

    const newRoom = new Room({
      roomNumber: trimmedNumber,
      basePrice,
      maxOccupants: maxOccupants || 2,
      status: status || 'AVAILABLE'
    });

    return await newRoom.save();
  }

  // Lấy tất cả phòng
  async getAllRooms() {
    return await Room.find().sort({ createdAt: -1 });
  }

  // Lấy 1 phòng theo ID
  async getRoomById(id) {
    const room = await Room.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng trọ này!');
    }
    return room;
  }

  // Cập nhật thông tin phòng
  async updateRoom(id, updateData) {
    if (updateData.basePrice !== undefined && updateData.basePrice <= 0) {
      throw new Error('Giá thuê phòng phải lớn hơn 0!');
    }

    // Nếu đổi số phòng, kiểm tra trùng lặp với phòng khác
    if (updateData.roomNumber) {
      const trimmedNumber = updateData.roomNumber.toString().trim();
      const duplicateRoom = await Room.findOne({ roomNumber: trimmedNumber, _id: { $ne: id } });
      if (duplicateRoom) {
        throw new Error(`Số phòng ${trimmedNumber} đã tồn tại trên hệ thống!`);
      }
      updateData.roomNumber = trimmedNumber;
    }

    // Nếu cố đổi trạng thái sang AVAILABLE nhưng đang có hợp đồng ACTIVE
    if (updateData.status === 'AVAILABLE') {
      const activeContract = await Contract.findOne({ room: id, status: 'ACTIVE' });
      if (activeContract) {
        throw new Error('Không thể đổi trạng thái sang Còn trống vì phòng đang có hợp đồng thuê hoạt động!');
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedRoom) {
      throw new Error('Không tìm thấy phòng trọ để cập nhật!');
    }

    return updatedRoom;
  }

  // Xóa phòng (tuân thủ TC_ROOM_05: Chỉ xóa phòng trống, không có người ở/hợp đồng)
  async deleteRoom(id) {
    const room = await Room.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng trọ để xóa!');
    }

    // Không được xóa phòng đang cho thuê
    if (room.status === 'RENTED') {
      throw new Error('Không thể xóa phòng đang có khách thuê (RENTED)!');
    }

    // Kiểm tra xem phòng có hợp đồng ACTIVE nào không
    const activeContract = await Contract.findOne({ room: id, status: 'ACTIVE' });
    if (activeContract) {
      throw new Error('Không thể xóa phòng đang có hợp đồng thuê có hiệu lực (ACTIVE)!');
    }

    const deletedRoom = await Room.findByIdAndDelete(id);
    return deletedRoom;
  }
}

module.exports = new RoomService();
