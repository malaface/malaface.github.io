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
  'saldo bancario',
  'bank balance',
  'clabe',
  'número de cuenta',
  'numero de cuenta',
  'números de cuenta',
  'numeros de cuenta',
  'account number',
  'account numbers',
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

  if (ipAddress.test(source)) {
    violations.push(`${filePath}: contiene una dirección IP`);
  }

  return violations;
}
