const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 letras"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  birthDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Data de nascimento inválida"
  })
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres")
});




module.exports = { registerSchema, loginSchema, resetPasswordSchema };
