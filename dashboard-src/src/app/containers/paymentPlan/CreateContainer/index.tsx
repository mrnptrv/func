import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {paymentPlanApi} from "app/constants/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {ASSET_STORE} from "app/store/AssetStore";
import {COMPANY_STORE} from "app/store/CompanyStore";
import {AssetSelect} from "app/components/AssetSelect";
import {CompanySelect} from "app/components/CompanySelect";
import {LocationSelect} from "app/components/LocationSelect";
import * as style from "app/containers/style.css";
import {TimeUnitSelect} from "app/components/TimeUnitSelect";
import {TIME_UNIT_CHANGE_TOPIC, TIME_UNIT_STORE} from "app/store/TimeUnitStore";
import {WORK_HOURS} from "app/constants/constants";
import {eventBus, subscribe} from "mobx-event-bus2";
import {AccessAssumptionReq, WorkTimeRange} from "app/api";
import {HasAccessAssumptionSelect} from "app/components/HasAccessAssumptionSelect";
import {HAS_ACCESS_ASSUMPTION_STORE} from "app/store/HasAccessAssumptionStore";
import {PaymentPlanMultiSelect} from "app/components/PaymentPlanMultiSelect";
import {PAYMENT_PLAN_MULTI_SELECT_STORE} from "app/store/PaymentPlanMultiSelectStore";

class PaymentPlanCreateData {
    @observable workTimeRanges: Array<WorkTimeRange> = new Array<WorkTimeRange>();
    @observable error = ""
    @observable name = ""
    @observable description = ""
    @observable price = "100.00"
    @observable begin = "--"
    @observable end = "--"
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
    @observable beginDisabled = false;
    @observable endDisabled = false;
}

@observer
export class PaymentPlanCreateContainer extends React.Component<any, any> {
    private data = new PaymentPlanCreateData()
    private locationStore = LOCATION_STORE
    private assetStore = ASSET_STORE
    private companyStore = COMPANY_STORE
    private timeUnitStore = TIME_UNIT_STORE
    private hasAccessAssumptionStore = HAS_ACCESS_ASSUMPTION_STORE
    private paymentPlanStore = PAYMENT_PLAN_MULTI_SELECT_STORE

    constructor(props: any, context: any) {
        super(props, context);
        eventBus.register(this)
        this.changeTimeUnit()
        this.assetStore.loadAssets()
    }

    @subscribe(TIME_UNIT_CHANGE_TOPIC)
    changeTimeUnit() {
        if (TIME_UNIT_STORE.selectedId() === "HOUR") {
            this.data.begin = "00:00"
            this.data.end = "00:00"
            this.data.beginDisabled = false
            this.data.endDisabled = false
        } else {
            this.data.begin = "--"
            this.data.end = "--"
            this.data.beginDisabled = true
            this.data.endDisabled = true
        }
    }

    cancel = () => {
        this.props.history.push("/dashboard/payment-plan-list")
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

    private save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        paymentPlanApi().createPaymentPlanUsingPOST({
            name: this.data.name,
            description: this.data.description,
            unit: this.timeUnitStore.selectedId(),
            price: this.data.price,
            locationPubId: this.locationStore.selectedLocationPubId(),
            assetPubId: this.assetStore.selectedAssetPubId(),
            companyPubId: this.companyStore.selectedCompanyPubId(),
            assumption: {
                workTimeRanges: this.data.workTimeRanges,
                access: this.getAccessAssumptionReq()
            }
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/edit-payment-plan/" + r.data.pubId)
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

    private addWorkTimeRange = () => {
        this.data.workTimeRanges.push({
            start: "00:00",
            end: "00:00",
            price: "0.00",
            isWeekend: false
        })
    }

    private deleteWorkTimeRange(wtr: WorkTimeRange) {
        return () => {
            this.data.workTimeRanges = this.data.workTimeRanges.filter(w => wtr != w)
        };
    }

    private setStartWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.start = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setEndWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.end = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setWeekend(wtr: WorkTimeRange, isWeekend: boolean) {
        return () => {
            wtr.isWeekend = isWeekend
        }
    }

    render() {
        return (
            <div>
                <MainMenu/>

                <h4>Create Payment Plan</h4>

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
                            value={this.data.name}
                            onChange={(e) => this.data.name = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Description"
                            rows={3}
                            value={this.data.description}
                            onChange={(e) => this.data.description = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Unit:</Form.Label>
                        <TimeUnitSelect/>
                    </Form.Group>

                    {TIME_UNIT_STORE.selectedId() !== "HOUR" ||
                    this.data.workTimeRanges.length == 0 ? (
                        <Form.Group>
                            <Form.Label>Price:</Form.Label>
                            <Form.Control
                                value={this.data.price}
                                onChange={(e) => {
                                    this.data.price = e.target.value
                                }}
                            />
                        </Form.Group>
                    ) : (<></>)}

                    {TIME_UNIT_STORE.selectedId() === "HOUR" ? (
                        <Form.Group>
                            <Form.Label>
                                Hour Price:
                                <Button
                                    variant="light"
                                    onClick={this.addWorkTimeRange}
                                > + </Button>
                            </Form.Label>

                            {this.data.workTimeRanges.map(wtr =>
                                <InputGroup className="mb-3">
                                    <DropdownButton
                                        as={InputGroup.Prepend}
                                        variant="outline-secondary"
                                        title={wtr.isWeekend ? "weekend " : "workday "}
                                    >
                                        <Dropdown.Item onClick={this.setWeekend(wtr, false)}>
                                            workday
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={this.setWeekend(wtr, true)}>
                                            weekend
                                        </Dropdown.Item>
                                    </DropdownButton>
                                    <DropdownButton
                                        as={InputGroup.Prepend}
                                        variant="outline-secondary"
                                        title={wtr.start}
                                        id="input-group-dropdown-1"
                                    >
                                        {WORK_HOURS.map(h =>
                                            <Dropdown.Item onClick={this.setStartWorkTime(wtr, h)}>
                                                {h < 10 ? "0" + h : h}:00
                                            </Dropdown.Item>
                                        )}
                                    </DropdownButton>
                                    <DropdownButton
                                        as={InputGroup.Prepend}
                                        variant="outline-secondary"
                                        title={wtr.end}
                                        id="input-group-dropdown-1"
                                    >
                                        {WORK_HOURS.map(h =>
                                            <Dropdown.Item onClick={this.setEndWorkTime(wtr, h)}>
                                                {h < 10 ? "0" + h : h}:00
                                            </Dropdown.Item>
                                        )}
                                    </DropdownButton>
                                    <Form.Control
                                        aria-describedby="basic-addon1"
                                        value={wtr.price}
                                        onChange={(e) => {
                                            wtr.price = e.target.value
                                        }}
                                    />
                                    <InputGroup.Append>
                                        <Button variant="outline-secondary"
                                                onClick={this.deleteWorkTimeRange(wtr)}
                                        >X</Button>
                                    </InputGroup.Append>
                                </InputGroup>
                            )}
                        </Form.Group>
                    ) : (<></>)}
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
            </div>
        );
    }
}
