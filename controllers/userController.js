const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, birthDate: true }
  });
  res.json(user);
};

exports.getStats = async (req, res) => {
  const total = await prisma.task.count({ where: { userId: req.userId } });
  const done = await prisma.task.count({ where: { userId: req.userId, done: true } });
  const pending = total - done;
  res.json({ total, done, pending });
};
