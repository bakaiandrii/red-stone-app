const UserModel = require('../database/models/User');
const MemberModel = require('../database/models/Member');
const LookupModel = require('../database/models/Loolup');

module.exports = {
  createUser: (objToCreate) => {
    return new UserModel(objToCreate).save();
  },
  createMember: (objToCreate) => {
    return new MemberModel(objToCreate).save();
  },

  findOneByParams: (findObj) => {
    return UserModel.findOne(findObj);
  },
  findOneMemberByParams: (findObj) => {
    return MemberModel.findOne(findObj).select( '-_id -__v -user_id -updatedAt -createdAt' );
  },
  findOneMember: (findObj) => {
    return MemberModel.findOne(findObj).select( '-_id' );
  },
  getCountryCode: (lookupCode) => {
    return LookupModel.find({ lookupName: lookupCode}).select( '-_id -__v -lookupName' );
  },
  findUserByIdAndDelete: (_id) => {
    return UserModel.findByIdAndDelete(_id, (err) => {
        if (err) throw err;
      });
  },
  findMemberByUserIdAndDelete: (_id) => {
    return MemberModel.findOneAndDelete({ user_id: _id });
  },
}
