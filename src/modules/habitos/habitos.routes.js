import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import {
  crearHabito,
  listarHabitos,
  actualizarHabito,
  eliminarHabito,
  eliminarTodos,
  cambiarEstado,
} from './habitos.controller.js';


const router = Router();

router.use(verificarToken);

router.post('/',          crearHabito);
router.get('/',           listarHabitos);
router.put('/:id',        actualizarHabito);
router.patch('/:id/estado', cambiarEstado);
router.delete('/',        eliminarTodos);
router.delete('/:id',     eliminarHabito);

export { router as habitosRouter };