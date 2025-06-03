const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { userId: req.userId } });
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  const { title, category, date } = req.body;
  const task = await prisma.task.create({
    data: { title, category, date: new Date(date), userId: req.userId }
  });
  res.status(201).json(task);
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, category, date, done } = req.body;
  const task = await prisma.task.update({
    where: { id: Number(id), userId: req.userId },
    data: { title, category, date: new Date(date), done }
  });
  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  await prisma.task.delete({ where: { id: Number(id), userId: req.userId } });
  res.status(204).send();
};

exports.toggleTaskCompletion = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const task = await prisma.task.updateMany({
      where: {
        id: Number(id),
        userId: req.userId
      },
      data: {
       done: Boolean(completed)
      }
    });

    if (task.count === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário." });
    }

    res.status(200).json({ message: `Tarefa marcada como ${completed ? 'concluída' : 'pendente'}.` });
  } catch (error) {
    console.error("Erro ao marcar tarefa:", error);
    res.status(500).json({ message: "Erro ao atualizar tarefa." });
  }
};

