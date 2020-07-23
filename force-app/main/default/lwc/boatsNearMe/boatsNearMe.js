import { LightningElement,track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation'
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  @track isLoading = true;
  @track isRendered = false;
   latitude;
   longitude;
  
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatId: '$boatTypeId'})
  wiredBoatsJSON({error, data}) { 
      if(error){
        
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.message,
                    variant: ERROR_VARIANT
                })
            );
        
      }else if(data){
          //data comes back in JSON form 
          this.createMapMarkers(JSON.parse(data));
      }
      this.isLoading = false; 
  }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
      if(this.isRendered === false){
          this.getLocationFromBrowser() 
      }
      this.isRendered = true;

      //stop the spinner 
      this.isLoading = false; 
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
      navigator.geolocation.getCurrentPosition((position) =>{
          this.latitude =position.coords.latitude;
          this.longitude = position.coords.longitude; 
        } )
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});
     console.log(boatData);
     
    this.mapMarkers = boatData.map(x =>{
        return { 
            location: {
                Longitude: x.Geolocation__Longitude__s,
                Latitude: x.Geolocation__Latitude__s
            },
            title: x.Name
        }
    })
    this.mapMarkers.unshift({
        location:{
            Latitude: this.latitude,
            Longitude: this.longitude
        },
        title: LABEL_YOU_ARE_HERE,
        icon: ICON_STANDARD_USER
    })
    this.isLoading = false; 
   }

}
