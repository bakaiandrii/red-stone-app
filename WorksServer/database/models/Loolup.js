const { Schema, model } = require('mongoose');


const Lookup = new Schema({
  lookupName: String,
  code: String,
  name: String
});

module.exports = model('lookup', Lookup);
