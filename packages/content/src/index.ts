// The site's content as typed, validated data. Every module parses its records with Zod when it is imported, so a
// malformed date, an unknown ground or a tag outside the inline marks fails the build, not the page.
export * from './inline.ts';
export * from './dates.ts';
export * from './person.ts';
export * from './team.ts';
export * from './projects.ts';
export * from './builds.ts';
export * from './curriculum.ts';
export * from './cv.ts';
export * as views from './views.ts';
