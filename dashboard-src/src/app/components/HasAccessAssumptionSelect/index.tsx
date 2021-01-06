import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {HAS_ACCESS_ASSUMPTION_STORE} from "app/store/HasAccessAssumptionStore";

@observer
export class HasAccessAssumptionSelect extends React.Component<any, any> {
    private store = HAS_ACCESS_ASSUMPTION_STORE

    select(id: string) {
        this.store.select(id)
    }

    options() {
        return this.store.hasAccessAssumptions.map(l => ({"label": l.label, "value": l.id}))
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
                onChange={e => this.select(e.value)}
            />
        );
    }
}
