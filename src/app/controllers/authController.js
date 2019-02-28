const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth");
const User = require("../models/user");

const router = express.Router();

//Definimos uma função que vai gerar um token com valiadde de 1 dia
function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secretKey, {
    //Define o tempo de expiração do token em segundos, neste caso, 1 dia
    expiresIn: 86400
  });
}

// Rota de registro do usuário
router.post("/createUser", async (req, res) => {
  //Recebo apenas o email enviado pelo usuario na requisição
  const { email } = req.body;

  try {
    //Verifica se o email cadastrado ja existe no sistema
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    //Criando um usuario com todos os parametros presentes no body da aplicação
    const user = await User.create(req.body);

    //Ocultando a senha no retorno da api
    user.password = undefined;

    //Retorno da api com um token gerado baseado apenas na id do usuario
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

//Rota de autenticação do usuário
router.post("/authenticate", async (req, res) => {
  //Cecebo o email e senha enviados pelo usuario na requisição
  const { email, password } = req.body;

  //Como o password em /models/User.js está com select false para nao aparecer em requisições publicas,
  // adicionamos a função .select() passando o password como parametro para ser retornado pela API
  const user = await User.findOne({ email }).select("+password");

  //Verifica se o email está correto
  if (!user) return res.status(400).send({ error: "User not found" });

  //Verifica a compatibilidade das senhas
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: "Invalid password" });

  //Ocultando a senha no retorno da api
  user.password = undefined;

  //Retornando user com token gerado apenas baseado na id do usuario
  res.send({ user, token: generateToken({ id: user.id }) });
});

//Rota de 'esqueci minha senha'
router.post("/forgot_password", async (req, res) => {
  //Recebe o email do usuário
  const { email } = req.body;

  try {
    //procura o usuario pelo email
    const user = await User.findOne({ email });

    //Se nao encontrou o email retorna erro
    if (!user) return res.status(400).send({ error: "User not found" });

    const name = user.name;
    //Cria um token para identificar o usuario que quer recuperar a senha
    const token = crypto.randomBytes(20).toString("hex");

    //Cria um tempo de expiração pro token nesse caso de 1h
    const now = new Date();
    now.setHours(now.getHours() + 1);

    //Procura o usuario no banco e atualiza o token de verificação para recuperação de senha e sua hora de expiração
    await User.findOneAndUpdate(
      user.id,
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now
        }
      },
      {
        //Apenas para tirar o DeprecationWarning que aparecia
        useFindAndModify: false
      }
    );

      //Envia um email para o usuario com um link para recuperar a senha, passando os seguintes parametros contidos no context
      // para o html presente em resources/mail/auth/forgot_password.html
    mailer.sendMail(
      {
        to: email,
        from: "savio@lage.com",
        template: "auth/forgot_password",
        context: { name, token  }
            },
      err => {
        if (err)
          return res
            .status(400)
            .send({ error: "Cannot send forgot password email" });

        return res.send();
      }
    );
  } catch (err) {
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

//Rota de resetar a senha
router.post("/reset_password", async (req, res) => {
  //Recebe os parametros enviados pelo usuario
  const { email, token, password } = req.body;

  try {
    //procura o usuario pelo email e retorna junto as variaveis passwordResetToken e passwordResetExpires que estão com select: false
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    //Se nao encontrou o email retorna erro
    if (!user) return res.status(400).send({ error: "User not found" });

    //Se tem erro no token retorna erro
    if (token !== user.passwordResetToken)
      return res.status(400).send({ error: "Token invalid" });

    const now = new Date();
    //Se o token expirou, retorna erro
    if (now > user.passwordResetExpires)
      return res
        .status(400)
        .send({ error: "Token expired, generate a new one" });

    //Se deu tudo certo, reseta a senha
    user.password = password;

    await user.save();
    res.send();
  } catch (err) {
    res.status(400).send({ error: "Cannot reset password, try again later" });
  }
});



//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/auth'
module.exports = app => app.use("/auth", router);
