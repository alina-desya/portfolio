// Everything personal lives here — edit this file first.
export const site = {
  name: 'Alina Desiatnikova',
  role: 'Senior Technical Writer & Knowledge Architect',
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
