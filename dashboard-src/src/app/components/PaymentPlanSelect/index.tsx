import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";


@observer
export class PaymentPlanSelect extends React.Component<any, any> {
    private store = PAYMENT_PLAN_STORE

    selectCompany(pubId: string) {
        this.store.select(pubId)
    }

    private defaultOption = {label: "----", value: null};

    options() {
        let options = this.store.paymentPlans.map(l => ({"label": l.name, "value": l.pubId}));
        options.unshift(this.defaultOption)
        return options
    }

    value() {
        if (this.store.selectedPaymentPlan) {
            return {
                label: this.store.selectedPaymentPlan.name,
                value: this.store.selectedPaymentPlan.pubId
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
