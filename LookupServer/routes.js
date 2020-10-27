const { Router } = require('express');


const { connectionMongoose, lookupService } = require('./service');
const LookupModel = require('./database/models/Loolup');

const lookupRouter = Router();

lookupRouter.post('/', async (req, res) => {
    try {
      await connectionMongoose.connectionDB();
      await LookupModel(req.body).save();
      res.end('Lookup created!');
    } catch (err) {
      if (err) res.end(err.message);
    }
  }
);
lookupRouter.get('/:lookupName', async (req, res) => {
    try {
      let { lookupName } = req.params;
      await connectionMongoose.connectionDB();
      let lookup = await LookupModel.find({ lookupName }).select('-_id -__v -lookupName');
      res.json(lookup);
    } catch (err) {
      if (err) res.end(err.message);
    }
  }
);

module.exports = lookupRouter;
