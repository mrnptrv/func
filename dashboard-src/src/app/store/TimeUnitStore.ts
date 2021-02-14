import {action, observable} from "mobx";
import {eventBus} from "mobx-event-bus2";

export interface TimeUnit {
    label: string,
    id: string
}

class TimeUnitStore {
    @observable units: Array<TimeUnit> = new Array<TimeUnit>();
    @observable selectedUnit: TimeUnit = null

    constructor() {
        this.loadUnits()
        eventBus.register(this)
    }

    loadUnits() {
        this.units = [
            {label: "----", id: "NA"},
            {label: "час", id: "HOUR"},
            {label: "день", id: "DAY"},
            {label: "месяц", id: "MONTH"},
            {label: "год", id: "YEAR"}
        ]
        this.selectUnit("DAY")
    }

    selectedId(): string {
        if (this.selectedUnit) {
            return this.selectedUnit.id
        }
        return "NA"
    }

    @action
    selectUnit(id) {
        if (this.selectedUnit?.id != id) {
            this.selectedUnit = this.units.find(l => l.id === id)
            eventBus.post(TIME_UNIT_CHANGE_TOPIC, this.selectedUnit)
        }
    }
}

export const TIME_UNIT_STORE = new TimeUnitStore()
export const TIME_UNIT_CHANGE_TOPIC = "TIME_UNIT_CHANGE_TOPIC"
