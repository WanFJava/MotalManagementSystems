const RentalRequest = require('../models/RentalRequest');
const Room = require('../models/Room');
const User = require('../models/User');

// UC03: Gửi yêu cầu thuê phòng
// Yêu cầu nghiệp vụ: Bắt buộc khách thuê phải cập nhật đầy đủ CCCD và định danh mới được gửi yêu cầu
exports.createRentalRequest = async (req, res) => {
  try {
    const { 
      userId, 
      roomId, 
      tenantName, 
      tenantPhone, 
      expectedMoveInDate, 
      note,
      identityNumber,
      identityIssuedDate,
      identityIssuedPlace,
      hometown,
      currentAddress,
      dateOfBirth,
      gender
    } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã phòng (roomId)' });
    }

    if (!tenantName || !tenantName.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Họ và tên khách thuê' });
    }

    if (!tenantPhone || !tenantPhone.trim()) {
      return res.status(400).json({ message: 'Vui lòng cung cấp Số điện thoại liên hệ' });
    }

    // 1. Kiểm tra bắt buộc thông tin CCCD / Định danh
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    const finalIdentityNumber = identityNumber || user?.identityNumber;
    if (!finalIdentityNumber || !finalIdentityNumber.trim()) {
      return res.status(400).json({ 
        message: 'Bắt buộc phải cập nhật số Căn cước công dân (CCCD 12 số) mới được phép gửi yêu cầu thuê phòng!' 
      });
    }

    if (!/^\d{9,12}$/.test(finalIdentityNumber.trim())) {
      return res.status(400).json({ 
        message: 'Số CCCD không hợp lệ! Vui lòng nhập từ 9 đến 12 chữ số.' 
      });
    }

    const finalHometown = hometown || user?.hometown;
    if (!finalHometown || !finalHometown.trim()) {
      return res.status(400).json({ 
        message: 'Bắt buộc phải cập nhật thông tin Quê quán trong CCCD mới được gửi yêu cầu thuê phòng!' 
      });
    }

    const finalCurrentAddress = currentAddress || user?.currentAddress || user?.address;
    if (!finalCurrentAddress || !finalCurrentAddress.trim()) {
      return res.status(400).json({
        message: 'Bắt buộc phải cập nhật Địa chỉ thường trú theo CCCD mới được gửi yêu cầu thuê phòng!'
      });
    }

    const finalDob = dateOfBirth || user?.dateOfBirth;
    if (!finalDob) {
      return res.status(400).json({
        message: 'Bắt buộc phải cập nhật Ngày sinh theo CCCD mới được gửi yêu cầu thuê phòng!'
      });
    }

    const finalIssuedDate = identityIssuedDate || user?.identityIssuedDate;
    if (!finalIssuedDate) {
      return res.status(400).json({
        message: 'Bắt buộc phải cập nhật Ngày cấp Căn cước công dân mới được gửi yêu cầu thuê phòng!'
      });
    }

    const finalIssuedPlace = identityIssuedPlace || user?.identityIssuedPlace;
    if (!finalIssuedPlace || !finalIssuedPlace.trim()) {
      return res.status(400).json({
        message: 'Bắt buộc phải cập nhật Nơi cấp Căn cước công dân mới được gửi yêu cầu thuê phòng!'
      });
    }

    if (!expectedMoveInDate) {
      return res.status(400).json({
        message: 'Vui lòng chọn Ngày dự kiến chuyển vào ở!'
      });
    }

    // 2. Kiểm tra xem phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Phòng không tồn tại trên hệ thống' });
    }

    // 3. TC_RENTAL_02: Không cho thuê phòng đã được đặt hoặc đang có người ở / bảo trì
    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({ 
        message: `Phòng ${room.roomNumber} hiện không khả dụng để gửi yêu cầu thuê (Trạng thái: ${room.status})` 
      });
    }

    // 4. Tạo yêu cầu thuê phòng mới
    const rentalRequest = new RentalRequest({
      userId: userId || null,
      roomId,
      tenantName: tenantName.trim(),
      tenantPhone: tenantPhone.trim(),
      identityNumber: finalIdentityNumber.trim(),
      identityIssuedDate: identityIssuedDate ? new Date(identityIssuedDate) : user?.identityIssuedDate || null,
      identityIssuedPlace: identityIssuedPlace?.trim() || user?.identityIssuedPlace || 'Cục Cảnh sát QLHC về TTXH',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : user?.dateOfBirth || null,
      gender: gender || user?.gender || '',
      hometown: finalHometown.trim(),
      currentAddress: currentAddress?.trim() || user?.currentAddress || '',
      expectedMoveInDate: expectedMoveInDate ? new Date(expectedMoveInDate) : null,
      note: note || '',
      status: 'PENDING',
      requestDate: new Date()
    });

    await rentalRequest.save();

    // 5. Nếu có tài khoản User, đồng bộ cập nhật hồ sơ cá nhân
    if (user) {
      if (identityNumber) user.identityNumber = identityNumber.trim();
      if (identityIssuedDate) user.identityIssuedDate = new Date(identityIssuedDate);
      if (identityIssuedPlace) user.identityIssuedPlace = identityIssuedPlace.trim();
      if (hometown) user.hometown = hometown.trim();
      if (currentAddress) user.currentAddress = currentAddress.trim();
      if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
      if (gender) user.gender = gender;
      await user.save();
    }

    // Populate thông tin phòng để trả về client
    await rentalRequest.populate('roomId', 'roomNumber basePrice status images maxOccupants');

    res.status(201).json({ 
      success: true,
      message: 'Gửi yêu cầu thuê phòng thành công! Quản lý sẽ sớm xem xét và liên hệ với bạn.', 
      data: rentalRequest 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi gửi yêu cầu thuê phòng', error: error.message });
  }
};

