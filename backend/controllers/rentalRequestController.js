const RentalRequest = require('../models/RentalRequest');
const Room = require('../models/Room');

// UC03: Gửi yêu cầu thuê phòng
// TC_RENTAL_01: Gửi yêu cầu thuê phòng thành công khi phòng còn trống
// TC_RENTAL_02: Không cho thuê phòng đã được đặt / không khả dụng (status != AVAILABLE)
exports.createRentalRequest = async (req, res) => {
  try {
    const { userId, roomId, tenantName, tenantPhone, expectedMoveInDate, note } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã phòng (roomId)' });
    }

    if (!tenantName) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên khách thuê (tenantName)' });
    }

    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    // TC_RENTAL_02: Không cho thuê phòng đã được đặt hoặc đang có người ở / bảo trì
    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({ 
        message: `Phòng hiện tại không khả dụng để thuê (Trạng thái phòng: ${room.status})` 
      });
    }

    // Tạo yêu cầu thuê phòng mới
    const rentalRequest = new RentalRequest({
      userId: userId || null,
      roomId,
      tenantName,
      tenantPhone: tenantPhone || '',
      expectedMoveInDate: expectedMoveInDate ? new Date(expectedMoveInDate) : null,
      note: note || '',
      status: 'PENDING',
      requestDate: new Date()
    });

    await rentalRequest.save();

    // Populate thông tin phòng để trả về client
    await rentalRequest.populate('roomId', 'roomNumber basePrice status');

    res.status(201).json({ 
      message: 'Gửi yêu cầu thuê phòng thành công', 
      data: rentalRequest 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gửi yêu cầu thuê phòng', error: error.message });
  }
};

// Lấy danh sách yêu cầu thuê phòng (hỗ trợ lọc theo userId, roomId, status)
exports.getAllRentalRequests = async (req, res) => {
  try {
    const { userId, roomId, status } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (roomId) filter.roomId = roomId;
    if (status) filter.status = status;

    const requests = await RentalRequest.find(filter)
      .populate('roomId', 'roomNumber basePrice status maxOccupants')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu cầu thuê phòng', error: error.message });
  }
};

// Xem chi tiết yêu cầu thuê
exports.getRentalRequestById = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id)
      .populate('roomId', 'roomNumber basePrice status maxOccupants');

    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu thuê phòng không tồn tại' });
    }

    res.status(200).json({ data: request });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin yêu cầu thuê phòng', error: error.message });
  }
};

// Duyệt hoặc từ chối yêu cầu thuê phòng
// PUT /api/rental-requests/:id { status: 'APPROVED' | 'REJECTED' | 'CANCELLED' }
exports.updateRentalRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Trạng thái không hợp lệ. Trạng thái phải là PENDING, APPROVED, REJECTED, hoặc CANCELLED' 
      });
    }

    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu thuê phòng không tồn tại' });
    }

    // Nếu duyệt yêu cầu (APPROVED), kiểm tra xem phòng có còn trống không
    if (status === 'APPROVED') {
      const room = await Room.findById(request.roomId);
      if (!room || room.status !== 'AVAILABLE') {
        return res.status(400).json({ 
          message: 'Không thể duyệt vì phòng này đã có người thuê hoặc đang bảo trì' 
        });
      }
    }

    request.status = status;
    await request.save();
    await request.populate('roomId', 'roomNumber basePrice status');

    const statusMessage = status === 'APPROVED' ? 'Duyệt yêu cầu thành công' :
                          status === 'REJECTED' ? 'Đã từ chối yêu cầu thuê' :
                          'Đã cập nhật trạng thái yêu cầu';

    res.status(200).json({ message: statusMessage, data: request });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái yêu cầu', error: error.message });
  }
};

