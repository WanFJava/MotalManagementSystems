const crypto = require('crypto');

// Cấu hình VNPay Sandbox API (Mặc định môi trường Test)
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNP_TMN_CODE || '2QXUI454',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || 'RAOCTP83D0EAE4S95F35414VDRRHOE5Z',
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment-return'
};

/**
 * Hàm sắp xếp các tham số URL theo thứ tự từ điển (bắt buộc theo chuẩn VNPay)
 */
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Tạo chuỗi định dạng ngày theo chuẩn VNPay (YYYYMMDDHHmmss)
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Sinh link thanh toán VNPay Sandbox với mã hash checksum SHA512
 */
function createPaymentUrl({ ipAddr, amount, bankCode, orderInfo, orderId, returnUrl }) {
  const createDate = formatDate(new Date());
  const tmnCode = VNPAY_CONFIG.vnp_TmnCode;
  const secretKey = VNPAY_CONFIG.vnp_HashSecret;
  let vnpUrl = VNPAY_CONFIG.vnp_Url;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = 'other';
  // VNPay tính đơn vị số tiền nhân với 100
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl || VNPAY_CONFIG.vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
  vnp_Params['vnp_CreateDate'] = createDate;

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  // Tạo chuỗi query string và chữ ký băm SHA512
  const signData = Object.keys(vnp_Params)
    .map(key => `${key}=${vnp_Params[key]}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  const finalQuery = Object.keys(vnp_Params)
    .map(key => `${key}=${vnp_Params[key]}`)
    .join('&');

  return `${vnpUrl}?${finalQuery}`;
}

/**
 * Xác thực chữ ký phản hồi từ VNPay (Return URL hoặc IPN Webhook)
 */
function verifyReturnUrl(vnp_Params) {
  const secureHash = vnp_Params['vnp_SecureHash'];
  const paramsToVerify = { ...vnp_Params };
  delete paramsToVerify['vnp_SecureHash'];
  delete paramsToVerify['vnp_SecureHashType'];

  const sortedParams = sortObject(paramsToVerify);
  const signData = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('&');

  const secretKey = VNPAY_CONFIG.vnp_HashSecret;
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isSuccess = secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00';

  return {
    isValid: secureHash === signed,
    isSuccess: isSuccess,
    orderId: vnp_Params['vnp_TxnRef'],
    amount: vnp_Params['vnp_Amount'] ? Number(vnp_Params['vnp_Amount']) / 100 : 0,
    transactionNo: vnp_Params['vnp_TransactionNo'],
    bankCode: vnp_Params['vnp_BankCode'],
    responseCode: vnp_Params['vnp_ResponseCode']
  };
}

module.exports = {
  VNPAY_CONFIG,
  sortObject,
  createPaymentUrl,
  verifyReturnUrl
};
