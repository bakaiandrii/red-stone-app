const bcrypt = require('bcrypt');

module.exports = {
  hashPassword: (password) => {
    return bcrypt.hash(password, 10);
  },
  passComparator: (password, hashedPassword) => {
    return   bcrypt.compare(password, hashedPassword);
  }

};
