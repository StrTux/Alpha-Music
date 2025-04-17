/**
 * Project Structure Setup Script
 *
 * This script can be used to create the proper folder structure for the project.
 *
 * Usage:
 * 1. Run this script with node: node src/setup-structure.js
 * 2. It will create missing directories based on the FOLDER_STRUCTURE in paths.js
 */

const fs = require('fs');
const path = require('path');

// Project root directory (adjust if needed)
const ROOT_DIR = path.resolve(__dirname, '..');

// Import folder structure from paths.js (manual copy since we can't import ES modules in Node.js script)
const FOLDER_STRUCTURE = {
  // Root folders
  ROOT: {
    ASSETS: 'assets',
    SRC: 'src',
  },

  // Source folders
  SRC: {
    COMPONENTS: 'components',
    SCREENS: 'screens',
    NAVIGATION: 'navigation',
    SERVICES: 'services',
    UTILS: 'utils',
    HOOKS: 'hooks',
    CONTEXT: 'context',
    CONSTANTS: 'constants',
    STYLES: 'styles',
    DATA: 'data',
  },

  // Component folders
  COMPONENTS: {
    COMMON: 'common',
    PLAYER: 'player',
    LISTS: 'lists',
    CARDS: 'cards',
    LOADERS: 'loaders',
    BUTTONS: 'buttons',
    MODALS: 'modals',
    FORMS: 'forms',
  },

  // Screen folders
  SCREENS: {
    AUTH: 'auth',
    HOME: 'home',
    SEARCH: 'search',
    LIBRARY: 'library',
    SETTINGS: 'settings',
    PLAYER: 'player',
    DETAILS: 'details',
  },
};

// Function to create directory if it doesn't exist
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, {recursive: true});

    // Create a basic index.js file in each directory
    const indexPath = path.join(dirPath, 'index.js');
    fs.writeFileSync(
      indexPath,
      `/**
 * ${path.basename(dirPath)} module
 */

export default {};
`,
    );

    return true; // Directory was created
  }
  return false; // Directory already exists
}

// Create all directories in the folder structure
function createFolderStructure() {
  console.log('Setting up project folder structure...');

  // Create root folders
  let createdCount = 0;
  Object.values(FOLDER_STRUCTURE.ROOT).forEach(folder => {
    if (createDirectoryIfNotExists(path.join(ROOT_DIR, folder))) {
      createdCount++;
    }
  });

  // Create source folders
  Object.values(FOLDER_STRUCTURE.SRC).forEach(folder => {
    if (createDirectoryIfNotExists(path.join(ROOT_DIR, 'src', folder))) {
      createdCount++;
    }
  });

  // Create component folders
  Object.values(FOLDER_STRUCTURE.COMPONENTS).forEach(folder => {
    if (
      createDirectoryIfNotExists(
        path.join(ROOT_DIR, 'src', 'components', folder),
      )
    ) {
      createdCount++;
    }
  });

  // Create screen folders
  Object.values(FOLDER_STRUCTURE.SCREENS).forEach(folder => {
    if (
      createDirectoryIfNotExists(path.join(ROOT_DIR, 'src', 'screens', folder))
    ) {
      createdCount++;
    }
  });

  console.log(
    `Folder structure setup complete! Created ${createdCount} new directories.`,
  );
  console.log(
    'Note: Check todo.md for a list of remaining tasks to complete the project setup.',
  );
}

// Run the folder structure setup
createFolderStructure();
