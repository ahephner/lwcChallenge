import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { refreshApex } from '@salesforce/apex';
export default class BoatReviews extends NavigationMixin(LightningElement){
    // Private
  boatId;
  error;
  boatReviews;
  isLoading;
  
  // Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId(){
      console.log('get '+ this.boatId);
      
    return this.boatId
   }
  set recordId(value) {
      console.log('set '+value);
      
    //sets boatId attribute
    //sets boatId assignment
    //get reviews associated with boatId
    this.setAttribute('boatId', value);
    this.boatId = value;
    this.getReviews(); 
  }
  
  // Getter to determine if there are reviews to display
  get reviewsToShow(){
    return [this.boatReviews != null && this.boatReviews != undefined && this.boatReviews > 0]
   }
  
  // Public method to force a refresh of the reviews invoking getReviews
  @api
  refresh(){
    refreshApex(this.getReviews()); 
   }
  
  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  getReviews(){ 
      if(this.boatId == null || this.boatId == undefined){
          return; 
      }
      this.isLoading = true
    getAllReviews({boatId: this.recordId})
        .then((resp)=>{
            this.boatReviews = resp;
        }).catch((error)=>{
            this.error = error.message; 
        }).finally(()=> this.isLoading = false)
  }
  
  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) {
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: event.target.dataset.recordId,
            actionName: 'view',
        },
    });
}
}