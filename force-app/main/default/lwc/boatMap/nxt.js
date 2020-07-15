import { LightningElement, track, wire, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({ error, data }) {
        if (data) {
            this.createMapMarkers(data);
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
            this.isLoading = false;
        }
    }
    renderedCallback() {
        if (this.isRendered == false) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }
    getLocationFromBrowser() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            },
            (e) => {

            }, {
            enableHighAccuracy: true
        }
        );
    }
    createMapMarkers(boatData) {
        this.mapMarkers = boatData.map(rowBoat => {
            return {
                location: {
                    Latitude: rowBoat.Geolocation_Latitude_s,
                    Longitude: rowBoat.Geolocation_Longitude_s
                },
                title: rowBoat.Name,
            };
        });
        this.mapMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        this.isLoading = false;
    }
}


//9
import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

 
 export default class BoatSearch extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    
    // Handles loading event
    handleLoading(event) { 
        this.isLoading = event.detail;
    }
    
    // Handles done loading event
    handleDoneLoading(event) { 
        this.isLoading = event.detail;
    }
    
    // Handles search boat event
    // This custom event comes from the form
    searchBoats(event) {
        const boatTypeId = event.detail.boatTypeId;
        this.template.querySelector("c-boat-search-results").searchBoats(boatTypeId);
     }
    
    createNewBoat() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new',
            },
        });
    }
  }