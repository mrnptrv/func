import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {COMPANY_STORE} from "app/store/CompanyStore";

@observer
export class CompanySelect extends React.Component<any, any> {
    private store = COMPANY_STORE

    selectCompany(pubId: string) {
        this.store.select(pubId)
    }

    private defaultOption = {label: "----", value: null};

    options() {
        let options = this.store.companies.map(l => ({"label": l.name, "value": l.pubId}));
        options.unshift(this.defaultOption)
        return options
    }

    value() {
        if (this.store.selectedCompany) {
            return {
                label: this.store.selectedCompany.name,
                value: this.store.selectedCompany.pubId
            }
        }
        return this.defaultOption
    }

    render() {
        return (
            <Select
                value={this.value()}
                options={this.options()}
                onChange={e => this.selectCompany(e.value)}
            />
        );
    }
}
