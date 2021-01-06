import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {ASSET_STORE} from "app/store/AssetStore";

@observer
export class AssetSelect extends React.Component<any, any> {
    private store = ASSET_STORE

    private defaultOption = {label: "----", value: null};

    select(pubId: string) {
        this.store.selectAsset(pubId)
    }

    options() {
        let options = this.store.assets.map(l => ({"label": l.name, "value": l.pubId}));
        options.unshift(this.defaultOption)
        return options
    }

    value() {
        if (this.store.selectedAsset) {
            return {
                label: this.store.selectedAsset.name,
                value: this.store.selectedAsset.pubId
            }
        }

        return this.defaultOption;
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
