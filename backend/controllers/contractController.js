const Contract = require('../models/Contract');
const Room = require('../models/Room');
const User = require('../models/User');

// UC05: Lập hợp đồng mới
// TC_CTR_01: Tạo thành công, phòng chuyển sang RENTED
// TC_CTR_02: Cố tình tạo hợp đồng cho phòng đã có người -> Báo lỗi 400
exports.createContract = async (req, res) => {
  try {
    const {
      room,
      roomId,
      signedDate,
      // Bên cho thuê (Bên A)
      landlordName,
      landlordDob,
      landlordCccd,
      landlordAddress,
      landlordPhone,
      landlordWorkplace,
      // Bên thuê (Bên B)
      tenantId,
      tenantName,
      tenantDob,
      tenantDateOfBirth,
      tenantCccd,
      tenantIdentityNumber,
      tenantAddress,
      tenantHometown,
      tenantPhone,
      tenantWorkplace,
      tenantGender,
      tenantIdentityIssuedDate,
      tenantIdentityIssuedPlace,
      // Thời hạn & Tài chính
      startDate,
      endDate,
      depositAmount,
      rentalPrice,
      status
    } = req.body;

    const targetRoomId = roomId || room;

    if (!targetRoomId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã phòng (roomId)' });
    }

    // Kiểm tra xem phòng có tồn tại không
    const existingRoom = await Room.findById(targetRoomId);
    if (!existingRoom) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    // TC_CTR_02: Cố tình tạo hợp đồng cho phòng đã có người
    // Kiểm tra xem phòng có đang được thuê hoặc có hợp đồng ACTIVE không
    const activeContract = await Contract.findOne({ 
      $or: [{ room: targetRoomId }, { roomId: targetRoomId }], 
      status: 'ACTIVE' 
    });
    if (existingRoom.status === 'RENTED' || activeContract) {
      return res.status(400).json({ message: 'Phòng đang có hợp đồng hoạt động hoặc đã được thuê' });
    }

    // Kiểm tra nếu phòng đang bảo trì
    if (existingRoom.status === 'MAINTENANCE') {
      return res.status(400).json({ message: 'Phòng đang trong trạng thái bảo trì, không thể lập hợp đồng' });
    }

    // Kiểm tra logic thời gian hợp đồng
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'Ngày kết thúc hợp đồng phải sau ngày bắt đầu' });
    }

    // Tra cứu thêm thông tin CCCD từ User nếu có tenantId
    let finalPhone = tenantPhone || '';
    let finalCccd = tenantCccd || tenantIdentityNumber || '';
    let finalHometown = tenantHometown || '';
    let finalAddress = tenantAddress || '';
    let finalDob = tenantDob || tenantDateOfBirth || null;
    let finalGender = tenantGender || 'OTHER';
    let finalIssuedDate = tenantIdentityIssuedDate || null;
    let finalIssuedPlace = tenantIdentityIssuedPlace || '';
    let finalWorkplace = tenantWorkplace || '';

    if (tenantId) {
      const user = await User.findById(tenantId);
      if (user) {
        if (!finalPhone) finalPhone = user.phone || '';
        if (!finalCccd) finalCccd = user.identityNumber || '';
        if (!finalHometown) finalHometown = user.hometown || '';
        if (!finalAddress) finalAddress = user.currentAddress || user.address || '';
        if (!finalDob && user.dateOfBirth) finalDob = user.dateOfBirth;
        if ((!finalGender || finalGender === 'OTHER') && user.gender) finalGender = user.gender;
        if (!finalIssuedDate && user.identityIssuedDate) finalIssuedDate = user.identityIssuedDate;
        if (!finalIssuedPlace && user.identityIssuedPlace) finalIssuedPlace = user.identityIssuedPlace;
      }
    }

    const newContract = new Contract({
      room: targetRoomId,
      roomId: targetRoomId,
      signedDate: signedDate ? new Date(signedDate) : new Date(),
      // Bên A
      landlordName: landlordName || 'Chủ nhà',
      landlordDob: landlordDob ? new Date(landlordDob) : null,
      landlordCccd: landlordCccd || '',
      landlordAddress: landlordAddress || '',
      landlordPhone: landlordPhone || '',
      landlordWorkplace: landlordWorkplace || '',
      // Bên B
      tenantId: tenantId || null,
      tenantName: tenantName || 'Khách thuê',
      tenantDob: finalDob ? new Date(finalDob) : null,
      tenantDateOfBirth: finalDob ? new Date(finalDob) : null,
      tenantCccd: finalCccd,
      tenantIdentityNumber: finalCccd,
      tenantAddress: finalAddress,
      tenantHometown: finalHometown,
      tenantPhone: finalPhone,
      tenantWorkplace: finalWorkplace,
      tenantGender: finalGender,
      tenantIdentityIssuedDate: finalIssuedDate,
      tenantIdentityIssuedPlace: finalIssuedPlace,
      // HĐ & tài chính
      startDate,
      endDate,
      depositAmount: Number(depositAmount),
      rentalPrice: Number(rentalPrice),
      status: status || 'ACTIVE'
    });

    await newContract.save();

    // TC_CTR_01: Tạo thành công, phòng chuyển sang RENTED (nếu hợp đồng ACTIVE)
    if (newContract.status === 'ACTIVE') {
      existingRoom.status = 'RENTED';
      await existingRoom.save();

      // Cập nhật phòng đang ở cho khách thuê (nếu có tài khoản)
      if (tenantId) {
        await User.findByIdAndUpdate(tenantId, { currentRoom: targetRoomId });
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Tạo hợp đồng thành công! Phòng đã chuyển sang trạng thái RENTED.', 
      data: newContract 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo hợp đồng', error: error.message });
  }
};

