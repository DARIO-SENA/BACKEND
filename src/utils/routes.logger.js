function getMethods(layer) {
  if (!layer.route || !layer.route.methods) return '';
  return Object.keys(layer.route.methods)
    .filter(m => m !== '_all')
    .map(m => m.toUpperCase())
    .join(',');
}

function printStack(stack, prefix, seen) {
  for (const layer of stack) {
    if (layer.route) {
      const methods = getMethods(layer);
      const path = prefix + layer.route.path;
      if (!seen.has(path)) {
        seen.add(path);
        console.log(`${methods.padEnd(7)} ${path}`);
      }
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const routerPrefix = layer.handle.prefix || '';
      printStack(layer.handle.stack, routerPrefix, seen);
    }
  }
}

export const imprimirRutas = (app) => {
  console.log('\n🚀 ENDPOINTS ACTIVOS:\n');
  const seen = new Set();
  const router = app._router;
  if (router && router.stack) {
    printStack(router.stack, '', seen);
  } else {
    console.log('  (No se pudieron listar las rutas)');
  }
  console.log('----------------------------------\n');
};
