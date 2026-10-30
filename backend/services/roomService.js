const Room = require('../models/Room');
const Contract = require('../models/Contract');
const RentalRequest = require('../models/RentalRequest');

/**
 * «application logic» / «business logic»
 * RoomService: Tách biệt hoàn toàn Business Logic và tương tác Database khỏi Controller
 * Phân hệ đảm nhiệm: Thành viên 1 - Quang (Room Management & Room Search)
 */
class RoomService {
  /**
   * UC04 / SWR1.1: Tạo phòng mới kèm validation nghiệp vụ
   * Đáp ứng TC_ROOM_01, TC_ROOM_02
   */
  async createRoom(data) {
    const { roomNumber, basePrice, area, maxOccupants, amenities, status, description, images } = data;
    
    if (!roomNumber || !roomNumber.toString().trim()) {
      throw new Error('Số phòng không được để trống!');
    }

    const trimmedNumber = roomNumber.toString().trim();

    // TC_ROOM_02: Kiểm tra số phòng đã tồn tại chưa
    const existingRoom = await Room.findOne({ roomNumber: trimmedNumber });
    if (existingRoom) {
      throw new Error(`Số phòng "${trimmedNumber}" đã tồn tại trên hệ thống! Vui lòng chọn số khác.`);
    }

    if (basePrice === undefined || basePrice === null || Number(basePrice) <= 0) {
      throw new Error('Đơn giá thuê cơ bản phải lớn hơn 0 VNĐ!');
    }

    if (area !== undefined && Number(area) <= 0) {
      throw new Error('Diện tích phòng phải lớn hơn 0 m²!');
    }

    const newRoom = new Room({
      roomNumber: trimmedNumber,
      basePrice: Number(basePrice),
      area: area ? Number(area) : 20,
      maxOccupants: maxOccupants ? Number(maxOccupants) : 2,
      amenities: Array.isArray(amenities) && amenities.length > 0 
        ? amenities 
        : ['Wifi', 'Bình nóng lạnh', 'Điều hòa'],
      status: status || 'AVAILABLE',
      description: description || 'Phòng trọ tiện nghi, an ninh đảm bảo, giờ giấc tự do.',
      images: Array.isArray(images) && images.length > 0 
        ? images 
        : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80']
    });

    return await newRoom.save();
  }

  /**
   * SWR1.2: Lấy danh sách tất cả phòng trọ
   */
  async getAllRooms() {
    return await Room.find().sort({ createdAt: -1 });
  }

