/**
 * Created by zhangliqing on 2017/9/19.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cloudware');
var db=mongoose.connection;

db.on('error',console.error.bind(console,'connection error: '));
db.once('open',function () {
  console.log('Connected to mongodb.')
});

var instanceSchema = mongoose.Schema({
  "user_id": String,
  "rancher_service_id": String,
  "ws": String,
  "cloudware_type": String,
  memory: Number,
  timestamp:Date
});
var cloudwareSchema = mongoose.Schema({
  name: String,
  logo: String,
  description: String,
  image: String,
  memory: Number,
  timestamps:Date
})
const Models = {
  Instance: mongoose.model('Instance',instanceSchema),
  Cloudware: mongoose.model('Cloudware',cloudwareSchema)
}

module.exports = Models;
