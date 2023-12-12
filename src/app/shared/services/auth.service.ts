import { Inject, Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userData: any;
  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) {
    this.afAuth.authState.subscribe((user: User) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  public async SignInEmailPassword(email: string, password: string) {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.setUserData(result.user);
      this.afAuth.authState.subscribe((user: User) => {
        if (user) {
          this.router.navigate(['home']);
        }
      });
    } catch (error) {
      window.alert(error.message);
    }
  }

  public async loginGoogle() {
    try {
      const result = await this.afAuth.signInWithPopup(
        new GoogleAuthProvider()
      );
      this.setUserData(result.user);
      this.afAuth.authState.subscribe((user: User) => {
        if (user) {
          this.router.navigate(['home']);
        }
      });
    } catch (error) {
      window.alert(error.message);
    }
  }

  public async SignUpEmailPassword(email: string, password: string) {
    return await this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.SendVerificationMail();
        this.setUserData(result.user);
      })
      .catch((error: any) => {
        window.alert(error.message);
      });
  }

  private async SendVerificationMail() {
    return await this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  public async ForgotPassword(passwordResetEmail: string) {
    return await this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error: any) => {
        window.alert(error);
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user')!);
    return user !== null && user.emailVerified !== false ? true : false;
  }

  private setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  public async SignOut() {
    return await this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
}
