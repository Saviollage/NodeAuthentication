const mongoose = require("mongoose");

//Conectando o mongo ao nosso banco cujo nome é 'noderest', usando o mongoClient para conectar ao mongo
mongoose.connect("mongodb://localhost/noderest", {
  useNewUrlParser: true,
  useCreateIndex: true
});
mongoose.Promise = global.Promise;

module.exports = mongoose;
