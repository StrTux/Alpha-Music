import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';

const {width, height} = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const namasteOpacity = useSharedValue(0);
  const helloOpacity = useSharedValue(0);
  const mainContentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // First show Namaste
    setTimeout(() => {
      namasteOpacity.value = withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.exp),
      });

      // Then fade out Namaste
      setTimeout(() => {
        namasteOpacity.value = withTiming(0, {
          duration: 1500,
          easing: Easing.out(Easing.exp),
        });

        // Show Hello after Namaste disappears
        setTimeout(() => {
          helloOpacity.value = withDelay(
            300,
            withTiming(1, {
              duration: 1500,
              easing: Easing.out(Easing.exp),
            }),
          );

          // Fade out Hello
          setTimeout(() => {
            helloOpacity.value = withTiming(0, {
              duration: 800,
              easing: Easing.out(Easing.exp),
            });

            // Finally show the main content
            setTimeout(() => {
              setShowContent(true); // Only now show the content
              mainContentOpacity.value = withTiming(1, {
                duration: 1000,
                easing: Easing.out(Easing.exp),
              });

              // After main content fades in, show the button
              setTimeout(() => {
                buttonOpacity.value = withTiming(1, {
                  duration: 800,
                  easing: Easing.out(Easing.exp),
                });
                setAnimationComplete(true);
              }, 1500);
            }, 800);
          }, 1500);
        }, 1200);
      }, 2000);
    }, 300);
  }, [buttonOpacity, helloOpacity, mainContentOpacity, namasteOpacity]);

  const namasteStyle = useAnimatedStyle(() => ({
    opacity: namasteOpacity.value,
    transform: [{scale: withTiming(1.1)}],
  }));

  const helloStyle = useAnimatedStyle(() => ({
    opacity: helloOpacity.value,
    transform: [{scale: withTiming(1.1)}],
  }));

  const mainContentStyle = useAnimatedStyle(() => ({
    opacity: mainContentOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  // Function to render the blur effect conditionally based on platform
  const renderBlurView = () => {
    if (
      !animationComplete &&
      (namasteOpacity.value > 0 || helloOpacity.value > 0)
    ) {
      if (Platform.OS === 'ios') {
        // BlurView works best on iOS
        return (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={8}
            reducedTransparencyFallbackColor="black"
          />
        );
      } else {
        // For Android, use a semi-transparent View instead
        return (
          <View style={[StyleSheet.absoluteFill, styles.androidBlurFallback]} />
        );
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={{
          uri: 'https://res.cloudinary.com/drwpjxlfs/image/upload/v1744250226/5e6a6cb6943fe3be415ba065b2dea826_unxj34.jpg',
        }}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.overlay} />

        <LinearGradient
          colors={[
            'transparent',
            'rgba(77, 32, 175, 0.29)',
            'rgba(77, 32, 175, 0.7)',
          ]}
          style={styles.gradientOverlay}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
        />

        {renderBlurView()}

        <View style={styles.contentWrapper}>
          {!animationComplete && (
            <Animated.Text style={[styles.namaste, namasteStyle]}>
              नमस्ते
            </Animated.Text>
          )}

          {!animationComplete && (
            <Animated.Text style={[styles.hello, helloStyle]}>
              Hello
            </Animated.Text>
          )}

          {showContent && (
            <Animated.View style={[styles.contentContainer, mainContentStyle]}>
              <View style={styles.headingContainer}>
                <Text style={styles.mainHeading}>Find Your Favourite</Text>
                <Text style={styles.musicText}>Music</Text>
              </View>

              <Text style={styles.subText}>
                Find Your Latest Favourite Music{'\n'}From Our Collection
              </Text>
            </Animated.View>
          )}

          {showContent && animationComplete && (
            <Animated.View style={[buttonStyle]}>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => navigation.navigate('Create Account')}>
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.43)',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.4,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  namaste: {
    fontSize: width < 360 ? 40 : 48,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'serif',
    position: 'absolute',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  hello: {
    fontSize: width < 360 ? 44 : 52,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Great Vibes',
      android: 'sans-serif-light',
    }),
    position: 'absolute',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    flex: 1,
  },
  headingContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: width < 360 ? 28 : 32,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    lineHeight: width < 360 ? 36 : 40,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  musicText: {
    fontSize: width < 360 ? 28 : 32,
    fontWeight: '700',
    color: '#8DD3FF',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  getStartedButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.41)',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '60%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ios: 'System', android: 'Roboto'}),
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  androidBlurFallback: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

export default WelcomeScreen;
