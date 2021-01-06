import {action, observable} from "mobx";
import {eventBus, subscribe} from "mobx-event-bus2";
import {TIME_UNIT_CHANGE_TOPIC, TIME_UNIT_STORE} from "app/store/TimeUnitStore";

export interface DayAssumption {
    label: string,
    id: string
}

class DayAssumptionStore {
    @observable dayAssumptions: Array<DayAssumption> = new Array<DayAssumption>();
    @observable selected: DayAssumption = null
    @observable disabled: boolean = false

    constructor() {
        this.load()
        eventBus.register(this)
    }

    @subscribe(TIME_UNIT_CHANGE_TOPIC)
    changeTimeUnit() {
        if ((TIME_UNIT_STORE.selectedId() === "HOUR" || TIME_UNIT_STORE.selectedId() === "DAY")) {
            this.disabled = false;
        } else {
            this.selectUnit("NA")
            this.disabled = true
        }
    }

    load() {
        this.dayAssumptions = [
            {label: "----", id: "NA"},
            {label: "workday", id: "WORKDAY"},
            {label: "weekend", id: "WEEKEND"},
        ]
        this.selectUnit("NA")
    }

    selectedId(): string {
        if (this.selected) {
            return this.selected.id
        }
        return "NA"
    }

    @action
    selectUnit(id) {
        this.selected = this.dayAssumptions.find(l => l.id === id)
    }
}

export const DAY_ASSUMPTION_STORE = new DayAssumptionStore()
