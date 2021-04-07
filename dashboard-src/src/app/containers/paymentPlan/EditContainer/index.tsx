import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {paymentPlanApi} from "app/constants/api";
import {AccessAssumptionReq, Asset, AssetAssumptionReq, PaymentPlan, WorkTimeRangeReq} from "app/api/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {AssetSelect} from "app/components/AssetSelect";
import {ASSET_STORE} from "app/store/AssetStore";
import {COMPANY_STORE} from "app/store/CompanyStore";
import {CompanySelect} from "app/components/CompanySelect";
import {TimeUnitSelect} from "app/components/TimeUnitSelect";
import {TIME_UNIT_CHANGE_TOPIC, TIME_UNIT_STORE} from "app/store/TimeUnitStore";
import {WORK_HOURS} from "app/constants/constants";
import {eventBus, subscribe} from "mobx-event-bus2";
import {MainMenu} from "app/components";
import Select from "react-select";

class PaymentPlanEditData {
    @observable isPaymentPlanLoading = true
    @observable error = ""
    @observable beginDisabled = false;
    @observable endDisabled = false;
    @observable paymentPlan: PaymentPlan = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
    @observable selectedAccessAssumptionAssets: Array<Asset> = new Array<Asset>();
    @observable selectedAssetAssumptionAssets: Array<Asset> = new Array<Asset>();

    @action
    selectAccessAssumptionAsset(pubId) {
        let selected = ASSET_STORE.assets.find(l => l.pubId === pubId)

        if (selected) {
            this.selectedAccessAssumptionAssets.push(selected)
        }
    }

    @action
    selectAssetAssumptionAsset(pubId) {
        let selected = ASSET_STORE.assets.find(l => l.pubId === pubId)

        if (selected) {
            this.selectedAssetAssumptionAssets.push(selected)
        }
    }
}

@observer
export class PaymentPlanEditContainer extends React.Component<any, any> {
    private data = new PaymentPlanEditData()
    private locationStore = LOCATION_STORE
    private assetStore = ASSET_STORE
    private companyStore = COMPANY_STORE
    private timeUnitStore = TIME_UNIT_STORE

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
                workTimeRanges: this.data.paymentPlan.assumption.workTimeRanges,
                access: this.getAccessAssumptionReq(),
                asset: this.getAssetAssumptionReq()
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

    private addWorkTimeRange = () => {
        this.data.paymentPlan.assumption.workTimeRanges.push({
            start: "00:00",
            end: "00:00",
            price: "0.00",
            isWeekend: false
        })
    }

    private deleteWorkTimeRange(wtr: WorkTimeRangeReq) {
        return () => {
            this.data.paymentPlan.assumption.workTimeRanges = this.data.paymentPlan.assumption.workTimeRanges.filter(w => wtr != w)
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


    constructor(props: any, context: any) {
        super(props, context);

        this.data.isPaymentPlanLoading = true

        this.locationStore.loadLocations().then(() => {
            return this.assetStore.loadAssets()
        }).then((r) => {
            paymentPlanApi().getPaymentPlanUsingGET(this.props.match.params.id)
                .then(res => {
                    this.data.paymentPlan = res.data
                    this.data.isPaymentPlanLoading = false

                    this.locationStore.selectLocation(this.data.paymentPlan.locationPubId)
                    this.assetStore.selectAsset(this.data.paymentPlan.assetPubId)
                    this.companyStore.select(this.data.paymentPlan.companyPubId)
                    this.timeUnitStore.selectUnit(this.data.paymentPlan.unit)

                    this.data.selectedAccessAssumptionAssets = [];

                    (this.data.paymentPlan?.assumption?.access?.assetsIds ?? []).forEach(id => {
                        this.data.selectAccessAssumptionAsset(id);
                    })

                    this.data.selectedAssetAssumptionAssets = [];

                    (this.data.paymentPlan?.assumption?.asset?.assetsIds ?? []).forEach(id => {
                        this.data.selectAssetAssumptionAsset(id);
                    })
                })
                .catch(error => {
                    this.data.isPaymentPlanLoading = false

                    if (error && error.response && error.response.data.message) {
                        this.data.error = error.response.data.message
                    }
                })
            })

        eventBus.register(this)
        this.changeTimeUnit()
    }

    @subscribe(TIME_UNIT_CHANGE_TOPIC)
    changeTimeUnit() {
        if (TIME_UNIT_STORE.selectedId() === "HOUR") {
            this.data.beginDisabled = false
            this.data.endDisabled = false
        } else {
            this.data.beginDisabled = true
            this.data.endDisabled = true
        }
    }

    private getAccessAssumptionReq(): AccessAssumptionReq {
        if (this.data.selectedAccessAssumptionAssets.length == 0) {
            return null
        }

        return {
            assetsIds: this.data.selectedAccessAssumptionAssets.map(it => it.pubId),
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
                let pubId = it.value;
                this.data.selectAccessAssumptionAsset(pubId);
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
                this.data.selectAssetAssumptionAsset(it.value)
            })
        }
    }


    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Тариф</h4>
                {this.data.isPaymentPlanLoading ? <Spinner animation="grow"/> :
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
                                value={this.data.paymentPlan.name}
                                onChange={(e) => this.data.paymentPlan.name = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Описание:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={this.data.paymentPlan.description}
                                onChange={(e) => this.data.paymentPlan.description = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Длительность:</Form.Label>
                            <TimeUnitSelect/>
                        </Form.Group>
                        {TIME_UNIT_STORE.selectedId() !== "HOUR" ||
                        this.data.paymentPlan.assumption.workTimeRanges.length == 0 ? (
                            <Form.Group>
                                <Form.Label>Цена:</Form.Label>
                                <Form.Control
                                    value={this.data.paymentPlan.price}
                                    onChange={(e) => {
                                        this.data.paymentPlan.price = e.target.value
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

                                {this.data.paymentPlan.assumption.workTimeRanges.map(wtr =>
                                    <InputGroup className="mb-3" key={wtr.start +":"+ wtr.isWeekend}>
                                        <DropdownButton
                                            className={style.hourType}
                                            as={InputGroup.Prepend}
                                            variant="outline-secondary"
                                            title={wtr.isWeekend ? "выходные " : "будни "}
                                        >
                                            <Dropdown.Item key={1} onClick={this.setWeekend(wtr, false)}>
                                                будни
                                            </Dropdown.Item>
                                            <Dropdown.Item key={2} onClick={this.setWeekend(wtr, true)}>
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
                                                <Dropdown.Item key={h} onClick={this.setStartWorkTime(wtr, h)}>
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
                                                <Dropdown.Item key={h} onClick={this.setEndWorkTime(wtr, h)}>
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
                            <Form.Label>Будет применяться к:</Form.Label>
                            <Select
                                isMulti
                                value={this.assetAssumptionDefaultValue()}
                                options={this.assetAssumptionOptions()}
                                onChange={e => this.assetAssumptionSelect(e)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Есть доступ к:</Form.Label>
                            <Select
                                isMulti
                                value={this.accessAssumptionDefaultValue()}
                                options={this.accessAssumptionOptions()}
                                onChange={e => this.accessAssumptionSelect(e)}
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
                        <Form.Group className="float-right">
                            <Button
                                className="mr-2"
                                variant="light"
                                onClick={this.cancel}
                            >
                                Отмена
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
                }
            </div>
        );
    }
}
