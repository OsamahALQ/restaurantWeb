const mongoose = require("mongoose");

var OrderDetailSchema = new mongoose.Schema({
  quantity: Number,
  name: String,
});
mongoose.model('orderDetail',OrderDetailSchema ,'orderDetail' )

var OrderDetailSchema = new mongoose.Schema({
  quantity: Number,
  name: String,
});
mongoose.model('orderDetail1',OrderDetailSchema ,'orderDetail1' )

var OrderSchema = new mongoose.Schema({
  restaurantID: {
    type: Number,
    required: true,
    trim: true
  },
  restaurantName: {
    type: String,
    required: true,
    trim: true
  },
  subtotal: {
    type: String,
    required: true,
    trim: true
  },
  total: {
    type: String,
    required: true,
    trim: true
  },
  fee: {
    type: String,
    required: true,
    trim: true
  },
  tax: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    trim: true
  },
  order :{
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

const Any = new mongoose.Schema({any: Object});

var Order = mongoose.model('order', OrderSchema);
module.exports = Order;