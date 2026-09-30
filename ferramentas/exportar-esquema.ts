// npm run esquema → docs/caso.schema.json (o formato que a skill gerar-caso entrega ao agente).
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { Caso } from '../src/casos/esquema';

const destino = resolve(import.meta.dirname, '../docs/caso.schema.json');
const esquema = z.toJSONSchema(Caso, { io: 'input', target: 'draft-2020-12' });
writeFileSync(destino, JSON.stringify({ title: 'Caso do GAROA', ...esquema }, null, 2) + '\n');
console.log(`JSON Schema salvo em ${destino}`);
