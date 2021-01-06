import {action, observable} from "mobx";

export interface HasAccessAssumption {
    label: string,
    id: string
}

class HasAccessAssumptionStore {
    @observable hasAccessAssumptions
        : Array<HasAccessAssumption> = new Array<HasAccessAssumption>();
    @observable selected: HasAccessAssumption = null

    constructor() {
        this.loadUnits()
    }

    loadUnits() {
        this.hasAccessAssumptions = [
            {label: "----", id: "NA"},
            {label: "has access", id: "HAS_ACCESS"},
            {label: "no access", id: "NO_ACCESS"},
        ]
        this.select("NA")
    }

    selectedId(): string {
        if (this.selected) {
            return this.selected.id
        }
        return "NA"
    }

    @action
    select(id) {
        this.selected = this.hasAccessAssumptions.find(l => l.id === id)
    }
}

export const HAS_ACCESS_ASSUMPTION_STORE = new HasAccessAssumptionStore()
