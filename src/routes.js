const { Router } = require('express');
const LoginController = require('./controllers/loginController');

const routes = Router();
const login = new LoginController();

routes.post('/signUp', login.signUp);
routes.post('/signIn', login.signIn);
routes.get('/user/:id', login.getUser);

module.exports = routes;