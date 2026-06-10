import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from './categorias_habitos.controller.js';

const router = Router();
router.use(verificarToken);

router.get('/',             listarCategorias);
router.post('/',            crearCategoria);
router.put('/:id',          actualizarCategoria);
router.delete('/:id',       eliminarCategoria);

export { router as categoriasHabitosRouter };
