const {Schema, model, Types} = require('mongoose')   // для создания модели

const schema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  links: [{ type: Types.ObjectId, ref: 'Link'}]
})

module.exports = model('User', schema)

