import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";


@observer
export class PaymentPlanSelect extends React.Component<any, any> {
    private store = PAYMENT_PLAN_STORE

    private defaultOption = [];

    select(selected) {
        this.store.clear()
        if (selected) {
            selected.forEach(it => this.store.select(it.value))
        }
    }

    options() {
        return this.store.paymentPlans.map(l => ({"label": l.name, "value": l.pubId}))
    }

    defaultValue() {
        if (this.store.selectedPaymentPlan) {
            let r = this.store.selectedPaymentPlan.map(it => ({
                label: it.name,
                value: it.pubId
            }));
            return r;
        }

        return this.defaultOption;
    }

    render() {
        return (
            <Select
                isMulti
                value={this.defaultValue()}
                options={this.options()}
                onChange={e => this.select(e)}
            />
        );
    }
}
