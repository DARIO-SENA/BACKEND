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
    } else if (layer.name === 'router' && layer.handle) {
      const routerPrefix = layer.handle.prefix || '';
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
  console.log('\n🚀 ENDPOINTS ACTIVOS:\n');
  const groups = {};
  collectRoutes(app.router?.stack, '', groups);
  for (const [mod, endpoints] of Object.entries(groups)) {
    console.log(`  ── ${mod} ──`);
    for (const ep of endpoints) {
      console.log(`  ${ep.methods.padEnd(7)} ${ep.path}`);
    }
    console.log();
  }
  console.log(`  ${Object.values(groups).flat().length} endpoints totales`);
  console.log('----------------------------------\n');
};
