export const blockedTerms = [
  'noc',
  'data center',
  'datacenter',
  'centro de datos',
  'infraestructura',
  'infrastructure',
  'servidor',
  'server',
  'runbook',
  'incidente',
  'incident',
  'credencial',
  'credential',
  'credentials',
  'contraseña',
  'password',
  'ip interna',
  'internal ip',
  'finanzas',
  'financial',
  'diario',
  'sensitive',
  'sensible',
  'archives',
  'archivos'
];

const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

export function assertPublicContent(source, filePath) {
  const lower = source.toLowerCase();
  const violations = blockedTerms
    .filter((term) => lower.includes(term))
    .map((term) => `${filePath}: contiene término bloqueado "${term}"`);

  if (ipAddress.test(source)) {
    violations.push(`${filePath}: contiene una dirección IP`);
  }

  return violations;
}
