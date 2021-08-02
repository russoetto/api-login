const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/db_login', { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const userCollection = mongoose.model('user', new Schema({
  id: String,
  nome: String,
  email: String,
  senha: String,
  telefone: { type: Array, "default": []},
  dataCriacao: String,
  dataAtualizacao: String,
  ultimoLogin: String,
  token: String
}), 'user');

module.exports = { userCollection };