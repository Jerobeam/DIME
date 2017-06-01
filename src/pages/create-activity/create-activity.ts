import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Geofence } from '@ionic-native/geofence';
import { Utilities } from '../../app/utilities';
import firebase from 'firebase';

declare var google;

@IonicPage()
@Component({
  selector: 'page-create-activity',
  templateUrl: 'create-activity.html',
})
export class CreateActivityPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  activityPlace = {
    lat: 0,
    lng: 0
  };
  myDate: String = new Date().toISOString();
  activityPlaceName: String;
  categories: any[];
  description;
  maxPersonen;
  selectedCategory
  newPostKey: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public geolocation: Geolocation, public geofence: Geofence, public utilities: Utilities) { }

  ionViewDidLoad() {
    this.categories = this.utilities.categories;
    this.loadMap();
  }

  loadMap() {
    this.utilities.getUserPosition().then(()=>{
      let latLng = new google.maps.LatLng(this.utilities.userPositionLat, this.utilities.userPositionLng);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeControlOptions: {
          mapTypeIds: []
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addMarker();
      this.initAutocomplete();

    })
  }

  addMarker() {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";
    this.addInfoWindow(marker, content);
  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  initAutocomplete() {
    let map = this.map;
    let tempLatitude;
    let tempLongitude;
    // Create the search box and link it to the UI element.
    var input = (<HTMLInputElement>document.getElementById('pac-input'));;
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', () => {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }

        tempLatitude = place.geometry.location.lat();
        tempLongitude = place.geometry.location.lng();
        this.activityPlace.lat = tempLatitude;
        this.activityPlace.lng = tempLongitude;
        this.activityPlaceName = place.name;

      });
      map.fitBounds(bounds);
    });
  }

  createActivityOnClick() {
    if (this.activityPlaceName == undefined || this.activityPlace.lat == 0 || this.activityPlace.lng == 0 || this.maxPersonen == undefined || this.description == undefined) {
      let alert = this.alertCtrl.create({
        title: 'Fehlende Informationen',
        subTitle: 'Sie müssen alle Felder ausfüllen, damit eine Aktivität erstellt werden kann.',
        buttons: ['OK']
      });
      alert.present();
    } else {
      this.writeGeofenceToDatabase().then(() => {
        console.log('Aktivität eingetragen');
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  writeGeofenceToDatabase() {
    this.newPostKey = firebase.database().ref('activity').push().key;
    return firebase.database().ref('activity').child(this.newPostKey).set({
      attendees: [],
      category: this.selectedCategory,
      creator: "oaRPEmxRDraOKD5uX3Rk4vJS3yz2",
      date: this.myDate,
      description: this.description,
      locationAlt: this.activityPlace.lat,
      locationLong: this.activityPlace.lng,
      locationName: this.activityPlaceName,
      maxAttendees: this.maxPersonen
    });
  }
}
