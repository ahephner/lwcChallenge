import { LightningElement,api,track,wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats'; 
export default class BoatSearchResults extends LightningElement {
    @api boatTypeId;
    @track boats;
    @track error;

    @wire(getBoats)
    wiredBoats(result){
       this.boats = result.data;  
       console.log(this.boats);
       
    }

    updateSelectedTile(event){

    }
}