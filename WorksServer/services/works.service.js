const WorkModel = require('../database/models/Work');
const MemberModel = require('../database/models/Member');
const LookupModel = require('../database/models/Loolup');

module.exports = {
  createWorks: (objToCreate) => {
    return new WorkModel(objToCreate).save();
  },
  updataMemberWorksByID: (user_id, workId) => {
    return MemberModel.updateOne({ user_id }, {
      $push: { works: workId }
    });
  },
  updataPullMemberWorksByID: (user_id, workId) => {
    return MemberModel.updateOne({ user_id }, {
      $pull: { works: workId }
    }, { safe: true });
  },
  findMemberById: (id) => {
    return MemberModel.findOne(id);
  },
  findMemberWorksById: (id) => {
    return WorkModel.findOne(id).select('-_id');
  },
  findUserIdByWorkId: (id) => {
    return WorkModel.findById(id);
  },
  findWorkByWorkId: (id) => {
    return WorkModel.findById(id).select( '-_id -__v -user_id -updatedAt -createdAt' );
  },
  findWorksByIdAndDelete: (id) => {
    return WorkModel.findByIdAndDelete(id);
  },
  getCountryCode: (lookupCode) => {
    return LookupModel.find({ lookupName: lookupCode}).select( '-_id -__v -lookupName' );
  },


  // await LookupModel.updateOne({_id:'5f8eeb0d3da7da0d8c4c3165'},{
  //   $push: { countries: req.body }
  // });
};
