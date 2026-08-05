export const blockedTerms = [
  'noc',
  'data center',
  'datacenter',
  'centro de datos',
  'infraestructura',
  'infrastructure',
  'servidor',
  'servidores',
  'server',
  'servers',
  'runbook',
  'runbooks',
  'incidente',
  'incidentes',
  'incident',
  'incidents',
  'credencial',
  'credenciales',
  'credential',
  'credentials',
  'contraseña',
  'contraseñas',
  'password',
  'passwords',
  'ip interna',
  'ips internas',
  'internal ip',
  'internal ips',
  'finanzas personales',
  'personal finances',
  'datos financieros personales',
  'personal financial data',
  'private financial data',
  'registros financieros sensibles',
  'sensitive financial records',
  'diario',
  'sensitive',
  'sensible',
  'archives',
  'archivos'
];

const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const wordCharacter = '\\p{L}\\p{M}\\p{N}_';
const sensitiveFinancialPatterns = [
  {
    label: 'saldo bancario',
    pattern: /(?:^|[^\p{L}\p{M}\p{N}_])saldo bancario\s*:\s*(?:(?:MXN|USD|EUR|[$€£])\s*)?\d[\d.,]*/iu
  },
  {
    label: 'bank balance',
    pattern: /(?:^|[^\p{L}\p{M}\p{N}_])bank balance\s*:\s*(?:(?:MXN|USD|EUR|[$€£])\s*)?\d[\d.,]*/iu
  },
  {
    label: 'clabe',
    pattern: /(?:^|[^\p{L}\p{M}\p{N}_])clabe\s*:\s*\d{18}(?=$|[^\p{L}\p{M}\p{N}_])/iu
  },
  {
    label: 'número de cuenta',
    pattern: /(?:^|[^\p{L}\p{M}\p{N}_])n[uú]meros? de cuenta\s*:\s*\d{6,20}(?=$|[^\p{L}\p{M}\p{N}_])/iu
  },
  {
    label: 'account number',
    pattern: /(?:^|[^\p{L}\p{M}\p{N}_])account numbers?\s*:\s*\d{6,20}(?=$|[^\p{L}\p{M}\p{N}_])/iu
  }
];

function escapeRegExp(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsBlockedTerm(source, term) {
  const pattern = new RegExp(
    `(?:^|[^${wordCharacter}])${escapeRegExp(term)}(?=$|[^${wordCharacter}])`,
    'iu'
  );

  return pattern.test(source);
}

export function assertPublicContent(source, filePath) {
  const violations = blockedTerms
    .filter((term) => containsBlockedTerm(source, term))
    .map((term) => `${filePath}: contiene término bloqueado "${term}"`);

  for (const { label, pattern } of sensitiveFinancialPatterns) {
    if (pattern.test(source)) {
      violations.push(`${filePath}: contiene dato financiero bloqueado "${label}"`);
    }
  }

  if (ipAddress.test(source)) {
    violations.push(`${filePath}: contiene una dirección IP`);
  }

  return violations;
}
