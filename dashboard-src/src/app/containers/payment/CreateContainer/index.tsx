import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {bookingApi, paymentApi, paymentPlanApi, userApi} from "app/constants/api";
import {CreatePaymentRequest, Payment} from "app/api/api";
import {Alert, Button, Col, Dropdown, DropdownButton, Form, InputGroup, Spinner, Table} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {eventBus, subscribe} from "mobx-event-bus2";
import {TIME_UNIT_CHANGE_TOPIC, TIME_UNIT_STORE} from "app/store/TimeUnitStore";
import {TimeUnitSelect} from "app/components/TimeUnitSelect";
import ReactDatePicker from "react-datepicker";
import {WORK_HOURS} from "app/constants/constants";
import format from "date-fns/format";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import addYears from "date-fns/addYears";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import formatISO from "date-fns/formatISO";
import {UserSelect} from "app/components/UserSelect";
import {CHANGE_SELECTED_USER_TOPIC, USER_STORE} from "app/store/UserStore";
import {ASSET_STORE, CHANGE_SELECTED_ASSET_TOPIC} from "app/store/AssetStore";
import {AssetSelect} from "app/components/AssetSelect";
import {CompanySelect} from "app/components/CompanySelect";
import {CHANGE_SELECTED_COMPANY_TOPIC, COMPANY_STORE} from "app/store/CompanyStore";
import {CHANGE_SELECTED_PAYMENT_PLAN_TOPIC, PAYMENT_PLAN_STORE} from "app/store/PaymentPlanStore";
import {PaymentPlanSelect} from "app/components/PaymentPlanSelect";
import {numberFormat} from "../../../../../../booking-src/src/app/constants/numberFormat";
import {MainMenu} from "app/components";
import {formatDate} from "app/constants/utils";

class PaymentCreateData {
    @observable error = ""
    @observable startDate = new Date()
    @observable endDate = new Date()
    @observable startHour = 8
    @observable endHour = 24
    @observable payment: CreatePaymentRequest = {
        assetId: "",
        companyId: "",
        details: "",
        length: 1,
        locationId: LOCATION_STORE.selectedLocationId,
        paymentPlanId: PAYMENT_PLAN_STORE.selectedPaymentId,
        price: "100.00",
        start: "",
        end: "",
        total: "",
        unit: TIME_UNIT_STORE.selectedId(),
        userId: ""
    }
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
    @observable lastPayments: Array<Payment> = new Array<Payment>()
    @observable lastPaymentsLoading = false
}

@observer
export class PaymentCreateContainer extends React.Component<any, any> {
    private data = new PaymentCreateData()
    private locationStore = LOCATION_STORE
    private timeUnitStore = TIME_UNIT_STORE
    private userStore = USER_STORE
    private assetStore = ASSET_STORE
    private companyStore = COMPANY_STORE
    private paymentPlanStore = PAYMENT_PLAN_STORE

    constructor(props: any, context: any) {
        super(props, context);

        let userId = this.props.location?.state?.userId
        let companyId = this.props.location?.state?.companyId
        let bookingId = this.props.location?.state?.bookingId


        if (userId) {
            userApi().getUserUsingGET(userId).then(r => {
                this.locationStore.selectLocation(r.data.locationId)
                this.userStore.select(userId)
                this.selectUser(userId)
                this.data.payment.length = 1
                this.timeUnitStore.selectUnit("DAY")
                this.calcEndDate()
                this.calcTotal()
            })
        } else if (companyId) {
            this.companyStore.select(companyId)
            this.selectCompany(companyId)
            this.data.payment.length = 1
            this.timeUnitStore.selectUnit("DAY")
            this.calcEndDate()
            this.calcTotal()
        } else if (bookingId) {
            bookingApi().getUsingGET2(bookingId).then(r => {
                let booking = r.data
                this.locationStore.loadLocations().then(() => {
                    this.locationStore.selectLocation(booking?.asset?.location?.pubId)
                }).then(() => {
                    return this.assetStore.loadAssets();
                }).then(() => {
                    this.assetStore.selectAsset(booking?.asset?.pubId, false)
                }).then(() => {
                    return this.paymentPlanStore.loadPaymentPlans();
                }).then(() => {
                    this.paymentPlanStore.selectSilent(this.assetStore.selectedAsset.paymentPlanId)
                }).then(() => {
                    return this.userStore.loadUsers()
                }).then(() => {
                    this.userStore.select(booking?.uid, false)
                    this.selectUser(booking?.uid)
                    this.timeUnitStore.selectUnitSilent("HOUR")
                    this.data.startDate = new Date(booking.date);
                    this.data.endDate = new Date(booking.date);
                    this.data.startHour = this.getHour(booking.start)
                    this.data.endHour = this.getHour(booking.end) - 1


                    this.calcLength()
                    this.calcTotal()
                })
            })
        }

        eventBus.register(this)
    }

