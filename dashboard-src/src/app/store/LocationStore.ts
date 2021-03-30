import {action, observable} from "mobx";
import {Location} from "app/api";
import {locationApi} from "app/constants";
import {eventBus} from 'mobx-event-bus2'

class LocationStore {
    @observable locations: Array<Location> = new Array<Location>();
    @observable selectedLocation: Location = null
    @observable selectedLocationId: string = ""
    private loadPromise: Promise<void> = null;

    constructor() {
    }

    @action
    loadLocations() {
        if (this.loadPromise) {
            return this.loadPromise
        }

        this.loadPromise = locationApi().getLocationListUsingPOST(null).then(r => {
            this.locations = r.data

            if (this.selectedLocationId) {
                this.selectLocation(this.selectedLocationId)
            } else if (r.data.length > 0) {
                this.selectLocation(r.data[0].pubId)
            }
            this.loadPromise = null
        })

        return this.loadPromise
    }

    @action
    selectLocation(pubId) {
        this.selectedLocationId = pubId
        this.selectedLocation = this.locations.find(l => l.pubId === pubId)
        eventBus.post(CHANGE_LOCATION_TOPIC, pubId)
    }

    selectedLocationPubId(): string {
        return this.selectedLocationId
    }
}

export const LOCATION_STORE = new LocationStore()
export const CHANGE_LOCATION_TOPIC = 'changeLocation'
