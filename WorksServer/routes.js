const { Router } = require('express');

const { checkAccessTokenMiddleware } = require('./midllewares')
const { connecMongooseService, elasticClient, worksService } = require('./services');

const worksRouter = Router();

worksRouter.post('/:id', checkAccessTokenMiddleware, async (req, res) => {
  try {
    let memberWorks = req.body;
    let { id: user_id } = req.params;
    await connecMongooseService.connectionDB();
    let { _id } = await worksService.createWorks({ ...memberWorks, user_id });
    let newWorks = await worksService.findMemberWorksById({ user_id });
    await worksService.updataMemberWorksByID(user_id, _id);

    await elasticClient.client().index({
      index: 'works',
      id: _id.toString(),
      body: newWorks
    });

    await elasticClient.client().update({
      index: 'members',
      id: user_id,
      body: {
        script: {
          inline: 'ctx._source.works.add(params.arr)',
          params: { arr: _id }
        },
      }
    });

    res.end('Success new work creared!');
  } catch (err) {
    if (err) res.status(400).end(err);
  }
});
worksRouter.get('/id/:id', async (req, res) => {
  try {
    let { id } = req.params;
    await connecMongooseService.connectionDB();
    let works = await worksService.findWorkByWorkId(id);
    if (!works) throw new Error('Works not found');
    let styleCodes = await worksService.getCountryCode('workStyle');
    let styleCode = works.style;
    works.style = styleCodes.find(el => el.code === styleCode).name;

    res.json(works);

  } catch (err) {
    if (err) res.status(400).end(err.message);
  }
});
worksRouter.delete('/:id', checkAccessTokenMiddleware, async (req, res) => {
  let { id } = req.params;
  try {
    await connecMongooseService.connectionDB();
    let user = await worksService.findUserIdByWorkId(id);
    if (!user) throw new Error('Members work do not found');
    let { user_id } = user;
    await worksService.findWorksByIdAndDelete(id);
    await elasticClient.client().delete({
      index: 'works',
      id: id
    });
    await worksService.updataPullMemberWorksByID(user_id, id);
    await elasticClient.client().update({
      index: 'members',
      id: user_id.toString(),
      body: {
        script: {
          inline: 'ctx._source.works.remove(ctx._source.works.indexOf(params.arr))',
          params: { arr: id }
        },
      }
    });

    res.end('DELETED!');
  } catch (err) {
    if (err) res.status(400).end(err.message);
  }
});
worksRouter.get('/search', async (req, res) => {
  let { style, title, user_id, createdAt, updatedAt, date } = req.query;
  try {
    let body = await elasticClient.client().search({
      index: 'works',
      body: {
        query: {
          bool: {
            should: [
              { match: { style } },
              { match: { title } },
              { match: { user_id } }],
          },
        },
        sort: [
          { "createdAt": { "order": createdAt } },
          { "updatedAt": { "order": updatedAt } },
          { "date": { "order": date } }],
      }
    });

    await connecMongooseService.connectionDB();
    let countryCodes = await worksService.getCountryCode('workStyle');
    if (body.hits.hits) {
      for (const el of body.hits.hits) {
        let styleCode = el._source.style;
        el._source.style = countryCodes.find(el => el.code === styleCode).name;
      }
    }

    res.json(body);
  } catch (err) {
    if (err) res.status(400).end(err.message);
  }
});
worksRouter.get('/search/body', async (req, res) => {
  let { search, date } = req.query;
  try {
    let body = await elasticClient.client().search({
      index: 'works',
      body: {
        query: {
          match: {
            body: {
              query: search,
              minimum_should_match: 2
            }
          }
        },
        sort: [
          { "date": { "order": date } }],
      }
    });

    await connecMongooseService.connectionDB();
    let countryCodes = await worksService.getCountryCode('workStyle');
    if (body.hits.hits) {
      for (const el of body.hits.hits) {
        let styleCode = el._source.style;
        el._source.style = countryCodes.find(el => el.code === styleCode).name;
      }
    }


    res.json(body);
  } catch (err) {
    if (err) res.status(400).end(err.message);
  }
});


module.exports = worksRouter;
