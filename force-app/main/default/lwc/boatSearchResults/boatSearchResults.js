import { LightningElement,api,track,wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats'; 
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c'
import { publish, MessageContext } from 'lightning/messageService';
export default class BoatSearchResults extends LightningElement {
    columns = [
        {label: 'Name', fieldName:'Name', type:'text', editable: true },
        {label:'Length', fieldName: 'Length__c', type:'number', editable: true},
        {label:'Price', fieldName: 'Price__c',  type:'currency', editable: true},
        {label:'Description', fieldName:'Description__c',  type:'text', editable: true }
    ]
    boatTypeId = '';
    @track boats;
    @track error;
    isLoading = false; 
    selectedBoatId = ''
    @track draftValues = [];

    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result){
       this.boats = result;  
       //console.log(this.boats);
       
    }

   @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }


    updateSelectedTile(event){
        this.selectedBoatId = event.detail.boatId; 

        this.sendMessageService(this.selectedBoatId)
    }

    // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId){
      const payLoad = boatId;
      publish(this.messageContext, BOATMC, payload); 
   }
    
    handleSave(event){
        this.isLoading = true;
        this.notifyLoading(this.isLoading)
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(goals => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Ship It!',
                    variant: 'success'
                })
            );

             // Display fresh data in the datatable
           return this.refresh()
        }).catch(error => {
            
            // Handle error
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'error',
                    variant: 'error'
                })
            )
        }).finally(() => {
            this.draftValues = []; 
            this.isLoading = false
            this.notifyLoading(this.isLoading)
        }); 
    }
    @api
    async refresh(){
        this.isLoading = true;
        this.notifyLoading(this.isLoading)
        await refreshApex(this.boats)
        this.isLoading = false; 
        this.notifyLoading(this.isLoading)
    }
    
    notifyLoading(isLoading){
        if(isLoading){
           this.dispatchEvent(new CustomEvent('loading'))
        }else{
           this.dispatchEvent(new CustomEvent('doneloading'))
        }
        
     }
}
