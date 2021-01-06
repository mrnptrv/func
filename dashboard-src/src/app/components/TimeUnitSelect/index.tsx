import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {TIME_UNIT_STORE} from "app/store/TimeUnitStore";

@observer
export class TimeUnitSelect extends React.Component<any, any> {
    private store = TIME_UNIT_STORE

    selectUnit(id: string) {
        this.store.selectUnit(id)
    }

    options() {
        return this.store.units.map(l => ({"label": l.label, "value": l.id}))
    }

    value() {
        if (this.store.selectedUnit) {
            return {
                label: this.store.selectedUnit.label,
                value: this.store.selectedUnit.id
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
            />
        );
    }
}
