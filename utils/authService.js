// authService.js content goes here
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

GoogleSignin.configure({
  webClientId: '524538800032-i90tfemniomjijvgbqpecdvk2gekq20r.apps.googleusercontent.com',
});

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();

  const idToken = userInfo.idToken;
  const credential = GoogleAuthProvider.credential(idToken);

  const result = await signInWithCredential(auth, credential);
  return result.user;
};

export const signOutUser = async () => {
  await GoogleSignin.signOut();
  await signOut(auth);
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};
