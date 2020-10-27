const elasticsearch = require('elasticsearch');

module.exports = {
  client: () => {
    return new elasticsearch.Client({ host: process.env.ELASTIC_SEARCH_URL });
  }
}
