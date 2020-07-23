import { NavigationMixin } from 'lightning/navigation';
import {subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext} from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { LightningElement, api, wire } from 'lwc';

// Custom Labels Imports
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
 
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    @api boatId;

    @wire(MessageContext) messageContext;

    @wire(getRecord, {
        recordId: '$boatId',
        fields: BOAT_FIELDS
    })
    wiredRecord;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord.data ? 'utility:anchor' : null;
    }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }

    // Private
    subscription = null;

    // Subscribe to the message channel
    subscribeMC() {
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
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view',
            },
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}

//similar boatgs
import { NavigationMixin } from 'lightning/navigation';
import {
    LightningElement,
    api,
    wire
} from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
    currentBoat;
    relatedBoats;
    boatId;
    error;

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    @api similarBy = '';

    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, {
        boatId: '$boatId',
        similarBy: '$similarBy'
    })
    similarBoats({
        error,
        data
    }) {
        if (data && data != undefined) {
            this.relatedBoats = data;
        } else if (error && error != undefined) {
            this.error = error.body.message;
        }
    }

    @api
    get getTitle() {
        return 'Similar boats by ' + this.similarBy;
    }

    @api
    get noBoats() {
        return !(this.relatedBoats && this.relatedBoats != undefined && this.relatedBoats.length > 0);
    }

    // Navigate to record page
    openBoatDetailPage(event) {
        console.log(event.detail.boatId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view',
            },
        });
    }
}