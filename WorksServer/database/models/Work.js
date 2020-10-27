const { Schema, model } = require('mongoose');

const Work = new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: 'user' },
    title: String,
    author: String,
    style: String,
    body: String,
    comments: [{
      body: String,
      date: { type: Date, default: Date.now }
    }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
      votes: Number,
      favs: Number
    }
  },
  {
    timestamps: true
  });

module.exports = model('work', Work);
