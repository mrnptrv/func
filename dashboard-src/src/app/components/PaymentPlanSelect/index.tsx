import * as React from "react";
import {observer} from "mobx-react";
import Select from 'react-select'
import {PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";


const customStyles = {
    menu: (provided, state) => ({
        ...provided,
        zIndex: 100
    }),
}

@observer
export class PaymentPlanSelect extends React.Component<any, any> {
    private store = PAYMENT_PLAN_STORE

    constructor(props: any, context: any) {
        super(props, context);
        this.store.init()
        this.store.loadPaymentPlans().then(() => {})
    }

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
                styles={customStyles}
                value={this.value()}
                options={this.options()}
                onChange={e => this.selectCompany(e.value)}
            />
        );
    }
}
