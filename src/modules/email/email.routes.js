import { Router } from 'express';
import { verificarToken } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db.js';
import { enviarResumenesPendientes } from '../../services/email.service.js';

const router = Router();
router.use(verificarToken);

router.get('/preferencias-email', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT email_semanal_activo FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    res.json({ ok: true, data: { activo: rows[0]?.email_semanal_activo || false } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/preferencias-email', async (req, res) => {
  try {
    const { activo } = req.body;
    await pool.query(
      'UPDATE usuarios SET email_semanal_activo = $1 WHERE id = $2',
      [!!activo, req.usuario.id]
    );
    res.json({ ok: true, data: { activo: !!activo } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/enviar-resumen-semanal', async (req, res) => {
  try {
    await enviarResumenesPendientes();
    res.json({ ok: true, data: { mensaje: 'Resúmenes enviados' } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export { router as emailRouter };
