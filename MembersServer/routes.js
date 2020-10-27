const { Router } = require('express');

const { auth } = require('./midllewares');
const { userService, connecMongooseService, elasticClient } = require('./services');
const { bcryptHelper } = require('./helpers');
const {newUserValidator} = require('./validators');

const membersRouter = Router();

membersRouter.post('/', async (req, res) => {
  try {
    let member = req.body;
    let { email,password, first_name, last_name, age } = member;

    const {error} = newUserValidator.validate({email, password, first_name, last_name, age});
    if (error) throw new Error('Member is not valid!');

    await connecMongooseService.connectionDB();

    let presentUser = await userService.findOneByParams({ email });
    if (presentUser) throw new Error('Email address already exists');

    member.password = await bcryptHelper.hashPassword(member.password);
    let { _id: user_id } = await userService.createUser(member);
    await userService.createMember({ ...member, user_id });
    let newMemders = await userService.findOneMember({ user_id });
    await elasticClient.client().index({
      index: 'members',
      id: user_id.toString(),
      body: newMemders
    });

    res.end('New member created!')
  } catch (err) {
    if (err) res.status(400).json(err.message);
  }
});
membersRouter.get('/id/:id', async (req, res) => {
    try {
      let { id: user_id } = req.params;
      await connecMongooseService.connectionDB();
      let member = await userService.findOneMemberByParams({ user_id });
      if (!member) throw new Error('Member not found');
      let countryCodes = await userService.getCountryCode('countryCode');
      let countryCode = member.country;
      member.country = countryCodes.find(el => el.code === countryCode).name;

      res.json(member);

    } catch (err) {
      if (err) res.status(404).json(err.message);
    }
  }
);
membersRouter.get('/search', async (req, res) => {
  let { search, country, gender, ageGte, ageLte, createdAt } = req.query;
  try {
    let body = await elasticClient.client().search({
      index: 'members',
      filterPath: ['hits.hits._source'],
      body: {
        // _source: ['*'],
        query: {

          bool: {
            should: [
              { match: { country } },
              { match: { gender } }],
            filter: [
              { range: { age: { gte: ageGte, lte: ageLte } } }
            ],
            // minimum_should_match : 1,
          },

        },
        sort: [
          { "createdAt": { "order": createdAt } }],
      },
    });
    await connecMongooseService.connectionDB();
    let countryCodes = await userService.getCountryCode('countryCode');
    if (body.hits.hits) {
      for (const el of body.hits.hits) {
        let countryCode = el._source.country;
        el._source.country = countryCodes.find(el => el.code === countryCode).name;
      }
    }
    res.json(body);

  } catch (err) {
    if (err) res.status(404).json(err.message);
  }
});
membersRouter.get('/search/name', async (req, res) => {
  let { search, country, gender, ageGte, ageLte, createdAt } = req.query;
    try {
      let body = await elasticClient.client().search({
        index: 'members',
        filterPath: ['hits.hits._source'],
        body: {
          // _source: ['*'],
          query: {
            multi_match: {
              query: search,
              fields: ['*_name']
            },
          },
          sort: [
            { "createdAt": { "order": createdAt } }],
        },
      });
      await connecMongooseService.connectionDB();
      let countryCodes = await userService.getCountryCode('countryCode');
      if (body.hits.hits) {
        for (const el of body.hits.hits) {
          let countryCode = el._source.country;
          el._source.country = countryCodes.find(el => el.code === countryCode).name;
        }
      }
      res.json(body);

    } catch (err) {
      if (err) res.status(404).json(err.message);
    }
  }
);
membersRouter.delete('/:id', auth.checkAccessTokenMiddleware, async (req, res) => {
    try {
      let { id: _id } = req.params;
      await connecMongooseService.connectionDB();
      await userService.findUserByIdAndDelete(_id);
      await userService.findMemberByUserIdAndDelete(_id);
      await elasticClient.client().delete({
        index: 'members',
        id: _id
      });

      res.status(200).json('DELETED');
    } catch (err) {
      if (err) res.status(400).json(err.message);
    }
  }
);


module.exports = membersRouter;
