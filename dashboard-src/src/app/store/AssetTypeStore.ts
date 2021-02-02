import {action, observable} from "mobx";
import {eventBus} from "mobx-event-bus2";

export interface AssetType {
    label: string,
    id: string
}

class AssetTypeStore {
    @observable types: Array<AssetType> = new Array<AssetType>();
    @observable selected: AssetType = null

    constructor() {
        this.loadUnits()
        eventBus.register(this)
    }

    loadUnits() {
        this.types = [
            {label: "Meeting room", id: "MEETING_ROOM"},
            {label: "Fixed work place", id: "FIXED_WORK_PLACE"},
            {label: "Unfixed work place", id: "UNFIXED_WORK_PLACE"},
        ]
        this.select("MEETING_ROOM")
    }

    selectedId(): string {
        if (this.selected) {
            return this.selected.id
        }
        return 'MEETING_ROOM'
    }

    @action
    select(id) {
        this.selected = this.types.find(l => l.id === id)
        eventBus.post(SELECTED_ASSET_TYPE_CHANGE_TOPIC, this.selected)
    }
}

export const ASSET_TYPE_STORE = new AssetTypeStore()
export const SELECTED_ASSET_TYPE_CHANGE_TOPIC = "SELECTED_ASSET_TYPE_CHANGE_TOPIC"
