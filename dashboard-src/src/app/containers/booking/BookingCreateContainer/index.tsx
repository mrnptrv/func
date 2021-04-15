import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import * as style from "app/containers/style.css";
import {ru_RU} from "app/constants/locale_ru";
import ReactDatePicker from "react-datepicker";
import {AssetSelect} from "app/components/AssetSelect";
import {bookingApi, paymentPlanApi} from "app/constants";
import format from "date-fns/format";
import {ASSET_STORE} from "app/store/AssetStore";
import {Asset, BookedAsset, PaymentPlan} from "app/api";
import {LOCATION_STORE} from "app/store/LocationStore";
import {UserSelect} from "app/components/UserSelect";
import {CHANGE_SELECTED_USER_TOPIC, USER_STORE} from "app/store/UserStore";
import {eventBus, subscribe} from "mobx-event-bus2";


class BookingCreateData {
    @observable isBookingLoading = true
    @observable isSaving = false
    @observable bookingDate = new Date()
    @observable workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
    @observable paymentPlan: PaymentPlan = null
    @observable bookingHour: number = 0
    @observable bookingHourAmount = 0
    @observable bookingPrice = 0
    @observable description = ""
    @observable error = ""
    @observable fieldErrors: Array<String> = new Array<String>()
}

class WorkTimeHour {
    @observable asset: Asset = null
    @observable hour = 0
    @observable booked = false
    @observable price = 0
}

@observer
export class BookingCreateContainer extends React.Component<any, any> {
    private data = new BookingCreateData()
    private assetStore = ASSET_STORE
    private locationStore = LOCATION_STORE
    private userStore = USER_STORE

