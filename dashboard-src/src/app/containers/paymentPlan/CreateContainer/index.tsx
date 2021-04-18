import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import Select from 'react-select'
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
import {AccessAssumptionReq, Asset, AssetAssumptionReq, PaymentPlan, WorkTimeRangeReq} from "app/api";
import {MainMenu} from "app/components";
import {PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";

class PaymentPlanCreateData {
    @observable workTimeRanges: Array<WorkTimeRangeReq> = new Array<WorkTimeRangeReq>();
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
    @observable selectedAccessAssumptionAssets: Array<Asset> = new Array<Asset>();
    @observable selectedExceptPaymentPlans: Array<PaymentPlan> = new Array<PaymentPlan>();
    @observable selectedAssetAssumptionAssets: Array<Asset> = new Array<Asset>();
}

@observer
export class PaymentPlanCreateContainer extends React.Component<any, any> {
    private data = new PaymentPlanCreateData()
    private locationStore = LOCATION_STORE
    private assetStore = ASSET_STORE
    private paymentPlanStore = PAYMENT_PLAN_STORE
    private companyStore = COMPANY_STORE
    private timeUnitStore = TIME_UNIT_STORE

    constructor(props: any, context: any) {
        super(props, context);
        eventBus.register(this)
        this.changeTimeUnit()
        this.assetStore.loadAssets().then(() => {
        })
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
        if (this.data.selectedAccessAssumptionAssets.length == 0
            && this.data.selectedExceptPaymentPlans.length == 0) {
            return null
        }
        return {
            assetsIds: this.data.selectedAccessAssumptionAssets.map(it => it.pubId),
            exceptPaymentPlansIds: this.data.selectedExceptPaymentPlans.map(it => it.pubId),
        }
    }

    private getAssetAssumptionReq(): AssetAssumptionReq {
        if (this.data.selectedAssetAssumptionAssets.length == 0) {
            return null
        }
        return {
            assetsIds: this.data.selectedAssetAssumptionAssets.map(it => it.pubId),
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
                access: this.getAccessAssumptionReq(),
                asset: this.getAssetAssumptionReq()
            }
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/payment-plan-list")
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

    private deleteWorkTimeRange(wtr: WorkTimeRangeReq) {
        return () => {
            this.data.workTimeRanges = this.data.workTimeRanges.filter(w => wtr != w)
        };
    }

    private setStartWorkTime(wtr: WorkTimeRangeReq, h: number) {
        return () => {
            wtr.start = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setEndWorkTime(wtr: WorkTimeRangeReq, h: number) {
        return () => {
            wtr.end = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setWeekend(wtr: WorkTimeRangeReq, isWeekend: boolean) {
        return () => {
            wtr.isWeekend = isWeekend
        }
    }

    private exceptPaymentPlansDefaultValue() {
        if (this.data.selectedExceptPaymentPlans) {
            return this.data.selectedExceptPaymentPlans.map(it => ({
                label: it.name,
                value: it.pubId
            }));
        }

        return [];
    }

    private exceptPaymentPlansOptions() {
        return this.paymentPlanStore.paymentPlans.map(l => ({"label": l.name, "value": l.pubId}))
    }

    private exceptPaymentPlanSelect(selected) {
        this.data.selectedExceptPaymentPlans = []
        if (selected) {
            selected.forEach(it => {
                let selected = this.paymentPlanStore.paymentPlans.find(l => l.pubId === it.value)

                if (selected) {
                    this.data.selectedExceptPaymentPlans.push(selected)
                }
            })
        }
    }

    private accessAssumptionDefaultValue() {
        if (this.data.selectedAccessAssumptionAssets) {
            return this.data.selectedAccessAssumptionAssets.map(it => ({
                label: it.name,
                value: it.pubId
            }));
        }

        return [];
    }

    private accessAssumptionOptions() {
        return this.assetStore.assets.map(l => ({"label": l.name, "value": l.pubId}))
    }

    private accessAssumptionSelect(selected) {
        this.data.selectedAccessAssumptionAssets = []
        if (selected) {
            selected.forEach(it => {
                let selected = this.assetStore.assets.find(l => l.pubId === it.value)

                if (selected) {
                    this.data.selectedAccessAssumptionAssets.push(selected)
                }
            })
        }
    }

    private assetAssumptionDefaultValue() {
        if (this.data.selectedAssetAssumptionAssets) {
            return this.data.selectedAssetAssumptionAssets.map(it => ({
                label: it.name,
                value: it.pubId
            }));
        }

        return [];
    }

    private assetAssumptionOptions() {
        return this.assetStore.assets.map(l => ({"label": l.name, "value": l.pubId}))
    }

    private assetAssumptionSelect(selected) {
        this.data.selectedAssetAssumptionAssets = []
        if (selected) {
            selected.forEach(it => {
                let selected = this.assetStore.assets.find(l => l.pubId === it.value)

                if (selected) {
                    this.data.selectedAssetAssumptionAssets.push(selected)
                }
            })
        }
    }


    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Новый тариф</h4>

                <Form className={style.editForm}>
                    <Form.Group>
                        <Form.Label>Локация:</Form.Label>
                        <LocationSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Объект аренды:</Form.Label>
                        <AssetSelect withEmpty={false}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Организация:</Form.Label>
                        <CompanySelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Название:</Form.Label>
                        <Form.Control
                            type="text"
                            value={this.data.name}
                            onChange={(e) => this.data.name = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Описание:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={this.data.description}
                            onChange={(e) => this.data.description = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Длительность:</Form.Label>
                        <TimeUnitSelect/>
                    </Form.Group>

                    {TIME_UNIT_STORE.selectedId() !== "HOUR" ||
                    this.data.workTimeRanges.length == 0 ? (
                        <Form.Group>
                            <Form.Label>Цена:</Form.Label>
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
                                Стоимость часа:
                                <Button
                                    variant="light"
                                    onClick={this.addWorkTimeRange}
                                > + </Button>
                            </Form.Label>

                            {this.data.workTimeRanges.map(wtr =>
                                <InputGroup className="mb-3">
                                    <DropdownButton
                                        className={style.hourType}
                                        as={InputGroup.Prepend}
                                        variant="outline-secondary"
                                        title={wtr.isWeekend ? "выходные " : "будни "}
                                    >
                                        <Dropdown.Item onClick={this.setWeekend(wtr, false)}>
                                            будни
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={this.setWeekend(wtr, true)}>
                                            выходные
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
                        <Form.Label>Будет применяться к объектам аренды:</Form.Label>
                        <Select
                            isMulti
                            value={this.assetAssumptionDefaultValue()}
                            options={this.assetAssumptionOptions()}
                            onChange={e => this.assetAssumptionSelect(e)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Будет применяться, если есть доступ к объектам аренды:</Form.Label>
                        <Select
                            isMulti
                            value={this.accessAssumptionDefaultValue()}
                            options={this.accessAssumptionOptions()}
                            onChange={e => this.accessAssumptionSelect(e)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Будет применяться, если нет доступа по тарифам:</Form.Label>
                        <Select
                            isMulti
                            value={this.exceptPaymentPlansDefaultValue()}
                            options={this.exceptPaymentPlansOptions()}
                            onChange={e => this.exceptPaymentPlanSelect(e)}
                        />
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
                            Отменить
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.save}
                        >
                            Создать
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
