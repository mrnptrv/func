import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {userApi} from "app/constants/api";
import {User} from "app/api/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {CHANGE_SELECTED_COMPANY_TOPIC, COMPANY_STORE} from "app/store/CompanyStore";
import {LocationSelect} from "app/components/LocationSelect";
import {CompanySelect} from "app/components/CompanySelect";
import {CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";
import {PaymentPlanSelect} from "app/components/PaymentPlanSelect";
import {eventBus, subscribe} from "mobx-event-bus2";

class UserEditData {
    @observable isUserLoading = true
    @observable error = ""
    @observable user: User = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class UserEditContainer extends React.Component<any, any> {
    private data = new UserEditData()
    private locationStore = LOCATION_STORE
    private companyStore = COMPANY_STORE
    private paymentPlanStore = PAYMENT_PLAN_STORE



    constructor(props: any, context: any) {
        super(props, context);

        eventBus.register(this)
        this.data.isUserLoading = true

        userApi().getUserUsingGET(this.props.match.params.id)
            .then(res => {
                this.data.user = res.data

                this.locationStore.selectLocation(this.data.user.locationId)
                this.paymentPlanStore.loadPaymentPlans(true).then(() => {
                    this.paymentPlanStore.select(this.data.user.paymentPlanId)
                })

                this.companyStore.select(this.data.user.companyId)

                this.data.isUserLoading = false
            })
            .catch(error => {
                this.data.isUserLoading = false

                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }
            })
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

        userApi().updateUserUsingPOST({
            pubId: this.data.user.pubId,
            firstName: this.data.user.firstName,
            lastName: this.data.user.lastName,
            thirdName: this.data.user.thirdName,
            email: this.data.user.email,
            phone: this.data.user.mobile,
            locationId: this.locationStore.selectedLocationPubId(),
            companyId: this.companyStore.selectedCompanyPubId(),
            paymentPlanId: this.paymentPlanStore.selectedId()
        }).then(() => {
            this.data.isSaving = false
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

        this.data.user.mobile = formattedValue
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>User</h4>
                {this.data.isUserLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Label>Location:</Form.Label>
                            <LocationSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>First name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="First name"
                                value={this.data.user.firstName}
                                onChange={(e) => this.data.user.firstName = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Second name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Second name"
                                value={this.data.user.lastName}
                                onChange={(e) => this.data.user.lastName = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Third name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Third name"
                                value={this.data.user.thirdName}
                                onChange={(e) => this.data.user.thirdName = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Email"
                                value={this.data.user.email}
                                onChange={(e) => this.data.user.email = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Phone:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Phone"
                                value={this.data.user.mobile}
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
                }
            </div>
        );
    }

}