    constructor(props: any, context: any) {
        super(props, context);

        eventBus.register(this)

        this.data.bookingDate = new Date(this.props.match.params.day)
        this.data.bookingHour = +(this.props.match.params.hour)
        this.data.bookingHourAmount = 1
        this.locationStore.selectLocation(this.props.match.params.locationId);
        this.assetStore.selectAsset(this.props.match.params.assetId);

        this.assetStore.loadAssets().then(() => {
            return this.loadPaymentPlan()
        }).then(() => {
            return this.userStore.loadUsers()
        }).then(() => {
            this.data.isBookingLoading = false
        }).catch(error => {
            this.data.isBookingLoading = false

            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }
        })
    }

    @subscribe(CHANGE_SELECTED_USER_TOPIC)
    onChangeSelectedUserListener() {
        let selectedUser = this.userStore.selectedUser;

        if (selectedUser) {
           this.loadPaymentPlan()
        }
    }

    private loadPaymentPlan() {
        const f = () => {
            if (this.userStore.selectedId() && this.assetStore.selectedAsset.paymentPlanId) {
                return paymentPlanApi()
                    .minPaymentPlanUsingPOST({
                        assetId: this.assetStore.selectedAssetPubId(),
                        uid: this.userStore.selectedId(),
                        date: format(this.data.bookingDate, "yyyy-MM-dd")
                    })
            }

            if (this.assetStore.selectedAsset.paymentPlanId) {
                return paymentPlanApi()
                    .getPaymentPlanUsingGET(this.assetStore.selectedAsset.paymentPlanId)
            }

            return Promise.resolve(null)
        };

        return f().then((res) => {
            this.data.paymentPlan = res?.data
        }).then(() => {
            return this.loadBooked()
        })
    }

    cancel = () => {
        this.props.history.push("/dashboard/booking")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        let start = this.getStartHour();
        let end = this.getEndHour();

        bookingApi().bookUsingPOST({
            assetId: this.assetStore.selectedAssetPubId(),
            date: format(this.data.bookingDate, "yyyy-MM-dd"),
            uid: this.userStore.selectedId(),
            userData: null,
            description: this.data.description,
            start: start,
            end: end
        }).then((res) => {
            this.data.isSaving = false

            this.props.history.push("/dashboard/booking")
        }).catch((error) => {
            this.data.isSaving = false

            if (error && error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            if (error && error.response && error.response.data.errors) {
                this.data.fieldErrors = error.response.data.errors.map(e => e.messages).flat()
            }

            console.error(error.response.data);
        })
    }

    private getEndHour() {
        let endHour = this.data.bookingHour + this.data.bookingHourAmount
        return (endHour < 10 ? ("0" + endHour) : "" + endHour) + ":00";
    }

    private getStartHour() {
        return (this.data.bookingHour < 10 ? ("0" + this.data.bookingHour) : "" + this.data.bookingHour) + ":00";
    }

    private setDescription(description) {
        this.data.description = description
    }

    private loadBooked() {
        return bookingApi().findBookedAssetsUsingPOST({
            date: format(this.data.bookingDate, "yyyy-MM-dd"),
            assetId: this.assetStore.selectedAssetPubId(),
        }).then((r) => {
            this.data.workTimeHours = this.calculateWorkTimeHours()
            this.markWorkTimeHoursBooked(r.data)
            this.manageBookingHourAmount()
        })
    }

    private manageBookingHourAmount() {
        if (this.data.bookingHourAmount <= 0) {
            this.data.bookingHourAmount = 1
        }

        if (this.data.workTimeHours.length > 0) {
            let maxHour = this.data.workTimeHours[0].hour

            for (let i = 0; i < this.data.workTimeHours.length; i++) {
                let wth = this.data.workTimeHours[i]

                if (wth.hour < this.data.bookingHour) {
                    continue
                }

                if (wth.booked) {
                    break
                }

                if (wth.hour > maxHour) {
                    maxHour = wth.hour
                }
            }

            if (maxHour < (this.data.bookingHour + this.data.bookingHourAmount)) {
                this.data.bookingHourAmount = maxHour - this.data.bookingHour + 1
            }
        }
        this.calculatePrice()
    }

    private calculatePrice = () => {
        let startHour = this.data.bookingHour
        let endHour = this.data.bookingHour + this.data.bookingHourAmount

        let prices = this.data.workTimeHours
            .filter(wtr => wtr.hour >= startHour && wtr.hour < endHour)
            .map(wtr => wtr.price);

        this.data.bookingPrice = prices.length == 0 ? 0 :
            prices.reduce((prevPrice, currentPrice) => prevPrice + currentPrice)
    }

    private markWorkTimeHoursBooked(bookedAssets: Array<BookedAsset>) {
        this.data.workTimeHours
            .forEach(wth => {
                wth.booked = false
            })

        bookedAssets.forEach(b => {
            if (b.asset.pubId === this.assetStore.selectedAssetPubId()) {

                let startHour = this.getHour(b.start)
                let endHour = this.getHour(b.end)

                this.data.workTimeHours
                    .filter(wth => startHour <= wth.hour && wth.hour < endHour)
                    .forEach(wth => {
                        wth.booked = true
                    })
            }
        })
    }

    private getHour(s) {
        let a = s.split(":")
        return +(a[0] as number)
    }

    private calculateWorkTimeHours() {
        let workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
        let isWeekend = this.data.bookingDate.getDay() === 6 || this.data.bookingDate.getDay() === 0;

        let a = this.assetStore.selectedAsset
        let pp = this.data.paymentPlan
        let workTimeRanges = pp?.assumption?.workTimeRanges?.filter(wtr => wtr.isWeekend == isWeekend)

        if (workTimeRanges?.length > 0) {
            let minStartHour = this.getHour(workTimeRanges[0].start);
            let maxEndHour = this.getHour(workTimeRanges[0].end);

            workTimeRanges.forEach(wtr => {
                if (wtr.isWeekend == isWeekend) {
                    let startHour: number = this.getHour(wtr.start)
                    let endHour = this.getHour(wtr.end)

                    if (minStartHour > startHour) {
                        minStartHour = startHour
                    }

                    if (maxEndHour < endHour) {
                        maxEndHour = endHour
                    }
                }
            })

            for (let h = minStartHour; h < maxEndHour; h++) {
                let wth = new WorkTimeHour()
                wth.asset = a
                wth.hour = h

                let workTimeRangesPr1 = workTimeRanges.filter(wtr => {
                    let startHour: number = this.getHour(wtr.start)
                    let endHour = this.getHour(wtr.end)
                    return startHour <= h && h < endHour
                });

                wth.price = workTimeRangesPr1.length == 0 ? 0 : +workTimeRangesPr1[0].price

                workTimeHours.push(wth);
            }
        }

        return workTimeHours
    }

    private setBookingDate = (d: Date) => {
        this.data.bookingDate = d;
        this.loadBooked().then(() => {
        })
    }

    private selectHour(h) {
        this.data.bookingHour = h
        this.manageBookingHourAmount()
    }

    private setHourAmount(h) {
        this.data.bookingHourAmount = h
        this.manageBookingHourAmount()
    }


    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Бронирование</h4>
                {this.data.isBookingLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Label>Объект аренды:</Form.Label>
                            <AssetSelect withEmpty={false}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Дата:</Form.Label>
                            <ReactDatePicker
                                locale={ru_RU}
                                dateFormat="dd.MM.yyyy"
                                className="top__input top__input--select input input--select"
                                placeholderText="Дата"
                                selected={this.data.bookingDate}
                                onChange={this.setBookingDate}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Время:</Form.Label>
                            <Form.Control
                                as="select"
                                value={this.data.bookingHour}
                                onChange={(e) => this.selectHour(+e.target.value)}
                            >
                                {this.data.workTimeHours.map(wtr =>
                                    (wtr.booked ?
                                            <option disabled key={wtr.hour}
                                                    value={wtr.hour}>{wtr.hour < 10 ? "0" + wtr.hour : wtr.hour}:00</option>
                                            :
                                            <option
                                                key={wtr.hour}
                                                value={wtr.hour}>{wtr.hour < 10 ? "0" + wtr.hour : wtr.hour}:00</option>
                                    )
                                )}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Количество часов:</Form.Label>
                            <Form.Control
                                type="number"
                                value={this.data.bookingHourAmount}
                                onChange={(e) => this.setHourAmount(+e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Резидент:</Form.Label>
                            <UserSelect/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Описание:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={this.data.description}
                                onChange={(e) => this.setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Стоимость:</Form.Label>
                            <Form.Control readOnly
                                          value={this.data.bookingPrice + "р"}
                                          onChange={(e) => {
                                          }}
                            />
                        </Form.Group>
                        <Form.Group>
                            {this.data.error &&
                            <Alert variant="danger">
                                {this.data.error}
                                {this.data.fieldErrors.length ?
                                    (<ul>{this.data.fieldErrors.map(e => <li>{e}</li>)}</ul>)
                                    : (<></>)
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
                }
            </div>
        );
    }
}
