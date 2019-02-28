const express = require("express");
const bodyParser = require("body-parser");

//Criando a aplicação
const app = express();

//Fazendo o app aceitar parametros json
app.use(bodyParser.json());
//Fazendo o app aceitar os parametros pela URL
app.use(bodyParser.urlencoded({ extended: false }));

//repassa o app ao controller (de forma a mante-lo unico no sistema), para importar os modulos presentes na pasta controller
require("./app/controllers/index")(app);


//Rodar o app em uma porta (nesse caso, 3000)
app.listen(3000);