    selectHour = (h) => {
        this.data.startHour = h
    }

    cancel = () => {
        let userId = this.props.location?.state?.userId
        let companyId = this.props.location?.state?.companyId

        if (userId) {
            this.props.history.push("/dashboard/user-list")
        } else if (companyId) {
            this.props.history.push("/dashboard/company-list")
        } else {
            this.props.history.push("/dashboard/payment-list")
        }
    }

    private getHour = (s) => {
        let a = s.split(":")
        return +(a[0] as number)
    }

    private calcTotal() {
        let total: number = 0.0
        let workTimeRangeRes = this?.paymentPlanStore?.selectedPaymentPlan?.assumption?.workTimeRanges;
        if (workTimeRangeRes?.length > 0) {
            let isWeekend = this.data.startDate.getDay() === 6 || this.data.startDate.getDay() === 0;
            let workTimeRanges = workTimeRangeRes.filter(wtr => wtr.isWeekend == isWeekend)
            let startHour = this.data.startHour;
            let endHour = startHour + this.data.payment.length

            let prices = WORK_HOURS.map(h => {
                let price: number = 0.0
                if (h >= startHour && h < endHour) {
                    let prices = workTimeRanges.filter(wtr => h >= this.getHour(wtr.start) && h < this.getHour(wtr.end))
                        .map(wtr => parseFloat(wtr.price) || 0)

                    price = prices.length == 0 ? 0 :
                        prices.reduce((prevPrice, currentPrice) => prevPrice + currentPrice)
                }
                return price
            })

            total = prices.length == 0 ? 0 :
                prices.reduce((prevPrice, currentPrice) => prevPrice + currentPrice)

        } else {
            let price: number = parseFloat(this.data.payment.price) || 0;
            total = price * this.data.payment.length || 0;
        }

        this.data.payment.total = (Math.round(total * 100) / 100).toFixed(2)
    }

