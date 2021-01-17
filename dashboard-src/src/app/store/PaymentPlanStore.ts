import {action, observable} from "mobx";
import {PaymentPlan} from "app/api";
import {paymentPlanApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class PaymentPlanStore {
    @observable paymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedPaymentPlan: PaymentPlan = null;
    private loadedLocationId: string = ""

    constructor() {
        this.loadPaymentPlans().then(() => {
        })
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister() {
        this.loadPaymentPlans().then(() => {
        })
    }

    @action
    clear() {
        this.selectedPaymentPlan = null
    }

    @action
    loadPaymentPlans(force: boolean = false): Promise<void> {
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        if (force || locationPubId && locationPubId !== this.loadedLocationId) {
            this.loadedLocationId = locationPubId

            return paymentPlanApi().getPaymentPlanListUsingPOST({
                locationPubId: this.loadedLocationId,
            }).then(r => {
                this.paymentPlans = r.data
            })
        }

        return Promise.resolve()
    }

    selectedId(): string {
        if (this.selectedPaymentPlan) {
            return this.selectedPaymentPlan.pubId
        }

        return null
    }

    @action
    select(pubId) {
        let selected = this.paymentPlans.find(l => l.pubId === pubId)
        if (selected) {
            this.selectedPaymentPlan = selected
        } else {
            this.selectedPaymentPlan = null
        }

        eventBus.post(CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, pubId)
    }
}

export const PAYMENT_PLAN_STORE = new PaymentPlanStore()
export const CHANGE_SELECTED_PAYMENT_PLAN_TOPIC = 'changeSelectedPaymentPlan'
