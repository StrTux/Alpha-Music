# Alpha Music

A cross-platform mobile music player app built with React Native. This app allows users to browse, search, and play music from various sources.

## Features

- Browse trending songs, new releases, and top artists
- Search for songs, albums, and artists
- Play music with a beautiful player interface
- Create and manage playlists
- Offline mode support
- Background playback

## Project Setup

### Prerequisites

- Node.js 14+
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd music-player
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up the project structure:
   ```
   node src/setup-structure.js
   ```

4. Link the required libraries:
   ```
   npx react-native link
   ```

5. Install pods (iOS only):
   ```
   cd ios && pod install && cd ..
   ```

### Running the App

#### iOS

```
npx react-native run-ios
```

#### Android

```
npx react-native run-android
```

## Project Structure

```
music-player/
├── android/            # Android native code
├── ios/                # iOS native code
├── src/                # JavaScript source code
│   ├── components/     # React components
│   │   ├── common/     # Common UI components
│   │   ├── player/     # Player-related components
│   │   └── ...
│   ├── screens/        # App screens
│   │   ├── home/       # Home screen components
│   │   ├── search/     # Search screen components
│   │   └── ...
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services and business logic
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context providers
│   ├── constants/      # Constants and configuration
│   └── styles/         # Global styles
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── fonts/          # Font files
└── __tests__/          # Tests
```

## API Integration

The app integrates with a music API service. The API service is defined in `src/services/ApiService.js` and provides functions to fetch music data:

- Search for songs, albums, and artists
- Get song, album, and artist details
- Get trending songs and new releases
- Get and manage playlists
- Get radio stations

The API service falls back to mock data when the API is unavailable.

## Testing API Endpoints

You can test the API endpoints using the utility function in `src/utils/apiTester.js`:

```javascript
import { testApiEndpoints } from './utils/apiTester';

// In a component or test
const testResults = await testApiEndpoints();
console.log(testResults);
```

## TODO List

See the [todo.md](todo.md) file for a list of tasks that need to be completed.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# App Preview

Welcome Screen:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202033_Alpha Music.jpg' alt= 'lm-welcome-screen' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202339_Alpha Music.jpg' height='400' />
</p>

Login:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202049_Alpha Music.jpg' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202354_Alpha Music.jpg' height='400' />
</p>

Create Account:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202413_Alpha Music.jpg' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202347_Alpha Music.jpg' height='400' />
</p>

Library:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202102_Alpha Music.jpg' alt= 'lm-welcome-screen' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202432_Alpha Music.jpg' height='400' />
</p>

Player Modal:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202109_Alpha Music.jpg' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202441_Alpha Music.jpg' height='400' />
</p>

User Profile:
<p>
<img src = 'assets/app-imgs/Screenshot_20240407_202115_Alpha Music.jpg' height='400' />
<img src = 'assets/app-imgs/Screenshot_20240407_202456_Alpha Music.jpg' height='400' />
</p>

# Getting Started

**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

## Libraries used

1. react-native track player to play embedded songs in project files to phone speakers
2. react-native async storage to store user info from create account/login screen and display on user profile
3. react-native slider to scrub and control music playback
4. react-native navigation to navigate between different screen throughout the app and stack different screens in order to progress thorugh the app
5. react-native vector icons to provide icons for music playback control
6. eslint and prettier to unify code for better readiblity