  /**
   * SWR1.4: Lấy thông tin chi tiết 1 phòng theo ID
   */
  async getRoomById(id) {
    const room = await Room.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng trọ này trong hệ thống!');
    }
    return room;
  }

  /**
   * UC02 / SWR1.2: Tìm kiếm và lọc phòng đa tiêu chí
   * Đáp ứng TC_ROOM_03 (Lọc phòng trống AVAILABLE, lọc theo khoảng giá, diện tích, tiện ích)
   */
  async searchRooms(filters = {}) {
    const query = {};

    // 1. Lọc theo trạng thái phòng (AVAILABLE, RENTED, MAINTENANCE)
    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }

    // 2. Lọc theo khoảng giá
    if (filters.minPrice || filters.maxPrice) {
      query.basePrice = {};
      if (filters.minPrice) {
        query.basePrice.$gte = Number(filters.minPrice);
      }
      if (filters.maxPrice) {
        query.basePrice.$lte = Number(filters.maxPrice);
      }
    }

    // 3. Lọc theo khoảng diện tích
    if (filters.minArea || filters.maxArea) {
      query.area = {};
      if (filters.minArea) {
        query.area.$gte = Number(filters.minArea);
      }
      if (filters.maxArea) {
        query.area.$lte = Number(filters.maxArea);
      }
    }

    // 4. Lọc theo tiện ích (amenity)
    if (filters.amenity) {
      query.amenities = { $in: [filters.amenity] };
    }

    // 5. Tìm kiếm theo từ khóa (Số phòng hoặc mô tả)
    if (filters.keyword && filters.keyword.trim()) {
      const keywordRegex = new RegExp(filters.keyword.trim(), 'i');
      query.$or = [
        { roomNumber: keywordRegex },
        { description: keywordRegex }
      ];
    }

    return await Room.find(query).sort({ basePrice: 1 });
  }

  /**
   * UC04 / SWR1.3: Cập nhật thông tin phòng
   * Đáp ứng TC_ROOM_04
   */
  async updateRoom(id, updateData) {
    if (updateData.basePrice !== undefined && Number(updateData.basePrice) <= 0) {
      throw new Error('Giá thuê phòng phải lớn hơn 0 VNĐ!');
    }

    if (updateData.area !== undefined && Number(updateData.area) <= 0) {
      throw new Error('Diện tích phòng phải lớn hơn 0 m²!');
    }

    // Nếu đổi số phòng, kiểm tra trùng lặp với các phòng khác
    if (updateData.roomNumber) {
      const trimmedNumber = updateData.roomNumber.toString().trim();
      const duplicateRoom = await Room.findOne({ 
        roomNumber: trimmedNumber, 
        _id: { $ne: id } 
      });
      if (duplicateRoom) {
        throw new Error(`Số phòng "${trimmedNumber}" đã tồn tại trên hệ thống!`);
      }
      updateData.roomNumber = trimmedNumber;
    }

    // Nếu cố đổi trạng thái sang AVAILABLE nhưng đang có hợp đồng ACTIVE
    if (updateData.status === 'AVAILABLE') {
      const activeContract = await Contract.findOne({ 
        $or: [{ room: id }, { roomId: id }], 
        status: 'ACTIVE' 
      });
      if (activeContract) {
        throw new Error('Không thể đổi trạng thái sang "Còn trống" vì phòng đang có hợp đồng thuê hoạt động (ACTIVE)!');
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

  /**
   * UC04 / SWR1.3: Xóa phòng
   * Đáp ứng TC_ROOM_05 (Chỉ cho phép xóa phòng chưa có người ở, không có hợp đồng active)
   */
  async deleteRoom(id) {
    const room = await Room.findById(id);
    if (!room) {
      throw new Error('Không tìm thấy phòng trọ để xóa!');
    }

    // TC_ROOM_05: Chặn xóa phòng đang cho thuê
    if (room.status === 'RENTED') {
      throw new Error('Không thể xóa phòng đang có khách thuê (RENTED)! Vui lòng thanh lý hợp đồng trước.');
    }

    // Kiểm tra xem phòng có hợp đồng ACTIVE nào không
    const activeContract = await Contract.findOne({ 
      $or: [{ room: id }, { roomId: id }], 
      status: 'ACTIVE' 
    });
    if (activeContract) {
      throw new Error('Không thể xóa phòng đang có hợp đồng thuê có hiệu lực (ACTIVE)!');
    }

    const deletedRoom = await Room.findByIdAndDelete(id);
    return deletedRoom;
  }

  /**
   * UC03 / SWR1.4: Tiếp nhận yêu cầu thuê/giữ phòng từ khách thuê và lưu vào MongoDB
   */
  async submitRentalRequest(roomId, requestData) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Không tìm thấy thông tin phòng!');
    }
    if (room.status !== 'AVAILABLE') {
      throw new Error(`Phòng ${room.roomNumber} hiện không còn trống để gửi yêu cầu thuê!`);
    }

    const { fullName, phone, email, moveInDate, note, tenantName, tenantPhone } = requestData;
    const finalTenantName = fullName || tenantName;
    const finalPhone = phone || tenantPhone;

    if (!finalTenantName || !finalPhone) {
      throw new Error('Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại liên hệ!');
    }

    // Lưu thực tế vào collection RentalRequest
    const newRequest = new RentalRequest({
      roomId: room._id,
      tenantName: finalTenantName,
      tenantPhone: finalPhone,
      expectedMoveInDate: moveInDate ? new Date(moveInDate) : null,
      note: note || (email ? `Email: ${email}` : ''),
      status: 'PENDING'
    });
    await newRequest.save();

    return {
      requestId: newRequest._id,
      room: {
        id: room._id,
        roomNumber: room.roomNumber,
        basePrice: room.basePrice
      },
      tenant: { fullName: finalTenantName, phone: finalPhone, email, moveInDate, note },
      status: 'PENDING',
      message: `Đã tiếp nhận yêu cầu thuê phòng ${room.roomNumber}. Quản lý sẽ sớm liên hệ xác nhận!`
    };
  }
}

module.exports = new RoomService();
