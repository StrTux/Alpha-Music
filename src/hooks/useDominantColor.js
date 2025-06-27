// useDominantColor.js
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Utility to generate a random but not-too-light hex color
function getRandomDarkColor() {
  let color;
  while (true) {
    color = '#';
    for (let i = 0; i < 6; i++) {
      color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
    }
    // Convert to RGB and check brightness
    const r = parseInt(color.substr(1,2), 16);
    const g = parseInt(color.substr(3,2), 16);
    const b = parseInt(color.substr(5,2), 16);
    // Calculate brightness (perceived luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 180) break; // Only accept not-too-light colors
  }
  return color;
}

let getColors;
try {
  getColors = require('react-native-image-colors').getColors;
} catch {
  getColors = null;
}

export function useDominantColor(imageUrl) {
  const [color, setColor] = useState(() => ({
    top: getRandomDarkColor(),
    bottom: '#111',
  }));

  useEffect(() => {
    if (!imageUrl || !getColors) return;
    getColors(imageUrl, { fallback: getRandomDarkColor(), cache: true, key: imageUrl })
      .then(colors => {
        let top;
        if (Platform.OS === 'ios') {
          top = colors.primary || colors.background || getRandomDarkColor();
        } else {
          top = colors.dominant || getRandomDarkColor();
        }
        setColor({ top, bottom: '#111' });
      })
      .catch((e) => {
        console.error('color fetch error', e);
        setColor({ top: getRandomDarkColor(), bottom: '#111' });
      });
  }, [imageUrl]);

  return color;
}
