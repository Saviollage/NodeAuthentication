const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();
router.use(authMiddleware);

//Define a rota de listagem
router.get("/", async (req, res) => {
  try {
    //Retorna todos os projetos para nossa variavel projects e ainda adiciona a essa requisição a tabela user
    const projects = await Project.find().populate(["user", "tasks"]);

    //retorna a lista de projetos
    return res.send({ projects });
  } catch (err) {
    return res.status(400).send({ error: "Error listing projects " });
  }
});

//Define a rota de listagem  individual de projeto
router.get("/:projectId", async (req, res) => {
  try {
    //Retorna o projeto cuja id foi requisitad para nossa variavel projects e ainda adiciona a essa requisição a tabela user
    const project = await Project.findById(req.params.projectId).populate(
      "user"
    );

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error listing project" });
  }
});

//Define a rota de criar projeto
router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    //Cria um projeto com o conteudo do body passado pelo usuario e do id fornecido pelo token de autenticação
    const project = await Project.create({
      title,
      description,
      user: req.userId
    });

    //Espera todas as promises serem realizadas para prosseguir o codigo
    await Promise.all(
      tasks.map(async task => {
        //Instancia cada task
        const projectTask = new Task({ ...task, project: project._id });
        //Salva a task
        await projectTask.save();
        //adiciona a task dentro do respectivo projeto
        project.tasks.push(projectTask);
      })
    );
    //Salva o projeto
    await project.save();

    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Error creating new project" });
  }
});

//Define a rota de atualizar  projeto
router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    //Cria um projeto com o conteudo do body passado pelo usuario e do id fornecido pelo token de autenticação
    const project = await Project.findOneAndUpdate(
      req.params.projectId,
      {
        title,
        description
      },
      {
        //Apenas para tirar o DeprecationWarning que aparecia
        useFindAndModify: false,
        new: true
      }
    );

    //Limpa as tasks do projeto editado
    project.tasks = [];
    await Task.remove({ project: project._id });

    //Espera todas as promises serem realizadas para prosseguir o codigo
    await Promise.all(
      tasks.map(async task => {
        //Instancia cada task
        const projectTask = new Task({ ...task, project: project._id });
        //Salva a task
        await projectTask.save();
        //adiciona a task dentro do respectivo projeto
        project.tasks.push(projectTask);
      })
    );
    //Salva o projeto
    await project.save();

    return res.send({ project });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ error: "Error updating project" });
  }
});

//Define a rota de deletar  projeto
router.delete("/:projectId", async (req, res) => {
  try {
    //Retorna o projeto cuja id foi requisitad para nossa variavel projects e ainda adiciona a essa requisição a tabela user
    const projects = await Project.findOneAndRemove(
      req.params.projectId,

      {
        //Apenas para tirar o DeprecationWarning que aparecia
        useFindAndModify: false
      }
    );

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: "Error deleting project" });
  }
});

//Utiliza o app que mandamos pro controller no index.js, aqui estamos repassando o router para o app com o prefixo '/projects'
module.exports = app => app.use("/projects", router);
