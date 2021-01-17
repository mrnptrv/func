import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {paymentPlanApi} from "app/constants/api";
import {AccessAssumptionReq, PaymentPlan, TimeRangeAssumptionReq} from "app/api/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {AssetSelect} from "app/components/AssetSelect";
import {ASSET_STORE} from "app/store/AssetStore";
import {COMPANY_STORE} from "app/store/CompanyStore";
import {CompanySelect} from "app/components/CompanySelect";
import {TimeUnitSelect} from "app/components/TimeUnitSelect";
import {TIME_UNIT_CHANGE_TOPIC, TIME_UNIT_STORE} from "app/store/TimeUnitStore";
import {DayAssumptionSelect} from "app/components/DayAssumptionSelect";
import {DAY_ASSUMPTION_STORE} from "app/store/DayAssumptionStore";
import {WORK_HOURS} from "app/constants/constants";
import {eventBus, subscribe} from "mobx-event-bus2";
import {HasAccessAssumptionSelect} from "app/components/HasAccessAssumptionSelect";
import {HAS_ACCESS_ASSUMPTION_STORE} from "app/store/HasAccessAssumptionStore";
import {PaymentPlanMultiSelect} from "app/components/PaymentPlanMultiSelect";
import {PAYMENT_PLAN_MULTI_SELECT_STORE} from "app/store/PaymentPlanMultiSelectStore";

class PaymentPlanEditData {
    @observable isPaymentPlanLoading = true
    @observable error = ""
    @observable begin = "--"
    @observable end = "--"
    @observable beginDisabled = false;
    @observable endDisabled = false;
    @observable paymentPlan: PaymentPlan = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class PaymentPlanEditContainer extends React.Component<any, any> {
    private data = new PaymentPlanEditData()
    private locationStore = LOCATION_STORE
    private assetStore = ASSET_STORE
    private companyStore = COMPANY_STORE
    private timeUnitStore = TIME_UNIT_STORE
    private dayAssumptionStore = DAY_ASSUMPTION_STORE
    private hasAccessAssumptionStore = HAS_ACCESS_ASSUMPTION_STORE;
    private paymentPlanStore = PAYMENT_PLAN_MULTI_SELECT_STORE

    cancel = () => {
        this.props.history.push("/dashboard/payment-plan-list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        paymentPlanApi().updatePaymentPlanUsingPOST({
            pubId: this.data.paymentPlan.pubId,
            name: this.data.paymentPlan.name,
            description: this.data.paymentPlan.description,
            unit: this.timeUnitStore.selectedId(),
            price: this.data.paymentPlan.price,
            locationPubId: this.locationStore.selectedLocation.pubId,
            assetPubId: this.assetStore.selectedAssetPubId(),
            companyPubId: this.companyStore.selectedCompanyPubId(),
            assumption: {
                day: this.dayAssumptionStore.selectedId(),
                time: this.getTimeAssumptionReq(),
                access: this.getAccessAssumptionReq()
            }
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


    constructor(props: any, context: any) {
        super(props, context);

        this.data.isPaymentPlanLoading = true
        this.assetStore.loadAssets()

        paymentPlanApi().getPaymentPlanUsingGET(this.props.match.params.id)
            .then(res => {
                this.data.paymentPlan = res.data
                this.data.isPaymentPlanLoading = false

                this.locationStore.selectLocation(this.data.paymentPlan.locationPubId)
                this.assetStore.selectAsset(this.data.paymentPlan.assetPubId)
                this.companyStore.select(this.data.paymentPlan.companyPubId)
                this.dayAssumptionStore.selectUnit(
                    this.data.paymentPlan?.assumption?.day ?? "NA"
                )
                this.data.begin = this.data.paymentPlan?.assumption?.time?.begin ?? "--"
                this.data.end = this.data.paymentPlan?.assumption?.time?.end ?? "--"
                this.timeUnitStore.selectUnit(this.data.paymentPlan.unit)
                this.hasAccessAssumptionStore.select(
                    this.data.paymentPlan?.assumption?.access?.access ?? "NA"
                )
                this.paymentPlanStore.exceptPaymentPlanId = this.data.paymentPlan.pubId
                this.paymentPlanStore.loadPaymentPlans(true).then(() => {
                    this.paymentPlanStore.clear();
                    //
                    (this.data.paymentPlan?.assumption?.access?.paymentPlanIds ?? []).forEach(id => {
                       this.paymentPlanStore.select(id)
                    })
                })
            })
            .catch(error => {
                this.data.isPaymentPlanLoading = false

                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }
            })

        eventBus.register(this)
        this.changeTimeUnit()
    }

    @subscribe(TIME_UNIT_CHANGE_TOPIC)
    changeTimeUnit() {
        if (TIME_UNIT_STORE.selectedId() === "HOUR") {
            if (this.data.begin === "--") {
                this.data.begin = "00:00"
            }
            if (this.data.end === "--") {
                this.data.end = "00:00"
            }
            this.data.beginDisabled = false
            this.data.endDisabled = false
        } else {
            this.data.begin = "--"
            this.data.end = "--"
            this.data.beginDisabled = true
            this.data.endDisabled = true
        }
    }

    setStartWorkTime(h) {
        return () => {
            this.data.begin = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    setEndWorkTime(h) {
        return () => {
            this.data.end = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private getAccessAssumptionReq(): AccessAssumptionReq {
        if (this.hasAccessAssumptionStore.selectedId() == "NA" &&
            this.paymentPlanStore.selectedPaymentPlans.length == 0
        ) {
            return null
        }
        return {
            paymentPlanIds: this.paymentPlanStore.selectedPaymentPlans.map(it => it.pubId),
            access: this.hasAccessAssumptionStore.selectedId()
        }
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Payment Plan</h4>
                {this.data.isPaymentPlanLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Label>Location:</Form.Label>
                            <LocationSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Asset:</Form.Label>
                            <AssetSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Company:</Form.Label>
                            <CompanySelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Name"
                                value={this.data.paymentPlan.name}
                                onChange={(e) => this.data.paymentPlan.name = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description:</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Description"
                                rows={3}
                                value={this.data.paymentPlan.description}
                                onChange={(e) => this.data.paymentPlan.description = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Unit:</Form.Label>
                            <TimeUnitSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price:</Form.Label>
                            <Form.Control
                                value={this.data.paymentPlan.price}
                                onChange={(e) => {
                                    this.data.paymentPlan.price = e.target.value
                                }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Day assumption:</Form.Label>
                            <DayAssumptionSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Time assumption:</Form.Label>
                            <InputGroup className="mb-3">

                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={this.data.begin}
                                    id="input-group-dropdown-1"
                                    disabled={this.data.endDisabled}
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setStartWorkTime(h)} key={h}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={this.data.end}
                                    id="input-group-dropdown-1"
                                    disabled={this.data.endDisabled}
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setEndWorkTime(h)} key={h}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Access assumption:</Form.Label>
                            <HasAccessAssumptionSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Access to other payment plan:</Form.Label>
                            <PaymentPlanMultiSelect/>
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

    private getTimeAssumptionReq(): TimeRangeAssumptionReq {
        if (this.data.begin === "--" || this.data.end === "--") {
            return null;
        }

        return {
            begin: this.data.begin,
            end: this.data.end
        }
    }
}