// Xem danh sách hợp đồng (hỗ trợ lọc theo tenantId, tenantPhone, roomId, status)
exports.getAllContracts = async (req, res) => {
  try {
    const { tenantId, tenantPhone, tenantIdentityNumber, tenantCccd, roomId, status } = req.query;
    const conditions = [];

    // Lọc theo người thuê: kiểm tra tenantId hoặc tenantPhone hoặc tenantIdentityNumber/tenantCccd
    const cccdVal = tenantIdentityNumber || tenantCccd;
    if (tenantId || tenantPhone || cccdVal) {
      const tenantMatch = [];
      if (tenantId) {
        tenantMatch.push({ tenantId }, { tenant: tenantId });
      }
      if (tenantPhone) {
        tenantMatch.push({ tenantPhone });
      }
      if (cccdVal) {
        tenantMatch.push({ tenantIdentityNumber: cccdVal }, { tenantCccd: cccdVal });
      }
      if (tenantMatch.length > 0) {
        conditions.push({ $or: tenantMatch });
      }
    }

    if (roomId) {
      conditions.push({ $or: [{ roomId }, { room: roomId }] });
    }

    if (status && status !== 'ALL') {
      conditions.push({ status });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const contracts = await Contract.find(filter)
      .populate('room', 'roomNumber basePrice status maxOccupants address area amenities')
      .populate('roomId', 'roomNumber basePrice status maxOccupants address area amenities')
      .populate('tenantId', 'fullName phone email identityNumber identityIssuedDate identityIssuedPlace hometown currentAddress address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách hợp đồng', error: error.message });
  }
};

// Xem chi tiết hợp đồng
exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room', 'roomNumber basePrice status maxOccupants address area amenities')
      .populate('roomId', 'roomNumber basePrice status maxOccupants address area amenities')
      .populate('tenantId', 'fullName phone email identityNumber identityIssuedDate identityIssuedPlace hometown currentAddress address');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Hợp đồng không tồn tại' });
    }

    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin hợp đồng', error: error.message });
  }
};

// UC05.1: Gia hạn hợp đồng
exports.extendContract = async (req, res) => {
  try {
    const { endDate } = req.body;
    if (!endDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ngày kết thúc mới (endDate)' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Hợp đồng không tồn tại' });
    }

    if (contract.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể gia hạn hợp đồng đang hoạt động (ACTIVE)' });
    }

    contract.endDate = new Date(endDate);
    await contract.save();

    res.status(200).json({ success: true, message: 'Gia hạn hợp đồng thành công', data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi gia hạn hợp đồng', error: error.message });
  }
};

// UC05.2: Thanh lý hợp đồng
// TC_CTR_03: Thanh lý hợp đồng -> Hợp đồng chuyển TERMINATED, phòng tự chuyển về AVAILABLE.
exports.terminateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Hợp đồng không tồn tại' });
    }

    if (contract.status === 'TERMINATED') {
      return res.status(400).json({ success: false, message: 'Hợp đồng đã được thanh lý trước đó' });
    }

    // Chuyển trạng thái hợp đồng thành TERMINATED
    contract.status = 'TERMINATED';
    await contract.save();

    // Chuyển trạng thái phòng về AVAILABLE
    const targetRoomId = contract.roomId || contract.room;
    if (targetRoomId) {
      const room = await Room.findById(targetRoomId);
      if (room) {
        room.status = 'AVAILABLE';
        await room.save();
      }
    }

    // Xóa liên kết phòng hiện tại của khách thuê nếu có
    if (contract.tenantId) {
      await User.findByIdAndUpdate(contract.tenantId, { currentRoom: null });
    }

    res.status(200).json({ success: true, message: 'Thanh lý hợp đồng thành công', data: contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi thanh lý hợp đồng', error: error.message });
  }
};
