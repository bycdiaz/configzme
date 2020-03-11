const mongoose = require('mongoose');
const { extractUserCredentials } = require('../helpers');

const User = mongoose.model('User');
const passport = require('passport');

async function authenticateByHeaders(req, res, next) {
  try {
    const authHeader = req.get('Authorization');

    // If there is no auth header, go to 404
    if (!authHeader) return next('route');
    const [username, password] = extractUserCredentials.fromBasicAuth(authHeader);

    const { user } = await User.authenticate()(username, password);
    if (user) {
      req.user = {
        _id: user._id,
        username: user.username,
        files: user.files,
      };
      return next();
    }

    return res.status(403).send('Access Denied\n');
  } catch (err) {
    next(err);
  }
}

async function authenticateByPassport(req, res, next) {
  if (req.session.user) {
    const { user } = req.session;

    req.user = {
      _id: user._id,
      username: user.username,
      files: user.files,
    };
    return next();
  }
  return res.status(403).send('Access Denied\n');
}

exports.authenticate = async (req, res, next) => {
  if (req.get('Authorization')) {
    authenticateByHeaders(req, res, next);
  } else {
    authenticateByPassport(req, res, next);
  }
};

exports.register = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    // if there is no authHeader, go to 404
    if (!authHeader) return next('route');
    const [username, password] = extractUserCredentials.fromBasicAuth(authHeader);

    const user = new User({
      username,
      active: true,
    });

    try {
      await User.register(user, password);
    } catch (error) {
      if (error.name === 'UserExistsError') {
        return res.send(`${error.message}\n`);
      }
      throw error;
    }

    const authenticate = User.authenticate();
    await authenticate(username, password);

    res.send(`Registered as "${username}"\n`);
  } catch (err) {
    next(err);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log(err, user);
    if (!err) {
      req.session.user = {
        _id: user._id,
        username: user.username,
        files: user.files,
      };

      return res.json({
        username: user.username,
      });
    }
    return res.status(403).send('Access Denied\n');
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    res.send('logout');
  });
};
