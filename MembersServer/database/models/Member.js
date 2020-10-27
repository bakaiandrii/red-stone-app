const { Schema, model } = require('mongoose');

const { userStatusEnum } = require('../../config');

const Member = new Schema({
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      require: true
    },
    first_name: String,
    last_name: String,
    age: Number,
    status: {
      type: String,
      required: true,
      default: userStatusEnum.PENDING
    },
    country: String,
    gender: String,
    works: [{
      type: Schema.Types.ObjectId,
      ref: 'work'
    }]

  },
  {
    timestamps: true
  });

module.exports = model('member', Member);

