import * as React from 'react';
// import * as style from "./style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {userApi} from "app/constants/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {CHANGE_SELECTED_COMPANY_TOPIC, COMPANY_STORE} from "app/store/CompanyStore";
import {CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";
import {PaymentPlanSelect} from "app/components/PaymentPlanSelect";
import {eventBus, subscribe} from "mobx-event-bus2";
import {CompanySelect} from "app/components/CompanySelect";


class UserCreateData {
    @observable error = ""
    @observable firstName = ""
    @observable lastName = ""
    @observable thirdName = ""
    @observable email = ""
    @observable phone = ""
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class UserCreateContainer extends React.Component<any, any> {
    private data = new UserCreateData()
    private locationStore = LOCATION_STORE
    private companyStore = COMPANY_STORE
    private paymentPlanStore = PAYMENT_PLAN_STORE


    constructor(props: any, context: any) {
        super(props, context);

        eventBus.register(this)
    }

    @subscribe(CHANGE_SELECTED_COMPANY_TOPIC)
    changeSelectedCompanyLister() {
        if (this.companyStore.selectedCompany) {
            this.paymentPlanStore.select(null)
        }
    }

    @subscribe(CHANGE_SELECTED_PAYMENT_PLAN_TOPIC)
    changeSelectedPaymentPlanLister() {
        if (this.paymentPlanStore.selectedPaymentPlan) {
            this.companyStore.select(null)
        }
    }

    cancel = () => {
        this.props.history.push("/dashboard/user-list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        userApi().createUserUsingPOST({
            locationId: this.locationStore.selectedLocationPubId(),
            firstName: this.data.firstName,
            lastName: this.data.lastName,
            thirdName: this.data.thirdName,
            email: this.data.email,
            phone: this.data.phone,
            companyId: this.companyStore.selectedCompanyPubId(),
            paymentPlanId: this.paymentPlanStore.selectedId()
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/edit-user/" + r.data.pubId)
        }).catch((error) => {
            this.data.isSaving = false

            if (error && error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            }


            if (error && error.response && error.response.data.errors) {
                this.data.fieldErrors = error.response.data.errors.map(e => e.messages).flat()
            }
        })
    }

    private setPhone = (e) => {
        let newValue = e.target.value
        newValue = newValue.replace(new RegExp("[^0-9]", "g"), "")


        let formattedValue = "+" + newValue.slice(0, 1)

        if (newValue.length > 1) {
            formattedValue += " (" + newValue.slice(1, 4)
        }

        if (newValue.length > 4) {
            formattedValue += ") " + newValue.slice(4, 7)
        }

        if (newValue.length > 7) {
            formattedValue += "-" + newValue.slice(7, 9)
        }

        if (newValue.length > 9) {
            formattedValue += "-" + newValue.slice(9, 11)
        }

        this.data.phone = formattedValue
    }

    render() {
        return (
            <div>
                <MainMenu/>

                <h4>New User</h4>

                <Form>
                    <Form.Group>
                        <Form.Label>Location:</Form.Label>
                        <LocationSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>First Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="First Name"
                            value={this.data.firstName}
                            onChange={(e) => this.data.firstName = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Second Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Second Name"
                            value={this.data.lastName}
                            onChange={(e) => this.data.lastName = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Third Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Third Name"
                            value={this.data.thirdName}
                            onChange={(e) => this.data.thirdName = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Email:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Email"
                            value={this.data.email}
                            onChange={(e) => this.data.email = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Phone:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Phone"
                            value={this.data.phone}
                            onChange={this.setPhone}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Company:</Form.Label>
                        <CompanySelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Payment plan:</Form.Label>
                        <PaymentPlanSelect/>
                    </Form.Group>
                    <Form.Group>
                        {this.data.error &&
                        <Alert variant="danger">
                            {this.data.error}
                            {
                                (<ul>{this.data.fieldErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>)
                            }
                        </Alert>
                        }
                    </Form.Group>
                    <Form.Group>
                        <Button
                            variant="light"
                            onClick={this.cancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.save}
                        >
                            Save
                            {this.data.isSaving &&
                            <Spinner animation="grow" as="span" size="sm" role="status"/>
                            }
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        );
    }

}
