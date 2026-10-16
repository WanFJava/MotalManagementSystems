const Contract = require('../models/Contract');
const Room = require('../models/Room');

// UC05: Lập hợp đồng mới
exports.createContract = async (req, res) => {
  try {
    const { room, tenantName, startDate, endDate, depositAmount, rentalPrice, status } = req.body;

    // Kiểm tra xem phòng có tồn tại không
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ message: 'Phòng không tồn tại' });
    }

    // TC_CTR_02: Cố tình tạo hợp đồng cho phòng đã có người
    // Kiểm tra xem phòng có đang được thuê hoặc có hợp đồng ACTIVE không
    const activeContract = await Contract.findOne({ room: room, status: 'ACTIVE' });
    if (existingRoom.status === 'RENTED' || activeContract) {
      return res.status(400).json({ message: 'Phòng đang có hợp đồng hoạt động' });
    }

    const newContract = new Contract({
      room,
      tenantName,
      startDate,
      endDate,
      depositAmount,
      rentalPrice,
      status: status || 'ACTIVE'
    });

    await newContract.save();

    // TC_CTR_01: Tạo thành công, phòng chuyển sang RENTED (nếu hợp đồng ACTIVE)
    if (newContract.status === 'ACTIVE') {
      existingRoom.status = 'RENTED';
      await existingRoom.save();
    }

    res.status(201).json({ message: 'Tạo hợp đồng thành công', data: newContract });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo hợp đồng', error: error.message });
  }
};

// Xem danh sách hợp đồng
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('room', 'roomNumber basePrice');
    res.status(200).json({ data: contracts });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách hợp đồng', error: error.message });
  }
};

// Xem chi tiết hợp đồng
exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('room', 'roomNumber basePrice');
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }
    res.status(200).json({ data: contract });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin hợp đồng', error: error.message });
  }
};

// UC05.1: Gia hạn hợp đồng
exports.extendContract = async (req, res) => {
  try {
    const { endDate } = req.body;
    if (!endDate) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ngày kết thúc mới (endDate)' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contract.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Chỉ có thể gia hạn hợp đồng đang hoạt động (ACTIVE)' });
    }

    contract.endDate = endDate;
    await contract.save();

    res.status(200).json({ message: 'Gia hạn hợp đồng thành công', data: contract });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gia hạn hợp đồng', error: error.message });
  }
};

// UC05.2: Thanh lý hợp đồng
// TC_CTR_03: Thanh lý hợp đồng -> Hợp đồng chuyển TERMINATED, phòng tự chuyển về AVAILABLE.
exports.terminateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ message: 'Hợp đồng không tồn tại' });
    }

    if (contract.status === 'TERMINATED') {
      return res.status(400).json({ message: 'Hợp đồng đã được thanh lý trước đó' });
    }

    // Chuyển trạng thái hợp đồng thành TERMINATED
    contract.status = 'TERMINATED';
    await contract.save();

    // Chuyển trạng thái phòng về AVAILABLE
    const room = await Room.findById(contract.room);
    if (room) {
      room.status = 'AVAILABLE';
      await room.save();
    }

    res.status(200).json({ message: 'Thanh lý hợp đồng thành công', data: contract });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thanh lý hợp đồng', error: error.message });
  }
};
