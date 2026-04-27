import fs from 'node:fs';
import path from 'node:path';

const [, , csvArg, municipalityArg = 'APARRI'] = process.argv;

if (!csvArg) {
  console.error(
    'Usage: node scripts/import-barangays.js <officials.csv> [municipality]'
  );
  process.exit(1);
}

const csvPath = path.resolve(csvArg);
const municipality = municipalityArg.trim().toUpperCase();
const outputDir = path.resolve('content/government/barangays');

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(content) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some(cell => cell.trim() !== '')) {
        rows.push(row);
      }
      field = '';
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some(cell => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatName(record) {
  const parts = [
    toTitleCase(record.FIRSTNAME),
    toTitleCase(record.MIDDLENAME),
    toTitleCase(record.LASTNAME),
    toTitleCase(record.SUFFIX),
  ].filter(Boolean);

  return parts.join(' ');
}

function normalizePhone(value) {
  const trimmed = value.trim();
  return trimmed || 'Not yet available';
}

function yamlQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sectionLines(title, values) {
  if (values.length === 0) {
    return [`## ${title}`, '', '- None listed in the latest import.', ''];
  }

  return [`## ${title}`, '', ...values.map(value => `- ${value}`), ''];
}

function buildMarkdown(barangayName, officials, phone, term) {
  const byPosition = position =>
    officials.filter(record => record.POSITION === position).map(formatName);

  const punongBarangay = byPosition('Punong Barangay');
  const sanggunian = byPosition('Sangguniang Barangay Member');
  const secretary = byPosition('Barangay Secretary');
  const treasurer = byPosition('Barangay Treasurer');
  const skChairperson = byPosition('SK Chairperson');
  const skMembers = byPosition('SK Member');
  const skSecretary = byPosition('SK Secretary');
  const skTreasurer = byPosition('SK Treasurer');

  const lines = [
    `# Barangay ${barangayName}`,
    '',
    '## Quick Facts',
    '',
    `- **Barangay:** ${barangayName}`,
    `- **Municipality:** ${process.env.VITE_GOVERNMENT_NAME || 'Aparri'}`,
    `- **Term Covered by Import:** ${term}`,
    `- **Barangay Telephone:** ${phone}`,
    '',
    ...sectionLines('Punong Barangay', punongBarangay),
    ...sectionLines('Sangguniang Barangay Members', sanggunian),
    ...sectionLines('Barangay Secretary', secretary),
    ...sectionLines('Barangay Treasurer', treasurer),
    ...sectionLines('SK Chairperson', skChairperson),
    ...sectionLines('SK Members', skMembers),
    ...sectionLines('SK Secretary', skSecretary),
    ...sectionLines('SK Treasurer', skTreasurer),
    '## Notes',
    '',
    '- Data Source: Barangay Officials Directory, DILG (as of 20260427-1410)',
    '',
  ];

  return lines.join('\n');
}

const csvContent = fs.readFileSync(csvPath, 'utf8');
const [headers, ...dataRows] = parseCsv(csvContent);

const records = dataRows
  .map(row =>
    Object.fromEntries(
      headers.map((header, index) => [header, row[index] ?? ''])
    )
  )
  .filter(
    row => row['CITY/MUNICIPALITY']?.trim().toUpperCase() === municipality
  );

if (records.length === 0) {
  console.error(`No rows found for municipality: ${municipality}`);
  process.exit(1);
}

const grouped = new Map();

for (const record of records) {
  const barangay = record.BARANGAY.trim();
  const current = grouped.get(barangay) ?? [];
  current.push(record);
  grouped.set(barangay, current);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const entry of fs.readdirSync(outputDir)) {
  if (entry.endsWith('.md') || entry.endsWith('.json')) {
    fs.rmSync(path.join(outputDir, entry));
  }
}

const barangayPages = [];

for (const [barangayName, officials] of [...grouped.entries()].sort((a, b) =>
  a[0].localeCompare(b[0])
)) {
  const slug = slugify(barangayName);
  const phone = normalizePhone(
    officials.find(record => record['BARANGAY TEL NO.']?.trim())?.[
      'BARANGAY TEL NO.'
    ] ?? ''
  );
  const punong =
    officials.find(record => record.POSITION === 'Punong Barangay') ?? null;
  const term = officials[0]?.TERM?.trim() || 'Not yet available';

  barangayPages.push({
    name: `Barangay ${barangayName}`,
    slug,
    description: punong
      ? `Punong Barangay: ${formatName(punong)}`
      : 'Barangay officials and contact information',
  });

  const markdown = buildMarkdown(barangayName, officials, phone, term);
  fs.writeFileSync(path.join(outputDir, `${slug}.md`), markdown);
}

const indexLines = [
  '# Barangay Pages',
  '# This file contains all Aparri barangay pages available under the Barangays category.',
  'layout: grid',
  "title: 'Barangays of Aparri'",
  "description: 'Browse barangay profiles, elected officials, and available contact information for each barangay in Aparri, Cagayan.'",
  'pages:',
  ...barangayPages.flatMap(page => [
    `  - name: ${yamlQuote(page.name)}`,
    `    slug: ${yamlQuote(page.slug)}`,
    `    description: ${yamlQuote(page.description)}`,
  ]),
  '',
];

fs.writeFileSync(path.join(outputDir, 'index.yaml'), indexLines.join('\n'));

console.log(
  `Generated ${barangayPages.length} barangay pages in ${path.relative(process.cwd(), outputDir)}`
);
