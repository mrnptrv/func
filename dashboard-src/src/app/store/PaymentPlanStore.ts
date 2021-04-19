import {action, observable} from "mobx";
import {PaymentPlan} from "app/api";
import {paymentPlanApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'
import {ASSET_STORE, CHANGE_SELECTED_ASSET_TOPIC} from "app/store/AssetStore";

class PaymentPlanStore {
    @observable paymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedPaymentPlan: PaymentPlan = null;
    @observable selectedPaymentId = null;
    private loadedLocationId: string = ""
    private loadedAssetId: string = ""
    private initiated = false;

    constructor() {
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    onChangeLocationLister() {
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        if (this.initiated && locationPubId && locationPubId !== this.loadedLocationId) {
            this.loadPaymentPlans().then(() => {
                return true
            })
        }
    }

    @subscribe(CHANGE_SELECTED_ASSET_TOPIC)
    onChangeSelectedAssetLister() {
        let loadedAssetId = ASSET_STORE.selectedAssetPubId();
        if (this.initiated && loadedAssetId && loadedAssetId !== this.loadedAssetId) {
            this.loadPaymentPlans().then(() => {
                return true
            })
        }
    }

    @action
    init() {
        this.initiated = true
    }

    @action
    clear() {
        this.selectedPaymentPlan = null
    }

    @action
    loadPaymentPlans(): Promise<Array<PaymentPlan>> {
        return this.load();
    }

    private load(): Promise<Array<PaymentPlan>> {
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        let assetPubId = ASSET_STORE.selectedAssetPubId();

        if (locationPubId) {
            this.loadedLocationId = locationPubId
            this.loadedAssetId = assetPubId
            return paymentPlanApi().getPaymentPlanListUsingPOST({
                locationPubId: this.loadedLocationId,
                assetId: this.loadedAssetId
            }).then(r => {
                this.paymentPlans = r.data
                this.select(this.selectedPaymentId)

                return this.paymentPlans
            })
        }

        return Promise.resolve(this.paymentPlans)
    }

    selectedId(): string {
        return this.selectedPaymentId;
    }

    @action
    select(pubId) {
        if (this.selectedPaymentId !== pubId || this.selectedPaymentPlan?.pubId !== pubId) {
            let selected = this.paymentPlans.find(l => l.pubId === pubId)

            if (selected) {
                this.selectedPaymentPlan = selected
            } else {
                this.selectedPaymentPlan = null
            }
            this.selectedPaymentId = pubId

            eventBus.post(CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, pubId)
        }
    }

    @action
    selectSilent(pubId) {
        if (this.selectedPaymentId !== pubId || this.selectedPaymentPlan?.pubId !== pubId) {
            let selected = this.paymentPlans.find(l => l.pubId === pubId)

            if (selected) {
                this.selectedPaymentPlan = selected
            } else {
                this.selectedPaymentPlan = null
            }
            this.selectedPaymentId = pubId

        }
    }
}

export const PAYMENT_PLAN_STORE = new PaymentPlanStore()
export const CHANGE_SELECTED_PAYMENT_PLAN_TOPIC = 'changeSelectedPaymentPlan'
