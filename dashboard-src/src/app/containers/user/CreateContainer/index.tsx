import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {userApi} from "app/constants/api";
import {Alert, Button, Col, Form, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {CHANGE_SELECTED_COMPANY_TOPIC, COMPANY_STORE} from "app/store/CompanyStore";
import {CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";
import {PaymentPlanSelect} from "app/components/PaymentPlanSelect";
import {eventBus, subscribe} from "mobx-event-bus2";
import {CompanySelect} from "app/components/CompanySelect";
import * as style from "app/containers/style.css";
import {MainMenu} from "app/components";
import {formatPhone} from "app/constants/utils";


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
        this.data.phone = formatPhone(e.target.value)
    }


    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Новый резидент</h4>

                <Form className={style.userForm}>
                    <Form.Group>
                        <Form.Label>Локации:</Form.Label>
                        <LocationSelect/>
                    </Form.Group>
                    <Form.Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Фамилия:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.data.lastName}
                                    onChange={(e) => this.data.lastName = e.target.value}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Имя:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.data.firstName}
                                    onChange={(e) => this.data.firstName = e.target.value}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Отчество:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.data.thirdName}
                                    onChange={(e) => this.data.thirdName = e.target.value}
                                />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Почта:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.data.email}
                                    onChange={(e) => this.data.email = e.target.value}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Телефон:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.data.phone}
                                    onChange={this.setPhone}
                                />
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <Form.Group>
                        <Form.Label>Организация:</Form.Label>
                        <CompanySelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Платежный план:</Form.Label>
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
                    <Form.Group className="float-right">
                        <Button
                            className="mr-2"
                            variant="light"
                            onClick={this.cancel}
                        >
                            Отменить
                        </Button>
                        <Button
                            className="mr-2"
                            variant="primary"
                            onClick={this.save}
                        >
                            Сохранить
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
