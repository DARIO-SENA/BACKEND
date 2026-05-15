import pool from '../../config/db.js';

// ─────────────────────────────────────────
// AMISTADES
// ─────────────────────────────────────────

export const enviarSolicitud = async (solicitanteId, receptorId) => {
  if (solicitanteId === receptorId) {
    throw new Error('No puedes enviarte una solicitud a ti mismo');
  }
  const existente = await pool.query(
    `SELECT estado FROM amistades
     WHERE (solicitante_id = $1 AND receptor_id = $2)
        OR (solicitante_id = $2 AND receptor_id = $1)`,
    [solicitanteId, receptorId]
  );
  if (existente.rows.length > 0) {
    throw new Error('Ya existe una solicitud o amistad entre estos usuarios');
  }
  const { rows } = await pool.query(
    `INSERT INTO amistades (solicitante_id, receptor_id)
     VALUES ($1, $2) RETURNING *`,
    [solicitanteId, receptorId]
  );
  return rows[0];
};

export const responderSolicitud = async (amistad_id, receptorId, estado) => {
  const validos = ['aceptada', 'rechazada'];
  if (!validos.includes(estado)) {
    throw new Error('Estado inválido. Use: aceptada o rechazada');
  }
  const { rows } = await pool.query(
    `UPDATE amistades SET estado = $1
     WHERE id = $2 AND receptor_id = $3 AND estado = 'pendiente'
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

export const listarProyectos = async (usuarioId, limite = 50, pagina = 1) => {
  const offset = (pagina - 1) * limite;
  const { rows } = await pool.query(
    `SELECT p.*, pm.rol,
       COUNT(pm2.usuario_id) AS total_miembros
     FROM proyectos p
     JOIN proyecto_miembros pm ON pm.proyecto_id = p.id AND pm.usuario_id = $1
     JOIN proyecto_miembros pm2 ON pm2.proyecto_id = p.id
     GROUP BY p.id, pm.rol
     ORDER BY p.creado_en DESC
     LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(DISTINCT p.id) FROM proyectos p
     JOIN proyecto_miembros pm ON pm.proyecto_id = p.id
     WHERE pm.usuario_id = $1`,
    [usuarioId]
  );
  return { data: rows, total: parseInt(count) };
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

export const actualizarProyecto = async (proyectoId, usuarioId, datos) => {
  const { rows: miembro } = await pool.query(
    `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
    [proyectoId, usuarioId]
  );
  if (!miembro[0] || miembro[0].rol !== 'admin') {
    throw new Error('Solo los administradores pueden actualizar el proyecto');
  }
  const campos = [];
  const valores = [];
  let i = 1;
  if (datos.nombre !== undefined) { campos.push(`nombre = $${i++}`); valores.push(datos.nombre); }
  if (datos.descripcion !== undefined) { campos.push(`descripcion = $${i++}`); valores.push(datos.descripcion); }
  if (campos.length === 0) throw new Error('No hay campos para actualizar');
  valores.push(proyectoId);
  const { rows } = await pool.query(
    `UPDATE proyectos SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
    valores
  );
  return rows[0] || null;
};

export const eliminarProyecto = async (proyectoId, usuarioId) => {
  const { rows: miembro } = await pool.query(
    `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
    [proyectoId, usuarioId]
  );
  if (!miembro[0] || miembro[0].rol !== 'admin') {
    throw new Error('Solo los administradores pueden eliminar el proyecto');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM proyecto_miembros WHERE proyecto_id = $1', [proyectoId]);
    const { rowCount } = await client.query('DELETE FROM proyectos WHERE id = $1', [proyectoId]);
    await client.query('COMMIT');
    return rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const agregarMiembro = async (proyectoId, usuarioId, nuevoUsuarioId, rol = 'miembro') => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: adminCheck } = await client.query(
      `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
      [proyectoId, usuarioId]
    );
    if (!adminCheck[0] || adminCheck[0].rol !== 'admin') {
      await client.query('ROLLBACK');
      throw new Error('Solo los administradores pueden agregar miembros');
    }
    const { rows } = await client.query(
      `INSERT INTO proyecto_miembros (proyecto_id, usuario_id, rol)
       VALUES ($1, $2, $3) RETURNING *`,
      [proyectoId, nuevoUsuarioId, rol]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const eliminarMiembro = async (proyectoId, usuarioId, miembroId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: adminCheck } = await client.query(
      `SELECT rol FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
      [proyectoId, usuarioId]
    );
    if (!adminCheck[0] || adminCheck[0].rol !== 'admin') {
      await client.query('ROLLBACK');
      throw new Error('Solo los administradores pueden eliminar miembros');
    }
    const { rowCount } = await client.query(
      `DELETE FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2`,
      [proyectoId, miembroId]
    );
    await client.query('COMMIT');
    return rowCount > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────
// TAREAS COMPARTIDAS
// ─────────────────────────────────────────

export const crearTareaCompartida = async (usuarioId, proyectoId, data) => {
  const { titulo, descripcion, asignado_a, prioridad, fecha_limite } = data;
  const { rows: miembro } = await pool.query(
    'SELECT id FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2',
    [proyectoId, usuarioId]
  );
  if (!miembro[0]) throw new Error('No eres miembro de este proyecto');
  const { rows } = await pool.query(
    `INSERT INTO tareas_compartidas
       (proyecto_id, creado_por, asignado_a, titulo, descripcion, prioridad, fecha_limite)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [proyectoId, usuarioId, asignado_a || null, titulo, descripcion, prioridad || 'media', fecha_limite || null]
  );
  return rows[0];
};

export const listarTareasCompartidas = async (proyectoId, usuarioId) => {
  const { rows: miembro } = await pool.query(
    'SELECT id FROM proyecto_miembros WHERE proyecto_id = $1 AND usuario_id = $2',
    [proyectoId, usuarioId]
  );
  if (!miembro[0]) throw new Error('No eres miembro de este proyecto');
  const { rows } = await pool.query(
    `SELECT tc.*, 
       u1.nombre AS creado_por_nombre,
       u2.nombre AS asignado_a_nombre
     FROM tareas_compartidas tc
     LEFT JOIN usuarios u1 ON u1.id = tc.creado_por
     LEFT JOIN usuarios u2 ON u2.id = tc.asignado_a
     WHERE tc.proyecto_id = $1
     ORDER BY tc.creado_en DESC`,
    [proyectoId]
  );
  return rows;
};

export const actualizarTareaCompartida = async (tareaId, usuarioId, data) => {
  const { rows: miembro } = await pool.query(
    `SELECT pm.id FROM proyecto_miembros pm
     JOIN tareas_compartidas tc ON tc.proyecto_id = pm.proyecto_id
     WHERE tc.id = $1 AND pm.usuario_id = $2`,
    [tareaId, usuarioId]
  );
  if (!miembro[0]) throw new Error('No eres miembro del proyecto de esta tarea');

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
  if (!contenido || !contenido.trim()) throw new Error('El comentario no puede estar vacío');
  const { rows: miembro } = await pool.query(
    `SELECT pm.id FROM proyecto_miembros pm
     JOIN tareas_compartidas tc ON tc.proyecto_id = pm.proyecto_id
     WHERE tc.id = $1 AND pm.usuario_id = $2`,
    [tareaId, usuarioId]
  );
  if (!miembro[0]) throw new Error('No eres miembro del proyecto de esta tarea');
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