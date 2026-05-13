exports.up = (pgm) => {
  pgm.createTable('finanzas_categorias', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(100)', notNull: true },
    tipo: { type: 'varchar(10)', notNull: true, check: "tipo IN ('ingreso','gasto')" },
    icono: { type: 'varchar(50)' },
    color: { type: 'varchar(7)' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_categorias', 'usuario_id');

  pgm.createTable('finanzas_cuentas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(100)', notNull: true },
    tipo: { type: 'varchar(20)', notNull: true, check: "tipo IN ('efectivo','banco','tarjeta_credito','ahorro')" },
    saldo_inicial: { type: 'numeric(12,2)', default: 0 },
    moneda: { type: 'varchar(3)', default: 'BOB' },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_cuentas', 'usuario_id');

  pgm.createTable('finanzas_transacciones', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    categoria_id: { type: 'int', references: 'finanzas_categorias(id)', onDelete: 'set null' },
    cuenta_id: { type: 'int', references: 'finanzas_cuentas(id)', onDelete: 'set null' },
    tipo: { type: 'varchar(15)', notNull: true, check: "tipo IN ('ingreso','gasto','transferencia')" },
    monto: { type: 'numeric(12,2)', notNull: true },
    descripcion: 'text',
    fecha: { type: 'date', notNull: true },
    es_recurrente: { type: 'boolean', default: false },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_transacciones', 'usuario_id');
  pgm.createIndex('finanzas_transacciones', 'categoria_id');
  pgm.createIndex('finanzas_transacciones', 'cuenta_id');
  pgm.createIndex('finanzas_transacciones', 'fecha');

  pgm.createTable('finanzas_presupuestos', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    categoria_id: { type: 'int', notNull: true, references: 'finanzas_categorias(id)', onDelete: 'cascade' },
    mes: { type: 'int', notNull: true, check: 'mes BETWEEN 1 AND 12' },
    anio: { type: 'int', notNull: true },
    limite: { type: 'numeric(12,2)', notNull: true },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_presupuestos', 'usuario_id');
  pgm.addConstraint('finanzas_presupuestos', 'finanzas_presupuestos_unique', {
    unique: ['usuario_id', 'categoria_id', 'mes', 'anio'],
  });

  pgm.createTable('finanzas_metas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(150)', notNull: true },
    monto_objetivo: { type: 'numeric(12,2)', notNull: true },
    monto_actual: { type: 'numeric(12,2)', default: 0 },
    fecha_limite: 'date',
    estado: { type: 'varchar(20)', default: 'en_progreso', check: "estado IN ('en_progreso','completada','fallida')" },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_metas', 'usuario_id');

  pgm.createTable('finanzas_deudas', {
    id: 'id',
    usuario_id: { type: 'int', notNull: true, references: 'usuarios(id)', onDelete: 'cascade' },
    nombre: { type: 'varchar(150)', notNull: true },
    monto_total: { type: 'numeric(12,2)', notNull: true },
    monto_pagado: { type: 'numeric(12,2)', default: 0 },
    cuota_mensual: { type: 'numeric(12,2)', default: 0 },
    tasa_interes: { type: 'numeric(5,2)', default: 0 },
    fecha_inicio: 'date',
    fecha_vencimiento: 'date',
    acreedor: { type: 'varchar(150)' },
    estado: { type: 'varchar(20)', default: 'pendiente', check: "estado IN ('pendiente','pagando','completada')" },
    creado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
    actualizado_en: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('finanzas_deudas', 'usuario_id');
};

exports.down = (pgm) => {
  pgm.dropTable('finanzas_deudas');
  pgm.dropTable('finanzas_metas');
  pgm.dropTable('finanzas_presupuestos');
  pgm.dropTable('finanzas_transacciones');
  pgm.dropTable('finanzas_cuentas');
  pgm.dropTable('finanzas_categorias');
};
