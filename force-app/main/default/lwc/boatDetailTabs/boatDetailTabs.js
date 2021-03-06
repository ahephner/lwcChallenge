import { LightningElement, wire, api } from 'lwc';
import {APPLICATION_SCOPE, MessageContext, subscribe,unsubscribe} from 'lightning/messageService';
import {NavigationMixin} from 'lightning/navigation';
import {getRecord, getFieldValue} from 'lightning/uiRecordApi';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelDetails from '@salesforce/label/c.Details';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement){
    @api boatId;
    wiredRecord;

  @wire(getRecord,{recordId:'$boatId', fields:BOAT_FIELDS})
    wiredRecord
    label = {
      labelDetails,
      labelReviews,
      labelAddReview,
      labelFullDetails,
      labelPleaseSelectABoat,
    };
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  //return (!this.wiredRecord)? null: 'utility:anchor'; does not work because the operator is already looking for if null 
  get detailsTabIconName(){
    return this.wiredRecord ? 'utility:anchor': null; 
   }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName(){
    console.log('get boatName in boatDetails');
    
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD)
   }
  
  // Private
  subscription = null;

  @wire(MessageContext)
  messageContext;
  
  // Subscribe to the message channel
  subscribeMC() {
    //console.log('details subscribe message ');
    
    this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
                      
            this.boatId = message.recordId
        }, {
            scope: APPLICATION_SCOPE
        }
    );
}
  
  // Calls subscribeMC()
  connectedCallback() {
    console.log('details call back ');
    
    if (this.subscription || this.boatId) {
        return;
    }
    this.subscribeMC();
}

disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
}
  // Navigates to record page
  navigateToRecordViewPage(){ 
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: this.boatId,
          objectApiName : 'Boat__c',
          actionName: 'view'
      }
  });
  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated(){
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
   }
}