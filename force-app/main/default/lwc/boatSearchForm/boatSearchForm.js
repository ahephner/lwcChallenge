// imports
import {LightningElement, wire, track} from 'lwc'; 
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes'; 
// import getBoatTypes from the BoatDataService => getBoatTypes method';
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';
    
    // Private
    @track error = undefined;
    
    // Needs explicit track due to nested data
    @track searchOptions;
    
    // Wire a custom Apex method
    @wire(getBoatTypes)
      boatTypes({ error, data }) {
      if (data) {
        this.searchOptions = data.map(type => {
          // TODO: complete the logic
          return{
              value: type.Id,
              label: type.Name
          }
          
        });
        this.searchOptions.unshift({ label: 'All Types', value: '' });
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
    }
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
      
      event.preventDefault();   
      this.selectedBoatTypeId=event.detail.value;
      const searchEvent = new CustomEvent('search',{
        detail: {
          boatTypeId : this.selectedBoatTypeId
        }
    });
      this.dispatchEvent(searchEvent);
    }
  }