const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

//importa as variaveis host, port, user, pass do arquivo mail.json
const { host, port, user, pass } = require("../config/mail.json");

//Transporter do serviço de emai
const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

//Procura a pagina em html dentro de ./src/resources/mail/ para enviar pro email do usuario que quer recuperar a senha
transport.use(
  "compile",
  hbs({
    viewEngine: "handlebars",
    viewPath: path.resolve("./src/resources/mail/"),
    extName: ".html"
  })
);

module.exports = transport;
