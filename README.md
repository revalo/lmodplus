# LMOD+

An attempt to speed up the bloated and slow learning-modules.mit.edu. Tries to give the old stellar like experience.

## Download

LMOD+ is a Chrome Extention. Download it from the Chrome Web Store.

## Development

### Setup

Simply clone the repo and drag the extention into `chrome://extentions`. The main app HTML and CSS should hot reload with every change. Anything that changes with the manifest or the injection scripts need to be manually reloaded.

### Codebase

The codebase is written in JavaScript and uses Vue.js. The main interface with the LMOD API is inside `src/api.js` and the Vue app is inside `src/main.js`.

The library packages are bundled in the `dist` directory. Importing external code from CDNs is forbidden as per Chrome's Content Security Policy.

### Contributing

Please open issues for any bugs or feature requests and submit pull requests to contribute directly. There isn't a standard style guide to follow, just be neat and have decent commit messages.

## License

Copyright (c) 2018 Shreyas Kapur. Released under MIT License.
