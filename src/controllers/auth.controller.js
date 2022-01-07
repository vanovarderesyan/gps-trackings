const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}


const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  // const code = getRandomInt(1000,9999)
  const code = 1111
  
  let user = await userService.updateUserByEmail(req.body.email,{code})
  if (user) {
    await emailService.sendResetPasswordEmail(req.body.email, code);
    res.status(httpStatus.NO_CONTENT).send();
  }else{
    res.status(400).send();
  }

});

const checkCode = catchAsync(async (req, res) => {
 

  let result = await authService.checkCode(req.body.email, req.body.code);
  if (result){
    res.status(httpStatus.NO_CONTENT).send();
  }else{
    res.status(400).send();
  }
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.code, req.body.email,req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  checkCode
};
