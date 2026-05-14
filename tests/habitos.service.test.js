import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/config/db.js', () => ({
  default: { query: vi.fn() },
}));

vi.mock('../src/eventBus/index.js', () => ({
  default: { emit: vi.fn() },
}));

const mockQuery = (await import('../src/config/db.js')).default.query;

const { crearHabito, listarHabitos, eliminarHabito } = await import('../src/modules/habitos/habitos.service.js');

describe('habitos.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('crearHabito', () => {
    it('debe crear un hábito con datos válidos', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, titulo: 'Leer', descripcion: 'Leer 30 min', frecuencia: 'diario' }],
      });

      const result = await crearHabito(1, { titulo: 'Leer', descripcion: 'Leer 30 min', frecuencia: 'diario' });
      expect(result.id).toBe(1);
      expect(result.titulo).toBe('Leer');
    });

    it('debe rechazar título vacío', async () => {
      await expect(crearHabito(1, { titulo: '', descripcion: '', frecuencia: 'diario' }))
        .rejects.toMatchObject({ status: 400 });
    });
  });

  describe('listarHabitos', () => {
    it('debe retornar lista de hábitos', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, titulo: 'Leer' }, { id: 2, titulo: 'Correr' }],
      });

      const result = await listarHabitos(1);
      expect(result).toHaveLength(2);
      expect(result[0].titulo).toBe('Leer');
    });
  });

  describe('eliminarHabito', () => {
    it('debe retornar true si eliminó', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const result = await eliminarHabito(1, 1);
      expect(result).toBe(true);
    });

    it('debe retornar false si no encontró', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const result = await eliminarHabito(999, 1);
      expect(result).toBe(false);
    });
  });
});
