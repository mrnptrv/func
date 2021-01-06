import {action, observable} from "mobx";
import {Asset} from "app/api";
import {assetsApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class AssetStore {
    @observable assets: Array<Asset> = new Array<Asset>();
    @observable selectedAsset: Asset = null
    private loadedLocationId: string = ""

    constructor() {
        this.loadAssets()
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister(e) {
        if (e && this.loadedLocationId !== LOCATION_STORE.selectedLocationPubId()) {
            this.loadAssets()
        }
    }

    loadAssets() {
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        if (locationPubId && locationPubId !== this.loadedLocationId) {
            this.loadedLocationId = locationPubId

            assetsApi().assetsListUsingPOST({
                locationPubId: locationPubId
            }).then(r => {
                this.assets = r.data
                if (this.selectedAsset && this.selectedAsset.location.pubId !== LOCATION_STORE.selectedLocationPubId()) {
                    this.selectedAsset = null
                }
            })
        }
    }


    selectedAssetPubId(): string {
        return this.selectedAsset && this.selectedAsset.pubId
    }

    @action
    selectAsset(pubId) {
        this.selectedAsset = this.assets.find(l => l.pubId === pubId)
    }
}

export const ASSET_STORE = new AssetStore()
