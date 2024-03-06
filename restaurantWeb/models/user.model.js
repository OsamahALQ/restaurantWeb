const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  privacy: {
    type: Boolean,
    required: true,
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
  console.log('[' + username + ']', password)
  User.findOne({ username: username })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var bob = new User({ username: username, password: 'test' });
        bob.save(function (err) {
          console.log('DONE')
          if (err) { return handleError(err); console.log(err);
          } else {
            console.log('successfully saving to user!')
          }
        });
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      if (user.password === password) {
        return callback(null, user);
      }
      return callback();
    });
}

var User = mongoose.model('users', UserSchema);
module.exports = User;