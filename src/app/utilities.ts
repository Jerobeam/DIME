import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Geofence } from '@ionic-native/geofence';
import { Geolocation } from '@ionic-native/geolocation';


@Injectable()
export class Utilities {

    user: any;
    userData: any = {};
    userLoaded: boolean = false;
    categories: any[];
    userPositionLat: number = 0;
    userPositionLng: number = 0;
    userCategories: {};
    distancesToActivities: any[] = [];
    geofenceAreas: any[];
    picture: any;

    constructor(public geofence: Geofence, public geolocation: Geolocation) {
        this.getCategories();
        this.getUserPosition();
    }

    setUserData(): void {
        firebase.database().ref('user/' + this.user.uid).once('value', snapshot => {
            if (snapshot.val() != null) {
                console.log("in snapshot");
                this.userData = snapshot.val();
                this.userLoaded = true;
            }
            this.userCategories = this.userData.categories;
            console.log(this.userCategories);
            this.getSpecificUserActivites();
        });
    }

    setLocalUserData(userData): void {
      this.userData = userData;
      this.userLoaded = true;
    }

    getUserPosition() {
        return this.geolocation.getCurrentPosition().then((position) => {
            this.userPositionLat = position.coords.latitude,
                this.userPositionLng = position.coords.longitude
        }, (err) => {
            console.log(err);
        });
    }

    getCategories() {
        firebase.database().ref('category').once('value', snapshot => {
            if (snapshot.val() != null) {
                let categoriesArray = [];
                let counter = 0;
                for (let i in snapshot.val()) {
                    categoriesArray[counter] = snapshot.val()[i];
                    categoriesArray[counter].id = i;
                    counter++;
                }
                this.categories = categoriesArray;
            }
        });
    }

    getSpecificUserActivites() {
        firebase.database().ref('activity').once(`value`, snapshot => {
            if (snapshot.val() != null) {
                let geofenceArray = [];
                let counter = 0;
                for (let i in snapshot.val()) {
                    geofenceArray[counter] = snapshot.val()[i];
                    geofenceArray[counter].id = i;
                    counter++;
                }
                this.geofenceAreas = geofenceArray;
                for (let i = 0; i < this.geofenceAreas.length; i++) {
                    for (let prob in this.userCategories) {
                        if (this.geofenceAreas[i].category == prob) {
                            this.calculateDistanceToActivites(this.geofenceAreas[i].locationLat, this.geofenceAreas[i].locationLng);
                            this.createGeofenceAreas(this.geofenceAreas[i].locationLat, this.geofenceAreas[i].locationLng, this.geofenceAreas[i].locationName, this.geofenceAreas[i].date);
                        }
                    }
                }
            }
        });
    }

    calculateDistanceToActivites(lat, lng) {
        let R = 6731; //Radius of the earth in km
        let dLat = this.degTorad(this.userPositionLat - lat);
        let dLng = this.degTorad(this.userPositionLng - lng);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degTorad(this.userPositionLat)) * Math.cos(this.degTorad(lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km

        this.distancesToActivities.push(d);
    }

    degTorad(deg) {
        return deg * (Math.PI / 180)
    }

    createGeofenceAreas(lat, lng, place, date) {
        let fence = {
            id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
            latitude: lat, //center of geofence radius
            longitude: lng,
            radius: 1000, //radius to edge of geofence in meters
            transitionType: 1, //see 'Transition Types' below
            notification: { //notification settings
                id: 1, //any unique ID
                title: 'Eine neue Aktivität', //notification title
                text: place + ' ' + date, //notification body
                openAppOnClick: true //open app when notification is tapped
            }
        }
        this.geofence.addOrUpdate(fence).then(
            () => console.log('Geofence added'),
            (err) => console.log('Geofence failed to add')
        );
    }

}