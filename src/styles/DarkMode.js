import {StyleSheet, Dimensions} from 'react-native';

const width = Dimensions.get('window').width;

export const dmWelcomeUI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
    color: '#C73EFF',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  login: {
    backgroundColor: '#C73EFF',
  },
  newUserContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  newText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  createText: {
    color: '#C73EFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export const dmCreateUI = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  form: {
    width: '80%',
    paddingTop: 50,
    marginBottom: 200,
  },
  label: {
    marginBottom: 5,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: 'white',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 280,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#C73EFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export const dmLoginUI = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  headerText: {
    paddingBottom: 10,
    paddingRight: 222,
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
    color: 'black',
    fontWeight: 'bold',
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 300,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#C73EFF',
    shadowColor: '#808080',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12.35,
    elevation: 19,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export const dmLibraryUI = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 10,
    backgroundColor: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  userAvatarSize: {
    width: 35,
    height: 35,
  },
  userAvatar: {
    borderRadius: 25,
  },
  searchInput: {
    height: 35,
    width: width,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#A9A9A9',
    marginBottom: -10,
    paddingHorizontal: 10,
    color: 'black',
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    marginBottom: 10,
    padding: 20,
    marginHorizontal: -20,
  },
  cardTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  cardArtists: {
    flexDirection: 'row',
  },
  cardArtistName: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  cardContent: {
    height: 160,
    justifyContent: 'center',
  },
  albumCoversContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  albumCovers: {
    paddingBottom: 20,
    height: 180,
    width: 180,
    borderRadius: 10,
  },
});

export const dmPlayerUI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  songName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 15,
    textAlign: 'center',
  },
  seekBarText: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  playPauseButton: {
    backgroundColor: '#7744CF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextPrevButton: {
    backgroundColor: 'rgba(119, 68, 207, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    color: '#9966FF',
  },
});

export const dmProfileUI = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  coverPhoto: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  backButtonContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  backButton: {
    flex: 1,
    resizeMode: 'contain',
    paddingTop: 50,
    paddingRight: 30,
    width: 10,
    height: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -75,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: 'white',
  },
  name: {
    marginTop: 15,
    fontSize: 20,
    textDecorationLine: 'underline',
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  statContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  seeAllButton: {
    backgroundColor: '#A9A9A9',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  seeAllButtonText: {
    color: '#eee',
    fontWeight: 'bold',
  },
  sectionBody: {
    marginTop: 10,
  },
  sectionScroll: {
    paddingBottom: 20,
  },
  sectionCard: {
    width: 200,
    minHeight: 200,
    backgroundColor: '#fff',
    shadowColor: '#B0C4DE',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    margin: 10,
    borderRadius: 6,
  },
  sectionImage: {
    width: '100%',
    aspectRatio: 1,
  },
  sectionInfo: {
    padding: 10,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  logOutContainer: {
    alignItems: 'center',
    paddingTop: 250,
    paddingBottom: 15,
  },
  logOutText: {
    textDecorationLine: 'underline',
    color: 'gray',
    fontWeight: 'bold',
  },
});
