import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import ReactDatePicker from "react-datepicker";
import {Asset, BookedAsset, Booking, PaymentPlan} from "app/api/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import {assetsApi, bookingApi, paymentPlanApi} from "app/constants";
import format from "date-fns/format";
import {getStatusName, ru_RU} from "app/constants/locale_ru";
import {MainMenu} from "app/components";


class BookingEditData {
    @observable isBookingLoading = true
    @observable error = ""
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable bookingDate = new Date()
    @observable booking: Booking = null
    @observable paymentPlan: PaymentPlan = null
    @observable assetList: Array<Asset> = new Array<Asset>()
    @observable isSaving = false

    @observable workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
    @observable bookingHour = 0
    @observable bookingHourAmount = 0
    @observable bookingPrice = 0
}

class WorkTimeHour {
    @observable asset: Asset = null
    @observable hour = 0
    @observable booked = false
    @observable price = 0
}

@observer
export class BookingEditContainer extends React.Component<any, any> {
    private data = new BookingEditData()

    cancel = () => {
        this.props.history.push("/dashboard/booking")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        let start = this.getStartHour();
        let end = this.getEndHour();

        bookingApi().updateUsingPOST1({
            bookingId: this.data.booking.pubId,
            assetId: this.data.booking.asset.pubId,
            date: format(this.data.bookingDate, "yyyy-MM-dd"),
            start: start,
            end: end,
            phone: this.data.booking.userData.phone,
            name: this.data.booking.userData.name,
            description: this.data.booking.description
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

        this.data.isBookingLoading = true

        bookingApi().getUsingGET2(this.props.match.params.id).then(res => {
            this.data.booking = res.data
            this.data.bookingDate = new Date(this.data.booking.date)
            this.data.bookingHour = this.getHour(this.data.booking.start)
            this.data.bookingHourAmount = this.getHour(this.data.booking.end) - this.data.bookingHour
        }).then(() => {
            return assetsApi().assetsListUsingPOST({})
        }).then((res) => {
            this.data.assetList = res.data
        }).then((res) => {
            if (this.data.booking.asset.paymentPlanId) {
                return paymentPlanApi().getPaymentPlanUsingGET(this.data.booking.asset.paymentPlanId)
            }
            return null
        }).then((res) => {
            this.data.paymentPlan = res?.data
        }).then(() => {
            return this.loadBooked()
        }).then(() => {
            this.data.isBookingLoading = false
        }).catch(error => {
            this.data.isBookingLoading = false

            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }
        })
    }

    private loadBooked() {
        return bookingApi().findBookedAssetsUsingPOST({
            date: format(this.data.bookingDate, "yyyy-MM-dd"),
            assetId: this.data.booking.asset.pubId,
            withoutBookingId: this.data.booking.pubId
        }).then((r) => {
            this.data.workTimeHours = this.calculateWorkTimeHours()
            this.markWorkTimeHoursBooked(r.data)
            this.manageBookingHourAmount()
        })
    }

    private markWorkTimeHoursBooked(bookedAssets: Array<BookedAsset>) {
        this.data.workTimeHours
            .forEach(wth => {
                wth.booked = false
            })

        bookedAssets.forEach(b => {
            if (b.asset.pubId === this.data.booking.asset.pubId) {

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

    private calculatePrice = () => {
        let startHour = this.data.bookingHour
        let endHour = this.data.bookingHour + this.data.bookingHourAmount

        let prices = this.data.workTimeHours
            .filter(wtr => wtr.hour >= startHour && wtr.hour < endHour)
            .map(wtr => wtr.price);

        this.data.bookingPrice = prices.length == 0 ? 0 :
            prices.reduce((prevPrice, currentPrice) => prevPrice + currentPrice)
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

    private getEndHour() {
        let endHour = this.data.bookingHour + this.data.bookingHourAmount
        return (endHour < 10 ? ("0" + endHour) : "" + endHour) + ":00";
    }

    private getStartHour() {
        return (this.data.bookingHour < 10 ? ("0" + this.data.bookingHour) : "" + this.data.bookingHour) + ":00";
    }

    private selectAsset(pubId) {
        this.data.booking.asset = this.data.assetList.filter(a => a.pubId === pubId)[0]
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

    private setBookingDate = (d: Date) => {
        this.data.bookingDate = d;
        this.loadBooked().then(() => {
        })
    }

    private getHour(s) {
        let a = s.split(":")
        return +(a[0] as number)
    }

    private setName(name) {
        this.data.booking.userData.name = name
    }

    private setPhone(phone) {
        let newValue = phone
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

        this.data.booking.userData.phone = formattedValue
    }

    private setDescription(description) {
        this.data.booking.description = description
    }

    private calculateWorkTimeHours() {
        let workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
        let isWeekend = this.data.bookingDate.getDay() === 6 || this.data.bookingDate.getDay() === 0;

        let a = this.data.booking.asset
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

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Бронирование</h4>
                {this.data.isBookingLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Label>Статус:</Form.Label>
                            <Form.Control readOnly
                                          value={getStatusName(this.data.booking.status) + " (" + this.data.bookingPrice + "р)"}
                                          onChange={(e) => {
                                          }}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Ресурс:</Form.Label>
                            <Form.Control
                                as="select"
                                value={this.data.booking.asset.pubId}
                                onChange={(e) => this.selectAsset(e.target.value)}
                            >
                                {this.data.assetList.map(a => {
                                    return <option
                                        key={a.pubId}
                                        value={a.pubId}
                                    >{a.name}</option>
                                })}
                            </Form.Control>
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
                            <Form.Label>ФИО:</Form.Label>
                            <Form.Control
                                type="text"
                                value={this.data.booking.userData.name}
                                onChange={(e) => this.setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Телефон:</Form.Label>
                            <Form.Control
                                type="text"
                                value={this.data.booking.userData.phone}
                                onChange={(e) => this.setPhone(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Описание:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={this.data.booking.description}
                                onChange={(e) => this.setDescription(e.target.value)}
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
