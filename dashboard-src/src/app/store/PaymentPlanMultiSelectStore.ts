import {action, observable} from "mobx";
import {PaymentPlan} from "app/api";
import {paymentPlanApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class PaymentPlanMultiSelectStore {
    @observable paymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedPaymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedPaymentPlan: PaymentPlan = null;

    private loadedLocationId: string = ""
    public exceptPaymentPlanId: string = ""
    private initiated = false;

    constructor() {
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister() {
        if(this.initiated) {

            this.loadPaymentPlans().then(() => {
            })
        }
    }

    @action
    init(){
        this.initiated = true
    }

    @action
    clear() {
        this.selectedPaymentPlans = []
    }

    @action
    loadPaymentPlans(force: boolean = false): Promise<void> {
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        if (force || locationPubId && locationPubId !== this.loadedLocationId) {
            this.loadedLocationId = locationPubId

            return paymentPlanApi().getPaymentPlanListUsingPOST({
                locationPubId: this.loadedLocationId,
                exceptPaymentPlanId: this.exceptPaymentPlanId
            }).then(r => {
                this.paymentPlans = r.data
                if (this.selectedPaymentPlans.length && this.selectedPaymentPlans[0].locationPubId !== LOCATION_STORE.selectedLocationPubId()) {
                    this.clear()
                }
            })
        }

        return Promise.resolve()
    }

    selectedId(): Array<String> {
        return this.selectedPaymentPlans.map(it => it.pubId)
    }

    @action
    select(pubId) {
        let selected = this.paymentPlans.find(l => l.pubId === pubId)
        if (selected) {
            this.selectedPaymentPlans.push(selected)
        }
    }
}

export const PAYMENT_PLAN_MULTI_SELECT_STORE = new PaymentPlanMultiSelectStore()
