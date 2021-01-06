import {action, observable} from "mobx";
import {PaymentPlan} from "app/api";
import {paymentPlanApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class PaymentPlanStore {
    @observable paymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedPaymentPlan: Array<PaymentPlan> = new Array<PaymentPlan>();
    private loadedLocationId: string = ""
    public exceptPaymentPlanId: string = ""

    constructor() {
        this.loadPaymentPlans()
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister(e) {
        this.loadPaymentPlans()
    }

    @action
    clear() {
        this.selectedPaymentPlan = []
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
                if (this.selectedPaymentPlan.length && this.selectedPaymentPlan[0].locationPubId !== LOCATION_STORE.selectedLocationPubId()) {
                    this.clear()
                }
            })
        }

        return Promise.resolve()
    }

    selectedId(): Array<String> {
        return this.selectedPaymentPlan.map(it => it.pubId)
    }

    @action
    select(pubId) {
        let selected = this.paymentPlans.find(l => l.pubId === pubId)
        if (selected) {
            this.selectedPaymentPlan.push(selected)
        }
    }
}

export const PAYMENT_PLAN_STORE = new PaymentPlanStore()
