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
      landlordCurrentAddress,
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
      tenantCurrentAddress,
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
    let finalCurrentAddress = tenantCurrentAddress || '';
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
        // Quê quán / Thường trú ghi trên CCCD (Độc lập, không lấy từ nơi ở hiện tại)
        if (!finalAddress) finalAddress = user.address || user.hometown || '';
        // Nơi ở hiện tại / Địa chỉ liên hệ (Độc lập, không lấy từ thường trú/quê quán)
        if (!finalCurrentAddress) finalCurrentAddress = user.currentAddress || '';
        if (!finalDob && user.dateOfBirth) finalDob = user.dateOfBirth;
        if (!finalWorkplace && user.workplace) finalWorkplace = user.workplace;
        if ((!finalGender || finalGender === 'OTHER') && user.gender) finalGender = user.gender;
        if (!finalIssuedDate && user.identityIssuedDate) finalIssuedDate = user.identityIssuedDate;
        if (!finalIssuedPlace && user.identityIssuedPlace) finalIssuedPlace = user.identityIssuedPlace;
      }
    }

    // Địa chỉ thường trú và địa chỉ liên hệ là 2 trường hoàn toàn riêng biệt không tham chiếu cho nhau
    const finalLandlordAddress = (landlordAddress || '').trim();
    const finalLandlordCurrentAddress = (landlordCurrentAddress || '').trim();

    // Kiểm tra tính đầy đủ của thông tin pháp lý CCCD cho cả 2 bên (Bên A & Bên B)
    const missingA = [];
    if (!landlordName || !landlordName.trim()) missingA.push('Họ và tên');
    if (!landlordPhone || !landlordPhone.trim()) missingA.push('Số điện thoại');
    if (!landlordCccd || !landlordCccd.trim()) missingA.push('Số CCCD');
    if (!landlordDob) missingA.push('Ngày sinh theo CCCD');
    if (!landlordAddress || !landlordAddress.trim()) missingA.push('Quê quán / Địa chỉ thường trú (ghi trên CCCD)');
    if (!finalLandlordCurrentAddress) missingA.push('Nơi ở hiện tại / Địa chỉ liên hệ');

    const missingB = [];
    if (!tenantName || !tenantName.trim()) missingB.push('Họ và tên khách thuê');
    if (!finalPhone || !finalPhone.trim()) missingB.push('Số điện thoại khách thuê');
    if (!finalCccd || !finalCccd.trim()) missingB.push('Số CCCD khách thuê');
    if (!finalDob) missingB.push('Ngày sinh theo CCCD');
    if (!finalAddress?.trim() && !finalHometown?.trim()) missingB.push('Quê quán / Địa chỉ thường trú (ghi trên CCCD)');
    if (!finalCurrentAddress?.trim()) missingB.push('Nơi ở hiện tại / Địa chỉ liên hệ');

    if (missingA.length > 0 || missingB.length > 0) {
      const reasons = [];
      if (missingA.length > 0) reasons.push(`Bên cho thuê (Bên A) còn thiếu: ${missingA.join(', ')}`);
      if (missingB.length > 0) reasons.push(`Bên thuê (Bên B) còn thiếu: ${missingB.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Thông tin cá nhân 2 bên không đủ thông tin pháp lý CCCD để lập hợp đồng! ${reasons.join('. ')}. Vui lòng yêu cầu cập nhật đủ thông tin trước khi lập hợp đồng.`
      });
    }

    const initialStatus = status || 'WAITING_TENANT_SIGNATURE';
    const isAlreadyActive = initialStatus === 'ACTIVE';

    const newContract = new Contract({
      room: targetRoomId,
      roomId: targetRoomId,
      signedDate: signedDate ? new Date(signedDate) : new Date(),
      // Bên A
      landlordName: landlordName.trim(),
      landlordDob: new Date(landlordDob),
      landlordCccd: landlordCccd.trim(),
      landlordAddress: finalLandlordAddress,
      landlordCurrentAddress: finalLandlordCurrentAddress,
      landlordPhone: landlordPhone.trim(),
      landlordWorkplace: landlordWorkplace?.trim() || '',
      landlordSignature: landlordName.trim(), // Bên A ký xác nhận khi tạo
      landlordSignedAt: new Date(),
      // Bên B
      tenantId: tenantId || null,
      tenantName: tenantName.trim(),
      tenantDob: new Date(finalDob),
      tenantDateOfBirth: new Date(finalDob),
      tenantCccd: finalCccd.trim(),
      tenantIdentityNumber: finalCccd.trim(),
      tenantAddress: (finalAddress || finalHometown || '').trim(),
      tenantCurrentAddress: (finalCurrentAddress || '').trim(),
      tenantHometown: (finalHometown || '').trim(),
      tenantPhone: finalPhone.trim(),
      tenantWorkplace: finalWorkplace?.trim() || '',
      tenantGender: finalGender,
      tenantIdentityIssuedDate: finalIssuedDate ? new Date(finalIssuedDate) : null,
      tenantIdentityIssuedPlace: finalIssuedPlace?.trim() || '',
      tenantSignature: isAlreadyActive ? tenantName.trim() : '',
      tenantSignedAt: isAlreadyActive ? new Date() : null,
      // HĐ & tài chính
      startDate,
      endDate,
      depositAmount: Number(depositAmount),
      rentalPrice: Number(rentalPrice),
      status: initialStatus
    });

    await newContract.save();

    // TC_CTR_01: Chỉ khi hợp đồng ACTIVE thì phòng mới chuyển sang RENTED
    if (newContract.status === 'ACTIVE') {
      existingRoom.status = 'RENTED';
      await existingRoom.save();

      // Cập nhật phòng đang ở cho khách thuê (nếu có tài khoản)
      if (tenantId) {
        await User.findByIdAndUpdate(tenantId, { currentRoom: targetRoomId });
      }
    }

    const message = newContract.status === 'ACTIVE'
      ? 'Tạo hợp đồng thành công! Phòng đã chuyển sang trạng thái RENTED.'
      : `Lập form hợp đồng thành công! Hợp đồng đang ở trạng thái [CHỜ KHÁCH KÝ ONLINE]. Khách thuê "${newContract.tenantName}" cần đăng nhập kiểm tra và ký tên online để hợp đồng chính thức có hiệu lực (ACTIVE).`;

    res.status(201).json({ 
      success: true, 
      message, 
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

// Khách thuê (Bên B) xem và ký tên online để kích hoạt hợp đồng chính thức
exports.signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature, tenantName, userId } = req.body;

    const contract = await Contract.findById(id).populate('roomId').populate('room');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng!' });
    }

    if (contract.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Hợp đồng này đã được ký xác nhận và đang có hiệu lực!' });
    }

    if (contract.status === 'TERMINATED') {
      return res.status(400).json({ success: false, message: 'Hợp đồng này đã bị thanh lý, không thể ký!' });
    }

    const finalSignature = signature?.trim() || tenantName?.trim() || contract.tenantName;
    if (!finalSignature) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp chữ ký hoặc họ tên xác nhận ký tên online!' });
    }

    // 1. Cập nhật chữ ký & chuyển trạng thái hợp đồng sang ACTIVE (Có hiệu lực chính thức)
    contract.tenantSignature = finalSignature;
    contract.tenantSignedAt = new Date();
    contract.status = 'ACTIVE';
    if (userId && !contract.tenantId) {
      contract.tenantId = userId;
    }
    await contract.save();

    // 2. Chuyển trạng thái phòng sang RENTED
    const targetRoomId = contract.roomId?._id || contract.roomId || contract.room?._id || contract.room;
    if (targetRoomId) {
      await Room.findByIdAndUpdate(targetRoomId, { status: 'RENTED' });
    }

    // 3. Cập nhật phòng đang ở cho tài khoản khách thuê nếu có
    const finalTenantUserId = userId || contract.tenantId;
    if (finalTenantUserId && targetRoomId) {
      await User.findByIdAndUpdate(finalTenantUserId, { currentRoom: targetRoomId });
    }

    res.status(200).json({
      success: true,
      message: 'Ký tên online xác nhận hợp đồng thành công! Hợp đồng chính thức có hiệu lực (ACTIVE) và phòng đã chuyển sang trạng thái RENTED.',
      data: contract
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi ký tên hợp đồng online', error: error.message });
  }
};
