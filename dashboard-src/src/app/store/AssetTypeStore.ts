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
            {label: "Рабочее место", id: "WORK_PLACE"},
            {label: "Готовый офис", id: "OFFICE"},
            {label: "Переговорная", id: "MEETING_ROOM"},
            {label: "Площадка для мероприятий", id: "EVENT_PLACE"},
            {label: "Прочее", id: "OTHER"},
        ]
        this.select("MEETING_ROOM")
    }

    selectedId(): string {
        if (this.selected) {
            return this.selected.id
        }
        return 'WORK_PLACE'
    }

    @action
    select(id) {
        this.selected = this.types.find(l => l.id === id)
        eventBus.post(SELECTED_ASSET_TYPE_CHANGE_TOPIC, this.selected)
    }
}

export const ASSET_TYPE_STORE = new AssetTypeStore()
export const SELECTED_ASSET_TYPE_CHANGE_TOPIC = "SELECTED_ASSET_TYPE_CHANGE_TOPIC"
