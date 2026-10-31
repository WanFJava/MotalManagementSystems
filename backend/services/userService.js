const User = require('../models/User');
const Room = require('../models/Room');

/**
 * «service» UserService - Tầng nghiệp vụ xử lý tài khoản, khách thuê & nhân viên
 * Phân hệ đảm nhiệm: Thành viên 2 - Khánh (User & Tenant Management)
 * Tuân thủ SWR2.1, SWR2.2, SWR2.3, SWR2.4 và các Test Cases TC_USER_01 -> TC_USER_04
 */
class UserService {
  /**
   * 1. Đăng ký tài khoản mới (SWR2.1 / TC_USER_01)
   */
  async registerUser(userData) {
    const { fullName, phone, email, password, role } = userData;

    if (!fullName || !phone || !email || !password) {
      throw new Error('Vui lòng điền đầy đủ các thông tin: Họ tên, Số điện thoại, Email, Mật khẩu!');
    }

    // Kiểm tra trùng Số điện thoại
    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      throw new Error(`Số điện thoại '${phone}' đã được đăng ký trên hệ thống!`);
    }

    // Kiểm tra trùng Email
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      throw new Error(`Email '${email}' đã được đăng ký trên hệ thống!`);
    }

    if (password.length < 6) {
      throw new Error('Mật khẩu phải chứa ít nhất 6 ký tự!');
    }

    // Tạo mới tài khoản (mật khẩu tự động được bcrypt hash qua pre-save hook)
    const newUser = new User({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role && ['TENANT', 'STAFF', 'MANAGER'].includes(role) ? role : 'TENANT'
    });

    await newUser.save();

    const token = newUser.generateAuthToken();
    return {
      user: newUser.toJSON(),
      token
    };
  }

  /**
   * 2. Đăng nhập hệ thống (SWR2.2 / TC_USER_02)
   * Cho phép đăng nhập bằng Số điện thoại hoặc Email
   */
  async loginUser({ identifier, password }) {
    if (!identifier || !password) {
      throw new Error('Vui lòng nhập tài khoản (SĐT hoặc Email) và mật khẩu!');
    }

    const cleanIdentifier = identifier.trim();

    // Tìm tài khoản theo SĐT hoặc Email
    const user = await User.findOne({
      $or: [
        { phone: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() }
      ]
    }).populate('currentRoom');

    if (!user) {
      throw new Error('Sai tài khoản hoặc mật khẩu!');
    }

    // Kiểm tra trạng thái kích hoạt của tài khoản (TC_USER_04)
    if (user.isActive === false) {
      throw new Error('Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản lý để được hỗ trợ.');
    }

    // So khớp mật khẩu đã hash với bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Sai tài khoản hoặc mật khẩu!');
    }

    // Sinh JWT Token
    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * 3. Lấy thông tin tài khoản theo ID
   */
  async getUserById(id) {
    const user = await User.findById(id).populate('currentRoom');
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }
    return user;
  }

  /**
   * 4. Lấy danh sách tất cả người dùng (hỗ trợ lọc đa tiêu chí)
   */
  async getAllUsers(filters = {}) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined && filters.isActive !== '') {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.roomId) {
      query.currentRoom = filters.roomId;
    }

    if (filters.temporaryResidenceStatus) {
      query.temporaryResidenceStatus = filters.temporaryResidenceStatus;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { identityNumber: searchRegex }
      ];
    }

    return await User.find(query).populate('currentRoom').sort({ createdAt: -1 });
  }

  /**
   * 5. Lấy danh sách Khách thuê (Tenant) - UC06
   */
  async getTenants(filters = {}) {
    return await this.getAllUsers({ ...filters, role: 'TENANT' });
  }

  /**
   * 6. Lấy danh sách Nhân viên & Quản lý - UC15
   */
  async getStaffList(filters = {}) {
    const query = {
      role: { $in: ['STAFF', 'MANAGER'] }
    };

    if (filters.role) {
      query.role = filters.role;
    }

    if (filters.isActive !== undefined && filters.isActive !== '') {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ];
    }

    return await User.find(query).sort({ createdAt: -1 });
  }

  /**
   * 7. Tạo tài khoản nhân viên mới (Manager quản lý - UC15)
   */
  async createStaff(staffData) {
    const { fullName, phone, email, password, role } = staffData;

    if (!fullName || !phone || !email || !password) {
      throw new Error('Vui lòng điền đủ: Họ tên, Số điện thoại, Email, Mật khẩu ban đầu!');
    }

    const existingPhone = await User.findOne({ phone: phone.trim() });
    if (existingPhone) {
      throw new Error(`Số điện thoại '${phone}' đã tồn tại trên hệ thống!`);
    }

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      throw new Error(`Email '${email}' đã tồn tại trên hệ thống!`);
    }

    const newStaff = new User({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'MANAGER' ? 'MANAGER' : 'STAFF',
      isActive: true
    });

    await newStaff.save();
    return newStaff.toJSON();
  }

  /**
   * 8. Cập nhật hồ sơ định danh CCCD khách thuê (SWR2.3 / UC06 / TC_USER_03)
   */
  async updateTenantProfile(id, profileData) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy thông tin khách thuê!');
    }

    const {
      fullName,
      identityNumber,
      identityIssuedDate,
      identityIssuedPlace,
      identityCardFront,
      identityCardBack,
      dateOfBirth,
      gender,
      hometown,
      currentAddress,
      temporaryResidenceStatus,
      currentRoom
    } = profileData;

    // Kiểm tra CCCD trùng lặp nếu có thay đổi
    if (identityNumber && identityNumber.trim() !== '') {
      const cleanIdentity = identityNumber.trim();
      const existingIdentity = await User.findOne({
        identityNumber: cleanIdentity,
        _id: { $ne: id }
      });

      if (existingIdentity) {
        throw new Error(`Số CCCD '${cleanIdentity}' đã tồn tại trong hồ sơ của khách thuê khác!`);
      }

      user.identityNumber = cleanIdentity;
    }

    if (fullName) user.fullName = fullName.trim();
    if (identityIssuedDate) user.identityIssuedDate = new Date(identityIssuedDate);
    if (identityIssuedPlace) user.identityIssuedPlace = identityIssuedPlace.trim();
    if (identityCardFront !== undefined) user.identityCardFront = identityCardFront;
    if (identityCardBack !== undefined) user.identityCardBack = identityCardBack;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (hometown !== undefined) user.hometown = hometown.trim();
    if (currentAddress !== undefined) user.currentAddress = currentAddress.trim();
    if (temporaryResidenceStatus) user.temporaryResidenceStatus = temporaryResidenceStatus;

    // Cập nhật phòng đang ở nếu có
    if (currentRoom !== undefined) {
      if (currentRoom === null || currentRoom === '') {
        user.currentRoom = null;
      } else {
        const room = await Room.findById(currentRoom);
        if (!room) {
          throw new Error('Phòng trọ được chỉ định không tồn tại!');
        }
        user.currentRoom = currentRoom;
      }
    }

    await user.save();
    return await User.findById(id).populate('currentRoom');
  }

  /**
   * 9. Khóa / Mở khóa tài khoản nhân viên hoặc khách thuê (SWR2.4 / TC_USER_04)
   */
  async toggleUserStatus(id, isActive) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }

    user.isActive = Boolean(isActive);
    await user.save();

    const actionText = user.isActive ? 'Mở khóa' : 'Khóa';
    return {
      user: user.toJSON(),
      message: `${actionText} tài khoản thành công!`
    };
  }

  /**
   * 10. Cập nhật thông tin tài khoản chung
   */
  async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }

    // Kiểm tra trùng SĐT nếu cập nhật SĐT mới
    if (updateData.phone && updateData.phone.trim() !== user.phone) {
      const existingPhone = await User.findOne({
        phone: updateData.phone.trim(),
        _id: { $ne: id }
      });
      if (existingPhone) {
        throw new Error(`Số điện thoại '${updateData.phone}' đã được sử dụng!`);
      }
      user.phone = updateData.phone.trim();
    }

    // Kiểm tra trùng Email nếu cập nhật Email mới
    if (updateData.email && updateData.email.trim().toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: updateData.email.trim().toLowerCase(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        throw new Error(`Email '${updateData.email}' đã được sử dụng!`);
      }
      user.email = updateData.email.trim().toLowerCase();
    }

    if (updateData.fullName) user.fullName = updateData.fullName.trim();
    if (updateData.role) user.role = updateData.role;
    if (updateData.avatar) user.avatar = updateData.avatar;
    if (updateData.currentAddress) user.currentAddress = updateData.currentAddress;
    if (updateData.hometown) user.hometown = updateData.hometown;

    // Đổi mật khẩu nếu có gửi password mới
    if (updateData.password && updateData.password.length >= 6) {
      user.password = updateData.password;
    }

    await user.save();
    return await User.findById(id).populate('currentRoom');
  }

  /**
   * 12. Lấy thông tin cá nhân (Profile)
   */
  async getProfile(userId) {
    const user = await User.findById(userId).populate('currentRoom');
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }
    return user;
  }

  /**
   * 13. Cập nhật hồ sơ cá nhân (Profile)
   */
  async updateProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }

    const {
      fullName,
      phone,
      email,
      address,
      currentAddress,
      identityNumber,
      identityIssuedDate,
      identityIssuedPlace,
      identityCardFront,
      identityCardBack,
      dateOfBirth,
      gender,
      hometown,
      temporaryResidenceStatus,
      avatar,
      password
    } = profileData;

    // Kiểm tra trùng SĐT nếu thay đổi
    if (phone && phone.trim() !== user.phone) {
      const existingPhone = await User.findOne({
        phone: phone.trim(),
        _id: { $ne: userId }
      });
      if (existingPhone) {
        throw new Error(`Số điện thoại '${phone}' đã được đăng ký!`);
      }
      user.phone = phone.trim();
    }

    // Kiểm tra trùng Email nếu thay đổi
    if (email && email.trim().toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingEmail) {
        throw new Error(`Email '${email}' đã được đăng ký!`);
      }
      user.email = email.trim().toLowerCase();
    }

    // Kiểm tra CCCD trùng lặp
    if (identityNumber && identityNumber.trim() !== (user.identityNumber || '')) {
      const cleanIdentity = identityNumber.trim();
      const existingIdentity = await User.findOne({
        identityNumber: cleanIdentity,
        _id: { $ne: userId }
      });
      if (existingIdentity) {
        throw new Error(`Số CCCD '${cleanIdentity}' đã tồn tại trong hồ sơ của khách thuê khác!`);
      }
      user.identityNumber = cleanIdentity;
    }

    if (fullName) user.fullName = fullName.trim();
    const finalAddress = address !== undefined ? address : currentAddress;
    if (finalAddress !== undefined) {
      user.address = finalAddress.trim();
      user.currentAddress = finalAddress.trim();
    }
    if (identityIssuedDate) user.identityIssuedDate = new Date(identityIssuedDate);
    if (identityIssuedPlace !== undefined) user.identityIssuedPlace = identityIssuedPlace.trim();
    if (identityCardFront !== undefined) user.identityCardFront = identityCardFront;
    if (identityCardBack !== undefined) user.identityCardBack = identityCardBack;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (hometown !== undefined) user.hometown = hometown.trim();
    if (temporaryResidenceStatus) user.temporaryResidenceStatus = temporaryResidenceStatus;
    if (avatar) user.avatar = avatar;

    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();
    return await User.findById(userId).populate('currentRoom');
  }
}

module.exports = new UserService();
