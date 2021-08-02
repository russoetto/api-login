const { userCollection } = require('../db/mongoSchemas');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const jwt = require('jsonwebtoken');

class LoginController {
  signUp(request, response) {
    if (!request.body.nome)
      response.status(400).json({ mensagem: 'Nome inválido.' });
    else if ((!request.body.email) || (!request.body.email.includes('@')) || (!request.body.email.includes('.')))
      response.status(400).json({ mensagem: 'Email inválido.' });
    else if (!request.body.senha)
      response.status(400).json({ mensagem: 'Senha inválida.' });
    else if ((!request.body.telefones) || (!request.body.telefones.length))
      response.status(400).json({ mensagem: 'Telefone inválido.' });
    else {
      userCollection.find({ email: request.body.email }).exec((e, docs) => {
        if (e) {
          console.error(e);
          response.status(500).json({ mensagem: 'Ocorreu um erro ao inserir o usuário.' })
        } else {
          if (docs && docs.length)
            response.status(400).json({ mensagem: 'E-mail já existente' })
          else {
            let dataCriacao = moment().format('YYYY-MM-DD HH:mm:SS');
            let id = uuidv4();
            const token = jwt.sign(id, process.env.JWTKEY);
            let newUser = {
              id: id,
              nome: request.body.nome,
              email: request.body.email,
              senha: request.body.senha,
              telefone: request.body.telefones,
              dataCriacao: dataCriacao,
              dataAtualizacao: dataCriacao,
              ultimoLogin: dataCriacao,
              token: token
            }
            userCollection.create(newUser, e => {
              if (e) {
                console.error(e);
                response.status(500).json({ mensagem: 'Ocorreu um erro ao inserir o usuário.' })
              } else {
                response.status(201).json({
                  id: newUser.id,
                  nome: newUser.nome,
                  email: newUser.email,
                  telefones: newUser.telefones,
                  dataCriacao: newUser.dataCriacao,
                  dataAtualizacao: newUser.dataAtualizacao,
                  ultimoLogin: newUser.ultimoLogin,
                  token: token
                });
              }
            });
          }
        }
      })
    }
  }

  signIn(request, response) {
    if (!request.body.email)
      response.status(400).json({ mensagem: 'Email não preenchido.' });
    else if (!request.body.senha)
      response.status(400).json({ mensagem: 'Senha não preenchida.' });
    else {
      userCollection.findOne({ email: request.body.email }).exec((e, user) => { 
        if (e) {
          console.error(e);
          response.status(500).json({ mensagem: 'Ocorreu um erro ao realizar o login.' });
        } else {
          if (user) {
            if (request.body.senha == user.senha) {
              user.ultimoLogin = moment().format('YYYY-MM-DD HH:mm:SS');
              userCollection.updateOne({ id: user.id }, { $set: { ultimoLogin: user.ultimoLogin }}).exec();
              response.status(201).json({
                id: user.id,
                nome: user.nome,
                email: user.email,
                telefones: user.telefone,
                dataCriacao: user.dataCriacao,
                dataAtualizacao: user.dataAtualizacao,
                ultimoLogin: user.ultimoLogin,
                token: user.token
              });
            } else
              response.status(401).json({ mensagem: 'Usuário e/ou senha inválidos.' });
          } else 
            response.status(401).json({ mensagem: 'Usuário e/ou senha inválidos.' });
        }
      });
    }
  }

  getUser(request, response) {
    let token = request.headers['authentication'];
    if (!token) {
      response.status(400).json({ mensagem: 'Autenticação obrigatória.'});
    } else if (!request.params.id) {
      response.status(400).json({ mensagem: 'Id não preenchido.' })
    }
    else {
      token = token.replace('Bearer ', '');
      jwt.verify(token, process.env.JWTKEY, function(err, decoded) {
        if (err) {
          console.error(err);
          response.status(401).json({ mensagem: 'Não autorizado.'});
        } else {
          userCollection.findOne({ id: decoded }).exec((e, user) => {
            if (e) {
              console.error(e);
              response.status(500).json({ mensagem: 'Ocorreu um erro ao buscar o usuário.' });
            } else {
              if (!user) {
                response.status(401).json({ mensagem: 'Não autorizado.'});
              } else if(request.params.id == user.id) {
                let expireTime = moment().subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:SS');
                if (user.ultimoLogin > expireTime) {
                  response.status(200).json({
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    telefones: user.telefone,
                    dataCriacao: user.dataCriacao,
                    dataAtualizacao: user.dataAtualizacao,
                    ultimoLogin: user.ultimoLogin,
                    token: user.token
                  });
                } else {
                  response.status(401).json({ mensagem: 'Sessão Inválida.'});
                }
                
              } else {
                response.status(401).json({ mensagem: 'Não autorizado.'});
              }

            }
          });
        }
      });
    }
    
  }
}

module.exports = LoginController;