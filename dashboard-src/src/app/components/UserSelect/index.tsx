import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {USER_STORE} from "app/store/UserStore";
import {UserLite} from "app/api";


@observer
export class UserSelect extends React.Component<any, any> {
    private store = USER_STORE

    select(pubId: string) {
        this.store.select(pubId)
    }

    private defaultOption = {label: "----", value: null};

    options() {
        let options = this.store.users.map(l => ({
            "label": UserSelect.getLabel(l),
            "value": l.pubId
        }));
        options.unshift(this.defaultOption)
        return options
    }

    private static getLabel(l: UserLite) {
        return l.lastName + " " + l.firstName + " " + l.thirdName;
    }

    value() {
        if (this.store.selectedUser) {
            return {
                label: UserSelect.getLabel(this.store.selectedUser),
                value: this.store.selectedUser.pubId
            }
        }
        return this.defaultOption
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