// Lấy danh sách yêu cầu thuê phòng (hỗ trợ lọc theo userId, tenantPhone, roomId, status)
exports.getAllRentalRequests = async (req, res) => {
  try {
    const { userId, tenantPhone, roomId, status } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (tenantPhone) filter.tenantPhone = tenantPhone;
    if (roomId) filter.roomId = roomId;
    if (status) filter.status = status;

    const requests = await RentalRequest.find(filter)
      .populate('roomId', 'roomNumber basePrice status maxOccupants images')
      .populate('userId', 'fullName phone email identityNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách yêu cầu thuê phòng', error: error.message });
  }
};

// Xem chi tiết yêu cầu thuê
exports.getRentalRequestById = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id)
      .populate('roomId', 'roomNumber basePrice status maxOccupants images')
      .populate('userId', 'fullName phone email identityNumber');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Yêu cầu thuê phòng không tồn tại' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin yêu cầu thuê phòng', error: error.message });
  }
};

// Duyệt hoặc từ chối hoặc Hủy yêu cầu thuê phòng
// PUT /api/rental-requests/:id { status: 'APPROVED' | 'REJECTED' | 'CANCELLED' }
exports.updateRentalRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ. Trạng thái phải là PENDING, APPROVED, REJECTED, hoặc CANCELLED' 
      });
    }

    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Yêu cầu thuê phòng không tồn tại' });
    }

    // Nếu duyệt yêu cầu (APPROVED), kiểm tra xem phòng có còn trống không
    if (status === 'APPROVED') {
      const room = await Room.findById(request.roomId);
      if (!room || room.status !== 'AVAILABLE') {
        return res.status(400).json({ 
          success: false,
          message: 'Không thể duyệt vì phòng này đã có người thuê hoặc đang bảo trì' 
        });
      }
    }

    request.status = status;
    await request.save();
    await request.populate('roomId', 'roomNumber basePrice status');

    const statusMessage = status === 'APPROVED' ? 'Duyệt yêu cầu thành công' :
                          status === 'REJECTED' ? 'Đã từ chối yêu cầu thuê' :
                          status === 'CANCELLED' ? 'Đã hủy yêu cầu thuê phòng' :
                          'Đã cập nhật trạng thái yêu cầu';

    res.status(200).json({ success: true, message: statusMessage, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái yêu cầu', error: error.message });
  }
};
