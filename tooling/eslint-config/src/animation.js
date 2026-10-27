// Animation libraries: none is a dependency, and none may be imported (README: motion is CSS transitions on state
// changes, scaled by --k-motion; data figures never tween). eslint's no-restricted-imports reads `imports`, and the
// test in test/dependencies.test.js reads `packages`, over every package.json of the workspace.

/** npm package names, exactly. */
export const animationPackages = [
  'framer-motion', 'motion', 'motion-dom', 'animejs', 'anime.js', 'gsap', 'react-spring', 'popmotion', 'velocity-animate',
  'velocity-react', 'react-transition-group', 'react-motion', 'react-flip-toolkit', '@formkit/auto-animate', 'lottie-web',
  'lottie-react', 'aos', 'scrollreveal', 'tween.js', '@tweenjs/tween.js',
];

/** Scopes whose every package counts. */
export const animationScopes = ['@react-spring/', '@gsap/', '@lottiefiles/', '@motionone/'];

export const isAnimationPackage = (name) => animationPackages.includes(name) || animationScopes.some((s) => name.startsWith(s));

export const imports = {
  paths: animationPackages.map((name) => ({ name, message: 'No animation library: motion is a CSS transition on a state change (--k-motion).' })),
  patterns: [
    ...animationScopes.map((s) => ({ group: [`${s}*`], message: 'No animation library: motion is a CSS transition on a state change (--k-motion).' })),
    { group: ['motion/*', 'framer-motion/*', 'gsap/*'], message: 'No animation library: motion is a CSS transition on a state change (--k-motion).' },
  ],
};
