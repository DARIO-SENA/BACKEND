import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import * as socialCtrl from './social.controller.js';

const router = Router();

router.use(verificarToken);

// ── Amistades ────────────────────────────────
router.post('/amigos/solicitud',           socialCtrl.enviarSolicitud);
router.get('/amigos',                      socialCtrl.listarAmigos);
router.get('/amigos/solicitudes',          socialCtrl.listarSolicitudesPendientes);
router.patch('/amigos/solicitud/:id',      socialCtrl.responderSolicitud);
router.delete('/amigos/:amigoId',          socialCtrl.eliminarAmigo);

// ── Proyectos ────────────────────────────────
router.post('/proyectos',                  socialCtrl.crearProyecto);
router.get('/proyectos',                   socialCtrl.listarProyectos);
router.get('/proyectos/:id',               socialCtrl.obtenerProyecto);
router.put('/proyectos/:id',               socialCtrl.actualizarProyecto);
router.delete('/proyectos/:id',            socialCtrl.eliminarProyecto);
router.post('/proyectos/:id/miembros',     socialCtrl.agregarMiembro);
router.delete('/proyectos/:id/miembros/:usuarioId', socialCtrl.eliminarMiembro);

// ── Tareas compartidas ───────────────────────
router.post('/proyectos/:proyectoId/tareas',         socialCtrl.crearTareaCompartida);
router.get('/proyectos/:proyectoId/tareas',          socialCtrl.listarTareasCompartidas);
router.put('/proyectos/:proyectoId/tareas/:tareaId', socialCtrl.actualizarTareaCompartida);

// ── Comentarios ──────────────────────────────
router.post('/tareas/:tareaId/comentarios',          socialCtrl.agregarComentario);
router.get('/tareas/:tareaId/comentarios',           socialCtrl.listarComentarios);
router.delete('/tareas/:tareaId/comentarios/:comentarioId', socialCtrl.eliminarComentario);

export const socialRouter = router;