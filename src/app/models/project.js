const mongoose = require("../../database");

const bcrypt = require("bcryptjs");

//O ProjectSchema contem os campos do nosso banco na table Usuario
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Apos definir o model Project, declara como um Schema do Mongo
const Project = mongoose.model("Project", ProjectSchema);

//Exporta o Project
module.exports = Project;
