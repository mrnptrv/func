import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {ASSET_TYPE_STORE} from "app/store/AssetTypeStore";


@observer
export class AssetTypeSelect extends React.Component<any, any> {
    private store = ASSET_TYPE_STORE

    select(id: string) {
        this.store.select(id)
    }

    options() {
        return this.store.types.map(l => ({"label": l.label, "value": l.id}))
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
                styles={{menu: provided => ({...provided, zIndex: 9999})}}
            />
        );
    }
}
