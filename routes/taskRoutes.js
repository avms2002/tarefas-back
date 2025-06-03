const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middlewares/authMiddleware');

// Middleware de autenticação em todas as rotas
router.use(authenticate);

// Rotas de tarefas
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Novo endpoint: marcar tarefa como concluída ou não
router.patch('/:id/complete', taskController.toggleTaskCompletion);

module.exports = router;
