const UserModel = require('../database/models/User');

module.exports = {
  findOneByParams: (findObj) => {
    return UserModel.findOne(findObj);
  },
  updateOneByParams: (condition, obj) => {
    return UserModel.updateOne(condition, obj);
  },
  updateOneById: (_id, obj) => {
    return UserModel.updateOne(_id, obj);
  },

}
