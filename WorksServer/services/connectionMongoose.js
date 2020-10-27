const mongoose = require('mongoose');

module.exports = {
  connectionDB: () => {
    return mongoose.connect(encodeURI(process.env.MONGODB_URI), { useNewUrlParser: true });
  }
}
