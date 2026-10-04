/**
 * Plain-language glossary for terms and acronyms used across the site.
 *
 * Any text passed through <GlossaryText> (data page intros, section
 * descriptions, service and government markdown pages) gets a dotted
 * underline on these terms. Tapping or hovering shows the explanation.
 *
 * To add a term: add an entry below. `match` lists the exact spellings to
 * look for (case-sensitive, whole words only). Keep definitions short,
 * one or two sentences, written for residents, not specialists.
 */
export interface GlossaryEntry {
  /** Full name shown as the tooltip title. */
  term: string;
  /** Plain-language explanation. */
  definition: string;
  /** Exact spellings to underline in text. */
  match: string[];
}

export const glossary: GlossaryEntry[] = [
  // Government and offices
  {
    term: 'Local Government Unit (LGU)',
    definition:
      'A local government: a province, city, town or barangay. On this site it usually means the Municipality of Aparri.',
    match: ['LGU', 'LGUs'],
  },
  {
    term: 'Sangguniang Bayan',
    definition:
      'The town council. It passes local ordinances and approves the town budget, and is led by the vice mayor.',
    match: ['Sangguniang Bayan'],
  },
  {
    term: 'Punong Barangay',
    definition: 'The barangay captain, the elected head of a barangay.',
    match: ['Punong Barangay'],
  },
  {
    term: 'Business Permits and Licensing Office (BPLO)',
    definition:
      "The town office that processes business permits (the Mayor's Permit), including new applications and yearly renewals.",
    match: ['BPLO'],
  },
  {
    term: 'Municipal Civil Registrar (MCR)',
    definition:
      'The town office that records births, marriages and deaths in Aparri and issues local copies of these records.',
    match: ['MCR'],
  },
  {
    term: 'Rural Health Unit (RHU)',
    definition:
      'The town health center. It offers check-ups, vaccines, prenatal care and basic medicines, mostly for free.',
    match: ['RHU'],
  },
  {
    term: 'Municipal Social Welfare and Development Office (MSWDO)',
    definition:
      'The town office that helps families in need, senior citizens, persons with disability, solo parents and disaster victims.',
    match: ['MSWDO'],
  },
  {
    term: 'Municipal Disaster Risk Reduction and Management Office (MDRRMO)',
    definition:
      'The town office that prepares for and responds to typhoons, floods and other emergencies, including rescue and evacuation.',
    match: ['MDRRMO'],
  },
  {
    term: 'Office of Senior Citizens Affairs (OSCA)',
    definition:
      'The town office that issues senior citizen IDs and helps residents aged 60 and above get their discounts and benefits.',
    match: ['OSCA'],
  },
  {
    term: 'Person with Disability (PWD)',
    definition:
      'A person with a long-term physical, mental or sensory disability. A PWD ID gives discounts and other benefits under the law.',
    match: ['PWD'],
  },

  // Documents and permits
  {
    term: "Mayor's Permit",
    definition:
      'The permit a business needs from the town to operate legally. It must be renewed every year, usually in January.',
    match: ["Mayor's Permit", "Mayor's permit"],
  },
  {
    term: 'Barangay Clearance',
    definition:
      'A certificate from your barangay hall, often required before applying for permits, jobs or IDs.',
    match: ['Barangay Clearance', 'barangay clearance'],
  },
  {
    term: 'Community Tax Certificate (cedula)',
    definition:
      'A yearly certificate showing you paid the community tax. It is often asked for when notarizing documents or applying for permits.',
    match: ['Community Tax Certificate', 'cedula', 'Cedula'],
  },

  // National agencies and programs
  {
    term: 'Philippine Statistics Authority (PSA)',
    definition:
      'The national agency that runs the census and issues official birth, marriage and death certificates.',
    match: ['PSA'],
  },
  {
    term: 'PhilHealth',
    definition:
      'The national health insurance program. Members can have part of their hospital and clinic bills paid for.',
    match: ['PhilHealth'],
  },
  {
    term: 'Bureau of Internal Revenue (BIR)',
    definition:
      'The national agency that collects national taxes, such as income tax.',
    match: ['BIR'],
  },
  {
    term: 'Department of Trade and Industry (DTI)',
    definition:
      'The national agency that registers business names and runs the yearly competitiveness ranking of cities and towns (CMCI).',
    match: ['DTI'],
  },
  {
    term: 'Bureau of Fisheries and Aquatic Resources (BFAR)',
    definition:
      'The national agency in charge of fisheries. It runs programs and aid for fisherfolk.',
    match: ['BFAR'],
  },
  {
    term: 'Registry System for Basic Sectors in Agriculture (RSBSA)',
    definition:
      'The national list of farmers and fisherfolk. Being on it is often needed to receive government aid such as seeds, fuel or cash assistance.',
    match: ['RSBSA'],
  },
  {
    term: 'Department of Public Works and Highways (DPWH)',
    definition:
      'The national agency that builds and repairs national roads, bridges, flood control and school buildings.',
    match: ['DPWH'],
  },
  {
    term: 'District Engineering Office (DEO)',
    definition:
      'The local DPWH office that handles projects in an area. Most Aparri projects are under the Cagayan 1st District Engineering Office.',
    match: ['DEO'],
  },

  // Data and finance terms
  {
    term: 'Cities and Municipalities Competitiveness Index (CMCI)',
    definition:
      'A yearly DTI ranking of how ready Philippine cities and towns are for business, jobs and growth.',
    match: ['CMCI'],
  },
  {
    term: 'Census of Population (POPCEN)',
    definition:
      'A national head count by the PSA, done between the larger population-and-housing censuses. The latest was in 2024.',
    match: ['POPCEN'],
  },
  {
    term: 'Bureau of Local Government Finance (BLGF)',
    definition:
      'The national agency, under the Department of Finance, that collects and publishes the financial reports of local governments.',
    match: ['BLGF'],
  },
  {
    term: 'Annual Regular Income (ARI)',
    definition:
      'Money the town can count on receiving every year: local collections plus its share of national taxes. It leaves out one-time grants and loans.',
    match: ['ARI'],
  },
  {
    term: 'National Tax Allotment (NTA)',
    definition:
      "The town's share of national taxes, sent by the national government. It was called the Internal Revenue Allotment (IRA) before 2022.",
    match: ['NTA'],
  },
  {
    term: 'Internal Revenue Allotment (IRA)',
    definition:
      "The old name, used until 2021, for the town's share of national taxes. It is now called the National Tax Allotment (NTA).",
    match: ['IRA'],
  },
  {
    term: 'Special Education Fund (SEF)',
    definition:
      'Money from an extra 1% tax on land and buildings that can only be spent on public schools.',
    match: ['SEF'],
  },
  {
    term: 'Local Disaster Risk Reduction and Management Fund (LDRRMF)',
    definition:
      'Money the town must set aside every year for disasters: at least 5% of its regular income.',
    match: ['LDRRMF'],
  },
];
