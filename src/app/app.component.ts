import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import {firebaseConfig} from "./firebaseAppData";
import {ViewActivityPage} from "../pages/view-activity/view-activity";
import {LoginPage} from "../pages/login/login";
import firebase from 'firebase';

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged((user) => {
  //utilities.user = user;

  if (user != undefined) {
    //Speicher hier userdaten in Utilities oder so
  }
  if (!user) {
    //Setze loggedin auf false und lösche den eingeloggten Spieler in utilities
    //utilities.loggedIn = false;
    //utilities.user = {};
    //this.rootPage = LoginPage;
    this.rootPage = ViewActivityPage;
  } else {
    if (this.nav.getActive() == undefined) {
      this.rootPage = ViewActivityPage;
    }
  }
});

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: HomePage },
      { title: 'List', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