    private cleanPaymentPlanIfNotEqual() {
        let selectedPaymentPlan = this.paymentPlanStore.selectedPaymentPlan;
        let isNeedClean = false
        if (selectedPaymentPlan) {
            if (selectedPaymentPlan.price != this.data.payment.price) {
                isNeedClean = true
            }
            if (selectedPaymentPlan.unit != this.timeUnitStore.selectedId()) {
                isNeedClean = true
            }
        }

        if (isNeedClean) {
            this.paymentPlanStore.select(null)
        }
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        paymentApi().createPaymentUsingPOST({
            locationId: this.locationStore.selectedLocationId,
            price: this.data.payment.price,
            unit: this.timeUnitStore.selectedId(),
            length: this.data.payment.length,
            total: this.data.payment.total,
            start: this.getStartDateRequest(),
            end: this.getEndDateRequest(),
            userId: this.userStore.selectedId(),
            assetId: this.assetStore.selectedAssetPubId(),
            companyId: this.companyStore.selectedCompanyPubId(),
            paymentPlanId: this.paymentPlanStore.selectedId()
        }).then((r) => {
            this.data.isSaving = false

            this.cancel()
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

    private getStartDateRequest() {
        return formatISO(new Date(format(this.data.startDate, "yyyy-MM-dd") + " " + this.getStartHour()));
    }

    private getEndDateRequest() {
        if (this.timeUnitStore.selectedId() === "HOUR") {
            return formatISO(new Date(format(this.data.startDate, "yyyy-MM-dd") + " " + this.getEndHour()));
        } else {
            return formatISO(new Date(format(this.data.endDate, "yyyy-MM-dd") + " " + this.getEndHour()));
        }
    }

    private setLength = (e) => {
        let newValue = e.target.value
        newValue = newValue.replace(new RegExp("[^0-9\.]", "g"), "")

        this.data.payment.length = newValue ? parseInt(newValue) : 0
        if (this.data.payment.length <= 0) {
            this.data.payment.length = 1
        }

        this.calcEndDate()
        this.calcTotal()
    }

    private calcEndDate() {
        if (this.timeUnitStore.selectedId() === "HOUR") {
            this.data.endHour = this.data.startHour + this.data.payment.length - 1
            if (this.data.endHour > 24) {
                this.data.endHour = 24;
                this.data.payment.length = 24 - this.data.startHour
            }
        } else if (this.timeUnitStore.selectedId() === "DAY") {
            this.data.endDate = addDays(addDays(this.data.startDate, this.data.payment.length), -1)
        } else if (this.timeUnitStore.selectedId() === "MONTH") {
            this.data.endDate = addDays(addMonths(this.data.startDate, this.data.payment.length), -1)
        } else if (this.timeUnitStore.selectedId() === "YEAR") {
            this.data.endDate = addDays(addYears(this.data.startDate, this.data.payment.length), -1)
        }
    }


    private setPrice = (e) => {
        let newValue = e.target.value
        newValue = newValue.replace(new RegExp("[^0-9\.]", "g"), "")

        if (newValue.indexOf(".") === -1) {
            newValue += ".00"
        }

        if (newValue.indexOf(".") !== newValue.lastIndexOf(".")) {
            newValue = newValue.slice(0, newValue.lastIndexOf("."))
        }

        if (isNaN(newValue)) {
            newValue = newValue.slice(0, newValue.lastIndexOf("."))
        }

        newValue = (Math.round(parseFloat(newValue) * 100) / 100).toFixed(2);

        this.data.payment.price = newValue

        this.calcTotal()
        this.cleanPaymentPlanIfNotEqual()

        const caret = e.target.selectionStart
        const element = e.target

        window.requestAnimationFrame(() => {
            element.selectionStart = caret
            element.selectionEnd = caret
        })
    }

    private setStartDate = (d: Date) => {
        this.data.startDate = d;
        this.calcEndDate()
        this.calcTotal()
    }

    private setEndDate = (d: Date) => {
        this.data.endDate = d;
        this.timeUnitStore.selectUnitSilent("DAY")
        this.calcLength()
        this.calcTotal()
    }

    private getStartHour = () => {
        if (this.timeUnitStore.selectedId() === 'HOUR') {
            return (this.data.startHour < 10 ? "0" + this.data.startHour : this.data.startHour) + ":00"
        }

        return "00:00"
    }

    private getEndHour = () => {
        if (this.timeUnitStore.selectedId() === 'HOUR') {
            return (this.data.endHour < 10 ? "0" + this.data.endHour : this.data.endHour) + ":00"
        }

        return "23:59"
    }

    private setStartHour(h) {
        return () => {
            this.data.startHour = h
            this.calcLength()
            this.calcTotal()
        }
    }

    private setEndHour(h) {
        return () => {
            this.data.endHour = h
            this.calcLength();
            this.calcTotal()
        }
    }

    private calcLength() {
        if (this.timeUnitStore.selectedId() === "HOUR") {
            this.data.payment.length = this.data.endHour - this.data.startHour + 1
        }
        if (this.timeUnitStore.selectedId() === "DAY") {
            this.data.payment.length = differenceInCalendarDays(this.data.endDate, this.data.startDate) + 1
        }
        if (this.timeUnitStore.selectedId() === "MONTH") {
            this.data.payment.length = differenceInCalendarMonths(this.data.endDate, this.data.startDate) + 1
        }
        if (this.timeUnitStore.selectedId() === "YEAR") {
            this.data.payment.length = differenceInCalendarYears(this.data.endDate, this.data.startDate) + 1
        }

        if (this.data.payment.length < 1) {
            this.data.payment.length = 1
            this.calcEndDate();
        }
    }

    @subscribe(CHANGE_SELECTED_PAYMENT_PLAN_TOPIC)
    onChangeSelectedPaymentPlanLister() {
        let selectedPaymentPlan = this.paymentPlanStore.selectedPaymentPlan;
        if (selectedPaymentPlan) {
            this.data.payment.price = selectedPaymentPlan.price
            this.data.payment.length = 1;
            this.timeUnitStore.selectUnit(selectedPaymentPlan.unit)

            if (selectedPaymentPlan.assetPubId) {
                this.assetStore.selectAsset(selectedPaymentPlan.assetPubId, false)
            }

            this.calcTotal()
        }
    }

    @subscribe(TIME_UNIT_CHANGE_TOPIC)
    onChangeSelectedTimeUnitListener() {
        this.calcEndDate()
        this.cleanPaymentPlanIfNotEqual()
        this.calcTotal()
    }

    @subscribe(CHANGE_SELECTED_ASSET_TOPIC)
    onChangeSelectedAssetListener() {
        let selectedAsset = this.assetStore.selectedAsset
        if (selectedAsset) {
            paymentPlanApi().getPaymentPlanListUsingPOST({
                assetId: selectedAsset.pubId,
                locationPubId: this.locationStore.selectedLocationId
            }).then((r) => {
                if (r.data.length && r.data.length > 0) {
                    this.paymentPlanStore.select(r.data[0].pubId)
                } else {
                    let selectedPaymentPlan = this.paymentPlanStore.selectedPaymentPlan;

                    if (selectedPaymentPlan) {
                        if (selectedPaymentPlan.assetPubId
                            && selectedPaymentPlan.assetPubId !== selectedAsset.pubId
                        ) {
                            this.paymentPlanStore.select(null)
                        }
                    }
                }
            })
        }
    }

    @subscribe(CHANGE_SELECTED_COMPANY_TOPIC)
    onChangeSelectedCompanyListener() {
        let companyId = this.companyStore.selectedCompany?.pubId;
        this.selectCompany(companyId);
    }

    private selectCompany(companyId: string) {
        if (companyId) {
            this.userStore.select(null)

            paymentPlanApi().getPaymentPlanListUsingPOST({
                companyId: companyId,
                locationPubId: this.locationStore.selectedLocationId
            }).then((r) => {
                if (r.data.length && r.data.length > 0) {
                    this.paymentPlanStore.select(r.data[0].pubId)
                } else {
                    let selectedPaymentPlan = this.paymentPlanStore.selectedPaymentPlan;

                    if (selectedPaymentPlan) {
                        if (selectedPaymentPlan.companyPubId
                            && selectedPaymentPlan.companyPubId !== companyId
                        ) {
                            this.paymentPlanStore.select(null)
                        }
                    }
                }

                this.data.lastPaymentsLoading = true
                paymentApi().getPaymentListUsingPOST({
                    companyId: companyId,
                    offset: 0,
                    limit: 5
                }).then((r) => {
                    this.data.lastPaymentsLoading = false
                    this.data.lastPayments = r.data.list
                })
            })
        }else{
            this.data.lastPayments = []
        }
    }

    @subscribe(CHANGE_SELECTED_USER_TOPIC)
    onChangeSelectedUserListener() {
        let userId = this.userStore.selectedUser?.pubId;
        this.selectUser(userId);
    }

    private selectUser(userId: string) {
        if (userId) {
            this.companyStore.select(null)
            userApi().getUserUsingGET(userId).then((r) => {
                if (r.data.paymentPlanId) {
                    this.paymentPlanStore.select(r.data.paymentPlanId)
                }
            })

            this.data.lastPaymentsLoading = true
            paymentApi().getPaymentListUsingPOST({
                userId: userId,
                offset: 0,
                limit : 5
            }).then((r) => {
                this.data.lastPaymentsLoading = false
                this.data.lastPayments = r.data.list
            })
        }
    }

    private copyPayment(payment: Payment) {
        return () => {
            this.timeUnitStore.selectUnit(payment.unit)
            this.paymentPlanStore.select(payment.paymentPlanId)
            this.data.payment.price = payment.price
            this.data.payment.length = payment.length
            this.locationStore.selectLocation(payment.location.pubId)
            this.timeUnitStore.selectUnit(payment.unit)
            this.assetStore.selectAsset(payment.assetId, false)
            this.userStore.select(payment.userId, false)
            this.companyStore.select(payment.companyId, false)

            this.calcEndDate()
            this.calcTotal()
        }
    }

    render() {
        const lastPayments = this.data.lastPayments.map((payment) =>
            <tr key={payment.pubId}>
                <td>{payment.assetName}</td>
                <td>{payment.paymentPlanName}</td>
                <td className="text-nowrap text-right">{payment.total}</td>
                <td className="text-nowrap"> {formatDate(payment.start)} </td>
                <td className="text-nowrap">{formatDate(payment.end)}</td>
                <td className="text-right">
                    <Button variant="light"
                            onClick={this.copyPayment(payment)}
                    >Копировать</Button>
                </td>
            </tr>
        );
        return (
            <div className="payment-form">
                <MainMenu/>
                <h4>Платеж</h4>
                <Form className={style.paymentForm}>
                    <Form.Group>
                        <Form.Label>Локация:</Form.Label>
                        <LocationSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Объект аренды:</Form.Label>
                        <AssetSelect withEmpty={false}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Резидент:</Form.Label>
                        <UserSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Организация:</Form.Label>
                        <CompanySelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Тариф:</Form.Label>
                        <PaymentPlanSelect/>
                    </Form.Group>
                    <Form.Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Доступ от:</Form.Label>
                                            <InputGroup className="mb-3 start">
                                                <ReactDatePicker
                                                    dateFormat="dd.MM.yyyy"
                                                    className="top__input top__input--select input input--select"
                                                    placeholderText=""
                                                    selected={this.data.startDate}
                                                    onChange={this.setStartDate}/>
                                                {this.timeUnitStore.selectedId() === 'HOUR' ?
                                                    <DropdownButton
                                                        variant="outline-secondary"
                                                        title={this.getStartHour()}
                                                    >
                                                        {WORK_HOURS.map(h =>
                                                            <Dropdown.Item
                                                                key={h}
                                                                onClick={this.setStartHour(h)}
                                                            >
                                                                {h < 10 ? "0" + h : h}:00
                                                            </Dropdown.Item>
                                                        )}
                                                    </DropdownButton>
                                                    : <></>
                                                }
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>До:</Form.Label>
                                            <InputGroup className="mb-3 start">
                                                {this.timeUnitStore.selectedId() !== 'HOUR' ?
                                                    <ReactDatePicker
                                                        dateFormat="dd.MM.yyyy"
                                                        className="top__input top__input--select input input--select"
                                                        placeholderText=""
                                                        selected={this.data.endDate}
                                                        onChange={this.setEndDate}/>
                                                    : <></>}
                                                {this.timeUnitStore.selectedId() === 'HOUR' ?
                                                    <DropdownButton
                                                        variant="outline-secondary"
                                                        title={this.getEndHour()}
                                                    >
                                                        {WORK_HOURS.map(h =>
                                                            <Dropdown.Item
                                                                key={h}
                                                                onClick={this.setEndHour(h)}
                                                            >
                                                                {h < 10 ? "0" + h : h}:00
                                                            </Dropdown.Item>
                                                        )}
                                                    </DropdownButton>
                                                    : <></>
                                                }
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>
                                <Form.Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>
                                                Количество:
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="1"
                                                value={this.data.payment.length}
                                                onChange={this.setLength}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>Длительность:</Form.Label>
                                            <TimeUnitSelect/>
                                        </Form.Group>
                                    </Col>
                                </Form.Row>

                                <Form.Group>
                                    <Form.Label>
                                        Цена:
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="100.00"
                                        value={this.data.payment.price}
                                        onChange={this.setPrice}
                                    />
                                </Form.Group>
                                {this.paymentPlanStore?.selectedPaymentPlan?.assumption?.workTimeRanges?.length > 0 ?
                                    <Form.Group>
                                        <Form.Label>Стоимость:</Form.Label>
                                        <table className={style.space__table}>
                                            <tbody>
                                            {this.paymentPlanStore.selectedPaymentPlan.assumption.workTimeRanges
                                                .filter(wtr => !wtr.isWeekend)
                                                .map((wtr, index) =>
                                                    <tr key={index} className={style.space__row}>
                                                        <td className={style.space__cell}>
                                                            будни&nbsp;
                                                            <span>{wtr.start} &ndash; {wtr.end}</span>
                                                        </td>
                                                        <td className={style.space__cell}>{numberFormat(wtr.price)}р/час</td>
                                                    </tr>
                                                )
                                            }
                                            {this.paymentPlanStore.selectedPaymentPlan.assumption.workTimeRanges
                                                .filter(wtr => wtr.isWeekend)
                                                .map((wtr, index) =>
                                                    <tr key={index + 1000} className={style.space__row}>
                                                        <td className={style.space__cell}>
                                                            выходной:&nbsp;
                                                            <span>{wtr.start} &ndash; {wtr.end}</span>
                                                        </td>
                                                        <td className={style.space__cell}>{numberFormat(wtr.price)}р/час</td>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                        </table>
                                    </Form.Group>
                                    : (<></>)
                                }
                                <Form.Group>
                                    <Form.Label>Всего:</Form.Label>
                                    <div>
                                        {this.data.payment.total}
                                    </div>
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
                                        Создать
                                        {this.data.isSaving &&
                                        <Spinner animation="grow" as="span" size="sm" role="status"/>
                                        }
                                    </Button>
                                </Form.Group>
                </Form>

                {this.userStore.selectedUser || this.companyStore.selectedCompany
                    ? <Table striped={true} bordered={true} hover>
                        <thead>
                        <tr>
                            <th>Объект аренды</th>
                            <th>Тариф</th>
                            <th>Сумма</th>
                            <th>От</th>
                            <th>До</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>

                        {this.data.lastPaymentsLoading ?
                            <tr>
                                <td colSpan={7}><Spinner size="sm" animation="grow"/></td>
                            </tr>
                            : lastPayments
                        }
                        </tbody>
                    </Table>
                    : <></>
                }
            </div>
        );
    }
}
