import {action, observable} from "mobx";
import {Asset} from "app/api";
import {assetsApi} from "app/constants";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from 'mobx-event-bus2'

class AssetStore {
    @observable assets: Array<Asset> = new Array<Asset>();
    @observable selectedAsset: Asset = null
    @observable selectedAssetId = ""
    private loadedLocationId: string = ""
    private init = false;
    private loadPromise: Promise<void> = null;

    constructor() {
        eventBus.register(this)
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister(e) {
        if (e && this.loadedLocationId !== LOCATION_STORE.selectedLocationPubId()) {
            if (this.init) {
                this.loadAssets()
            }
        }
    }

    loadAssets() {
        this.init = true
        let locationPubId = LOCATION_STORE.selectedLocationPubId();
        if (locationPubId && locationPubId !== this.loadedLocationId) {
            this.loadedLocationId = locationPubId

            this.loadPromise = assetsApi().assetsListUsingPOST({
                locationPubId: locationPubId
            }).then(r => {
                this.assets = r.data
                if (this.selectedAsset && this.selectedAsset.location.pubId !== LOCATION_STORE.selectedLocationPubId()) {
                    this.selectedAsset = null
                    this.selectedAssetId = null
                }
                this.selectAsset(this.selectedAssetId, false)
                this.loadPromise = null
            })
        }
        return this.loadPromise ? this.loadPromise : Promise.resolve();
    }


    selectedAssetPubId(): string {
        return this.selectedAssetId;
    }

    @action
    selectAsset(pubId, riseEvent = true) {
        this.selectedAsset = this.assets.find(l => l.pubId === pubId)
        this.selectedAssetId = pubId
        if(riseEvent){
            eventBus.post(CHANGE_SELECTED_ASSET_TOPIC, pubId)
        }
    }
}

export const ASSET_STORE = new AssetStore()
export const CHANGE_SELECTED_ASSET_TOPIC = 'changeSelectedAsset'
