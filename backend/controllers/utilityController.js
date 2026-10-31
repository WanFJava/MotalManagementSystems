const utilityInvoiceService = require('../services/utilityInvoiceService');
const UtilityReading = require('../models/UtilityReading');

// Ghi chỉ số điện nước (UC07)
exports.recordUtility = async (req, res) => {
  try {
    const reading = await utilityInvoiceService.recordUtility(req.body);
    res.status(201).json({
      success: true,
      message: 'Ghi nhận chỉ số điện nước thành công!',
      data: reading
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Lấy danh sách chỉ số điện nước
exports.getUtilities = async (req, res) => {
  try {
    const readings = await utilityInvoiceService.getUtilityReadings(req.query);
    res.status(200).json({
      success: true,
      message: 'Tải danh sách chỉ số điện nước thành công',
      data: readings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Lấy chỉ số mới nhất của phòng
exports.getLatestUtility = async (req, res) => {
  try {
    const latest = await utilityInvoiceService.getLatestUtility(req.params.roomId);
    res.status(200).json({
      success: true,
      message: 'Lấy chỉ số kỳ trước thành công',
      data: latest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Cập nhật chỉ số điện nước
exports.updateUtility = async (req, res) => {
  try {
    const { oldElec, newElec, oldWater, newWater, note } = req.body;
    if (newElec !== undefined && oldElec !== undefined && Number(newElec) < Number(oldElec)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ',
        data: null
      });
    }
    if (newWater !== undefined && oldWater !== undefined && Number(newWater) < Number(oldWater)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ',
        data: null
      });
    }

    const reading = await UtilityReading.findById(req.params.id);
    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi chỉ số điện nước',
        data: null
      });
    }

    if (oldElec !== undefined) reading.oldElec = Number(oldElec);
    if (newElec !== undefined) reading.newElec = Number(newElec);
    if (oldWater !== undefined) reading.oldWater = Number(oldWater);
    if (newWater !== undefined) reading.newWater = Number(newWater);
    if (reading.newElec !== undefined && reading.oldElec !== undefined) {
      reading.electricUsage = reading.newElec - reading.oldElec;
    }
    if (reading.newWater !== undefined && reading.oldWater !== undefined) {
      reading.waterUsage = reading.newWater - reading.oldWater;
    }
    if (note !== undefined) reading.note = note;

    await reading.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật chỉ số điện nước thành công',
      data: reading
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

// Xóa bản ghi chỉ số
exports.deleteUtility = async (req, res) => {
  try {
    const deleted = await UtilityReading.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi để xóa',
        data: null
      });
    }
    res.status(200).json({
      success: true,
      message: 'Đã xóa bản ghi chỉ số điện nước thành công',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
