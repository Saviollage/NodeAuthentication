const mongoose = require("../../database");

const bcrypt = require("bcryptjs");

//O TaskSchema contem os campos do nosso banco na table Usuario
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  completed: {
    type: Boolean,
    required: true,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Apos definir o model Task, declara como um Schema do Mongo
const Task = mongoose.model("Task", TaskSchema);

//Exporta o Task
module.exports = Task;
