import pool from '../../config/db.js';

// ─────────────────────────────────────────
// AMISTADES
// ─────────────────────────────────────────

export const enviarSolicitud = async (solicitanteId, receptorId) => {
  if (solicitanteId === receptorId) {
    throw new Error('No puedes enviarte una solicitud a ti mismo');
  }
  const { rows } = await pool.query(
    `INSERT INTO amistades (solicitante_id, receptor_id)
     VALUES ($1, $2) RETURNING *`,
    [solicitanteId, receptorId]
  );
  return rows[0];
};

export const responderSolicitud = async (amistad_id, receptorId, estado) => {
  const { rows } = await pool.query(
    `UPDATE amistades SET estado = $1
     WHERE id = $2 AND receptor_id = $3
     RETURNING *`,
    [estado, amistad_id, receptorId]
  );
  return rows[0] || null;
};

export const listarAmigos = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, u.email, a.creado_en
     FROM amistades a
     JOIN usuarios u ON (
       CASE WHEN a.solicitante_id = $1 THEN a.receptor_id
            ELSE a.solicitante_id END = u.id
     )
     WHERE (a.solicitante_id = $1 OR a.receptor_id = $1)
       AND a.estado = 'aceptada'`,
    [usuarioId]
  );
  return rows;
};

export const listarSolicitudesPendientes = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.creado_en, u.id AS usuario_id, u.nombre, u.email
     FROM amistades a
     JOIN usuarios u ON a.solicitante_id = u.id
     WHERE a.receptor_id = $1 AND a.estado = 'pendiente'`,
    [usuarioId]
  );
  return rows;
};

export const eliminarAmigo = async (usuarioId, amigoId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM amistades
     WHERE (solicitante_id = $1 AND receptor_id = $2)
        OR (solicitante_id = $2 AND receptor_id = $1)`,
    [usuarioId, amigoId]
  );
  return rowCount > 0;
};

// ─────────────────────────────────────────
// PROYECTOS
// ─────────────────────────────────────────

export const crearProyecto = async (usuarioId, data) => {
  const { nombre, descripcion } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO proyectos (nombre, descripcion, creador_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, descripcion, usuarioId]
    );
    const proyecto = rows[0];
    await client.query(
      `INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol)
       VALUES ($1, $2, 'admin')`,
      [proyecto.id, usuarioId]
    );
    await client.query('COMMIT');
    return proyecto;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const listarProyectos = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT p.*, pm.rol,
       COUNT(pm2.usuario_id) AS total_miembros
     FROM proyectos p
     JOIN proyecto_miembros pm ON pm.proyecto_id = p.id AND pm.usuario_id = $1
     JOIN proyecto_miembros pm2 ON pm2.proyecto_id = p.id
     GROUP BY p.id, pm.rol
     ORDER BY p.creado_en DESC`,
    [usuarioId]
  );
  return rows;
};

export const obtenerProyecto = async (proyectoId, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT p.*, pm.rol
     FROM proyectos p
     JOIN proyecto_miembros pm ON pm.proyecto_id = p.id
     WHERE p.id = $1 AND pm.usuario_id = $2`,
    [proyectoId, usuarioId]
  );
  return rows[0] || null;
};

export const agregarMiembro = async (proyectoId, usuarioId, nuevoUsuarioId, rol = 'miembro') => {
  // Verificar que quien agrega es admin
  const { rows: adminCheck } = await pool.query(
    `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
    [proyectoId, usuarioId]
  );
  if (!adminCheck[0] || adminCheck[0].rol !== 'admin') {
    throw new Error('Solo los administradores pueden agregar miembros');
  }
  const { rows } = await pool.query(
    `INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol)
     VALUES ($1, $2, $3) RETURNING *`,
    [proyectoId, nuevoUsuarioId, rol]
  );
  return rows[0];
};

export const eliminarMiembro = async (proyectoId, usuarioId, miembroId) => {
  const { rows: adminCheck } = await pool.query(
    `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
    [proyectoId, usuarioId]
  );
  if (!adminCheck[0] || adminCheck[0].rol !== 'admin') {
    throw new Error('Solo los administradores pueden eliminar miembros');
  }
  const { rowCount } = await pool.query(
    `DELETE FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
    [proyectoId, miembroId]
  );
  return rowCount > 0;
};

// ─────────────────────────────────────────
// TAREAS COMPARTIDAS
// ─────────────────────────────────────────

export const crearTareaCompartida = async (usuarioId, proyectoId, data) => {
  const { titulo, descripcion, asignado_a, prioridad, fecha_limite } = data;
  const { rows } = await pool.query(
    `INSERT INTO tareas_compartidas
       (proyecto_id, creado_por, asignado_a, titulo, descripcion, prioridad, fecha_limite)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [proyectoId, usuarioId, asignado_a || null, titulo, descripcion, prioridad || 'media', fecha_limite || null]
  );
  return rows[0];
};

export const listarTareasCompartidas = async (proyectoId, usuarioId) => {
  const { rows } = await pool.query(
    `SELECT tc.*, 
       u1.nombre AS creado_por_nombre,
       u2.nombre AS asignado_a_nombre
     FROM tareas_compartidas tc
     JOIN proyecto_miembros pm ON pm.proyecto_id = tc.proyecto_id AND pm.usuario_id = $2
     LEFT JOIN usuarios u1 ON u1.id = tc.creado_por
     LEFT JOIN usuarios u2 ON u2.id = tc.asignado_a
     WHERE tc.proyecto_id = $1
     ORDER BY tc.creado_en DESC`,
    [proyectoId, usuarioId]
  );
  return rows;
};

export const actualizarTareaCompartida = async (tareaId, usuarioId, data) => {
  const allowed = ['titulo', 'descripcion', 'estado', 'prioridad', 'fecha_limite', 'asignado_a'];
  const fields = [];
  const params = [];
  let i = 1;

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${i}`);
      params.push(data[key]);
      i++;
    }
  }

  if (fields.length === 0) throw new Error('No hay campos para actualizar');

  params.push(tareaId);
  const { rows } = await pool.query(
    `UPDATE tareas_compartidas SET ${fields.join(', ')}
     WHERE id = $${i} RETURNING *`,
    params
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────
// COMENTARIOS
// ─────────────────────────────────────────

export const agregarComentario = async (tareaId, usuarioId, contenido) => {
  const { rows } = await pool.query(
    `INSERT INTO comentarios (tarea_id, usuario_id, contenido)
     VALUES ($1, $2, $3) RETURNING *`,
    [tareaId, usuarioId, contenido]
  );
  return rows[0];
};

export const listarComentarios = async (tareaId) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.nombre AS autor
     FROM comentarios c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.tarea_id = $1
     ORDER BY c.creado_en ASC`,
    [tareaId]
  );
  return rows;
};

export const eliminarComentario = async (comentarioId, usuarioId) => {
  const { rowCount } = await pool.query(
    `DELETE FROM comentarios WHERE id = $1 AND usuario_id = $2`,
    [comentarioId, usuarioId]
  );
  return rowCount > 0;
};