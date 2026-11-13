const mongoose = require('mongoose');

// «entity» PaymentTransaction - Giao dịch thanh toán
const paymentTransactionSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  transactionCode: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'VNPAY'],
    required: true
  },
  bankCode: {
    type: String,
    default: ''
  },
  vnpayTxnRef: {
    type: String,
    default: ''
  },
  vnpayTransactionNo: {
    type: String,
    default: ''
  },
  vnpayResponseCode: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  paidAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
}, {
  collection: 'payment_transactions',
  timestamps: true
});

paymentTransactionSchema.pre('validate', function(next) {
  if (this.invoiceId && !this.invoice) this.invoice = this.invoiceId;
  if (this.invoice && !this.invoiceId) this.invoiceId = this.invoice;
  next();
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
