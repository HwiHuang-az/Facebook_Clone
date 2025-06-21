const validator = require('validator');

// Validation cho đăng ký
const validateRegister = (req, res, next) => {
  const { firstName, lastName, email, password, dateOfBirth, gender } = req.body;
  const errors = [];

  // Kiểm tra firstName
  if (!firstName || firstName.trim().length < 1) {
    errors.push('Tên không được để trống');
  } else if (firstName.trim().length < 2) {
    errors.push('Tên phải có ít nhất 2 ký tự');
  } else if (firstName.trim().length > 50) {
    errors.push('Tên không được quá 50 ký tự');
  }

  // Kiểm tra lastName
  if (!lastName || lastName.trim().length < 1) {
    errors.push('Họ không được để trống');
  } else if (lastName.trim().length < 2) {
    errors.push('Họ phải có ít nhất 2 ký tự');
  } else if (lastName.trim().length > 50) {
    errors.push('Họ không được quá 50 ký tự');
  }

  // Kiểm tra email
  if (!email) {
    errors.push('Email không được để trống');
  } else if (!validator.isEmail(email)) {
    errors.push('Email không đúng định dạng');
  } else if (email.length > 100) {
    errors.push('Email không được quá 100 ký tự');
  }

  // Kiểm tra password
  if (!password) {
    errors.push('Mật khẩu không được để trống');
  } else if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  } else if (password.length > 128) {
    errors.push('Mật khẩu không được quá 128 ký tự');
  }

  // Kiểm tra dateOfBirth
  if (dateOfBirth) {
    if (!validator.isDate(dateOfBirth)) {
      errors.push('Ngày sinh không đúng định dạng');
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        errors.push('Bạn phải ít nhất 13 tuổi để tạo tài khoản');
      }
      
      if (age > 120) {
        errors.push('Ngày sinh không hợp lệ');
      }
    }
  }

  // Kiểm tra gender
  if (gender && !['male', 'female', 'other'].includes(gender)) {
    errors.push('Giới tính không hợp lệ');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  req.body.email = email.trim().toLowerCase();

  next();
};

// Validation cho đăng nhập
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Kiểm tra email
  if (!email) {
    errors.push('Email không được để trống');
  } else if (!validator.isEmail(email)) {
    errors.push('Email không đúng định dạng');
  }

  // Kiểm tra password
  if (!password) {
    errors.push('Mật khẩu không được để trống');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Chuẩn hóa email
  req.body.email = email.trim().toLowerCase();

  next();
};

// Validation cho đổi mật khẩu
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Mật khẩu hiện tại không được để trống');
  }

  if (!newPassword) {
    errors.push('Mật khẩu mới không được để trống');
  } else if (newPassword.length < 6) {
    errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
  } else if (newPassword.length > 128) {
    errors.push('Mật khẩu mới không được quá 128 ký tự');
  }

  if (currentPassword === newPassword) {
    errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  next();
};

// Validation cho cập nhật profile
const validateProfile = (req, res, next) => {
  const { firstName, lastName, bio, location, work, education } = req.body;
  const errors = [];

  // Kiểm tra firstName
  if (!firstName || firstName.trim().length < 1) {
    errors.push('Tên không được để trống');
  } else if (firstName.trim().length < 2) {
    errors.push('Tên phải có ít nhất 2 ký tự');
  } else if (firstName.trim().length > 50) {
    errors.push('Tên không được quá 50 ký tự');
  }

  // Kiểm tra lastName
  if (!lastName || lastName.trim().length < 1) {
    errors.push('Họ không được để trống');
  } else if (lastName.trim().length < 2) {
    errors.push('Họ phải có ít nhất 2 ký tự');
  } else if (lastName.trim().length > 50) {
    errors.push('Họ không được quá 50 ký tự');
  }

  // Kiểm tra bio
  if (bio && bio.length > 500) {
    errors.push('Tiểu sử không được quá 500 ký tự');
  }

  // Kiểm tra các trường khác
  if (location && location.length > 100) {
    errors.push('Địa điểm không được quá 100 ký tự');
  }

  if (work && work.length > 100) {
    errors.push('Công việc không được quá 100 ký tự');
  }

  if (education && education.length > 100) {
    errors.push('Học vấn không được quá 100 ký tự');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Chuẩn hóa dữ liệu
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  if (bio) req.body.bio = bio.trim();
  if (location) req.body.location = location.trim();
  if (work) req.body.work = work.trim();
  if (education) req.body.education = education.trim();

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateProfile
}; 