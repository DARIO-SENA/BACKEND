import logger from '../config/logger.js';

function getMethods(route) {
  return Object.keys(route.methods)
    .filter(m => m !== '_all')
    .map(m => m.toUpperCase())
    .join(',');
}

function extractModule(prefix) {
  const m = prefix.match(/\/api\/([^/]+)/);
  return m ? m[1].toUpperCase() : 'GENERAL';
}

function collectRoutes(stack, prefix, groups) {
  if (!stack) return;
  for (const layer of stack) {
    if (layer.route) {
      const methods = getMethods(layer.route);
      const path = prefix + layer.route.path;
      const mod = extractModule(prefix);
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push({ methods, path });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const routerPrefix = prefix;
      collectRoutes(layer.handle.stack, routerPrefix, groups);
    } else if (layer.name === 'bound dispatch' && layer.route) {
      const methods = getMethods(layer.route);
      const path = prefix + layer.route.path;
      const mod = extractModule(prefix);
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push({ methods, path });
    }
  }
}

export const imprimirRutas = (app) => {
  const groups = {};
  const stack = app._router ? app._router.stack : app?.router?.stack;
  if (!stack) {
    logger.info('  No se pudo obtener el stack de rutas');
    return;
  }
  collectRoutes(stack, '', groups);
  for (const [mod, endpoints] of Object.entries(groups)) {
    logger.info(`  ── ${mod} ──`);
    for (const ep of endpoints) {
      logger.info(`  ${ep.methods.padEnd(7)} ${ep.path}`);
    }
  }
  logger.info(`${Object.values(groups).flat().length} endpoints totales`);
};
