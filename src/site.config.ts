// Everything personal lives here — edit this file first.
export const site = {
  name: 'Alina Desiatnikova',
  // Other spellings of your name (LinkedIn, email). Used in structured data so search and AI tools link them to you.
  alternateNames: ['Alina Desyatnikova'],
  role: 'Senior Technical Writer & Knowledge Architect',
  location: { city: 'Mexico City', country: 'MX' },
  tagline:
    'I build documentation systems for product and engineering teams: from end-user documentation to API docs, developer guides, and AI-ready knowledge bases.',
  description:
    'Alina Desiatnikova, Senior Technical Writer & Knowledge Architect. Documentation systems, API docs, and AI-ready knowledge bases for product teams.',
  photo: '/images/headshot.jpg',
  email: 'alina.desyatnikova@gmail.com',
  cv: '/files/Alina-Desiatnikova-CV.pdf', // phone number removed; replace this file to update the CV
  links: {
    linkedin: 'https://www.linkedin.com/in/alinadesyatnikova',
    github: 'https://github.com/alina-desya',
    newsletter: 'https://www.linkedin.com/newsletters/the-knowledge-gap-7497859047505887232/',
  },
  // Other public profiles of you (e.g. conference speaker pages). Together with LinkedIn and GitHub,
  // they tell search engines and AI tools that these pages are all about the same person.
  profiles: [
    'https://tcworldconference.tekom.de/tcworld-conference-program/speakers/speaker/desiatnikova-alina',
  ],
  // Set to true to publish /speaking/kit/ and show links to it (footer, Speaking page)
  showSpeakerKit: false,
  // Set to true to publish /mexidocs/ and show it in the menu
  showMexiDocs: false,
};

export const nav = [
  { href: '/about/', label: 'About' },
  { href: '/services/', label: 'Services' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/speaking/', label: 'Speaking' },
  { href: '/blog/', label: 'Blog' },
  ...(site.showMexiDocs ? [{ href: '/mexidocs/', label: 'MexiDocs' }] : []),
];
