import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {Utilities} from "../../app/utilities";
import {InAppBrowser} from "@ionic-native/in-app-browser";

/**
 * Generated class for the ProfilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  private user: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public utilities: Utilities, public iab: InAppBrowser) {
    if(!navParams.get('user')){
      this.user=this.utilities.userData;
      console.log("kein parameter übergeben");
    } else {
      this.user = navParams.get('user');
      console.log("parameter übergeben");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  calculateRating() {
    if(this.user.ratingNeg == 0 && this.user.ratingPos == 0){
      return "n.a.";
    }
    else if(this.user.ratingNeg == 0){
      return "100%";
    }
    else {
      return this.user.ratingPos/this.user.ratingNeg + "%";
    }

  }

  openFacebookProfile(){
    //window.open("fb://page/821072277997324", "_system");
    const browser = this.iab.create(this.user.profileURL);
    browser.show();

  }

}
