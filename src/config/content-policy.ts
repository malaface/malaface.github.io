const blockedTerms = [
  'noc',
  'data center',
  'datacenter',
  'infraestructura',
  'servidor',
  'runbook',
  'incidente',
  'credencial',
  'contraseña',
  'ip interna',
  'finanzas',
  'diario',
  'sensitive',
  'archives'
];

const ipAddress = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

export function assertPublicContent(source: string, filePath: string): string[] {
  const lower = source.toLowerCase();
  const violations = blockedTerms
    .filter((term) => lower.includes(term))
    .map((term) => `${filePath}: contiene término bloqueado "${term}"`);

  if (ipAddress.test(source)) {
    violations.push(`${filePath}: contiene una dirección IP`);
  }

  return violations;
}
