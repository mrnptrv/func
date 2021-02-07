import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {PAYMENT_PLAN_MULTI_SELECT_STORE} from "app/store/PaymentPlanMultiSelectStore";


@observer
export class PaymentPlanMultiSelect extends React.Component<any, any> {
    private store = PAYMENT_PLAN_MULTI_SELECT_STORE

    private defaultOption = [];


    constructor(props: any, context: any) {
        super(props, context);
        this.store.init()
        this.store.loadPaymentPlans()
    }

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
        if (this.store.selectedPaymentPlans) {
            let r = this.store.selectedPaymentPlans.map(it => ({
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
