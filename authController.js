const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendRecoveryEmail } = require('../utils/mailer');
const { registerSchema, loginSchema, resetPasswordSchema } = require('../validators/authSchemas');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const { name, email, password, birthDate } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        birthDate: new Date(birthDate),
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    if (error.name === 'ZodError') {
      const formatted = error.errors.map(e => e.message);
      return res.status(400).json({ errors: formatted });
    }
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        nome: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      const formatted = error.errors.map(e => e.message);
      return res.status(400).json({ errors: formatted });
    }
    console.error("Erro no login:", error);
    res.status(500).json({ error: 'Erro no login' });
  }
};

exports.recoverPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Armazena o token e a data de expiração no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hora
      },
    });

    const resetLink = `http://localhost:3000/redefinir-senha.html?token=${token}`;
    await sendRecoveryEmail(email, resetLink);

    res.json({ message: 'Email de recuperação enviado com sucesso' });
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const { token, newPassword } = data;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token ainda válido
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    if (error.name === 'ZodError') {
      const formatted = error.errors.map(e => e.message);
      return res.status(400).json({ errors: formatted });
    }
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
};
