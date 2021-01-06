import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {DAY_ASSUMPTION_STORE} from "app/store/DayAssumptionStore";

@observer
export class DayAssumptionSelect extends React.Component<any, any> {
    private store = DAY_ASSUMPTION_STORE

    selectUnit(id: string) {
        this.store.selectUnit(id)
    }

    options() {
        return this.store.dayAssumptions.map(l => ({"label": l.label, "value": l.id}))
    }

    value() {
        if (this.store.selected) {
            return {
                label: this.store.selected.label,
                value: this.store.selected.id
            }
        }

        return {
            label: "----",
            value: "NA"
        }
    }

    render() {
        return (
            <Select
                value={this.value()}
                options={this.options()}
                onChange={e => this.selectUnit(e.value)}
                isDisabled={this.store.disabled}
            />
        );
    }
}
