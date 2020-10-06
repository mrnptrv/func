import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {Asset, BookedAsset} from "../../../api";
import Carousel from '@brainhubeu/react-carousel';
import Modal from 'react-modal';
import ReactDatePicker from "react-datepicker";
import {bookingApi} from "app/constants";
import * as moment from "moment";
import {numberFormat} from "app/constants/numberFormat";

class AssetItemData {
    @observable carouselValue = 0
    @observable asset: Asset = {
        pubId: "",
        name: "",
        description: "",
        capacity: 0,
        type: "",
        imageUrls: ["1", "2"],
        workTimeRanges: []
    }
    @observable date = new Date()
    @observable workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
    @observable isOpenBookingModal = false
    @observable bookingWorkTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
    @observable bookingDate = new Date()
    @observable bookingHour = 0
    @observable bookingHourAmount = 1
    @observable bookingName = ""
    @observable bookingPhone = "+7 ("
    @observable bookingDescription = ""
    @observable bookingAgreementCheck = false
    @observable bookingButtonDisabled = true
    @observable bookingPrice = 0
    @observable bookingHidePrice = false;
    @observable bookingHideBooking = false;
}

interface AssetItemProps {
    asset: Asset,
    bookingDate: Date
    bookedAsset: Array<BookedAsset>
}

class WorkTimeHour {
    @observable asset: Asset = null
    @observable hour = 0
    @observable booked = false
    @observable price = 0
}

@observer
export class AssetItem extends React.Component<AssetItemProps, any> {
    private data = new AssetItemData()

    constructor(props: AssetItemProps, context: any) {
        super(props, context);

        moment.locale("ru")

        this.data.asset = this.props.asset
        this.data.date = this.props.bookingDate
        this.data.bookingDate = this.props.bookingDate

        let workTimeHours: Array<WorkTimeHour> = this.calculateWorkTimeHours();
        this.data.workTimeHours = workTimeHours
        this.data.bookingWorkTimeHours = workTimeHours


        this.markWorkTimeHoursBooked(this.props.bookedAsset)
        this.calculatePrice()
    }

    private getHour = (s) => {
        let a = s.split(":")
        return +(a[0] as number)
    }

    private calculateWorkTimeHours() {
        let workTimeHours: Array<WorkTimeHour> = new Array<WorkTimeHour>()
        let isWeekend = this.data.bookingDate.getDay() === 6 || this.data.bookingDate.getDay() === 0;

        let a = this.data.asset
        let workTimeRanges = a.workTimeRanges.filter(wtr => wtr.isWeekend == isWeekend)

        if (workTimeRanges.length > 0) {
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
                    return startHour <= h && h <= endHour
                });

                wth.price = workTimeRangesPr1.length == 0 ? 0 : +workTimeRangesPr1[0].price

                workTimeHours.push(wth);
            }
        }

        return workTimeHours
    }

    private calculatePrice = () => {
        let startHour = this.data.bookingHour
        let endHour = this.data.bookingHour + this.data.bookingHourAmount
        let prices = this.data.bookingWorkTimeHours
            .filter(wtr => wtr.hour >= startHour && wtr.hour < endHour)
            .map(wtr => wtr.price);

        this.data.bookingPrice = prices.length == 0 ? 0 :
            prices.reduce((prevPrice, currentPrice) => prevPrice + currentPrice)
    }

    private toggleHidePrice = () => {
        this.data.bookingHidePrice = !this.data.bookingHidePrice
    }

    private toggleHideBooking = () => {
        this.data.bookingHideBooking = !this.data.bookingHideBooking
    }

    private openBookModal = (hour) => {
        return () => {
            this.data.isOpenBookingModal = true
            this.data.bookingHour = hour
            this.data.bookingHourAmount = 1
            this.data.bookingName = ""
            this.data.bookingPhone = "+7 ("
            this.data.bookingDescription = ""
            this.data.bookingAgreementCheck = false
            this.calculatePrice()
        }
    }

    private bookAsset = () => {
        let start = this.getStartHour();
        let end = this.getEndHour();

        bookingApi().bookUsingPOST({
            assetId: this.data.asset.pubId,
            date: (moment(this.data.bookingDate)).format("yyyy-MM-DD"),
            name: this.data.bookingName,
            phone: this.data.bookingPhone,
            description: this.data.bookingDescription,
            start: start,
            end: end
        }).then((r) => {
            this.closeModal()
            bookingApi().findBookedAssetsUsingPOST({
                date: (moment(this.data.date)).format("yyyy-MM-DD"),
                assetId: this.data.asset.pubId
            }).then(r => {
                let bookedAssets = r.data;
                this.markWorkTimeHoursBooked(bookedAssets);
            }).catch(e => {
                console.error(e.response.data);
            })
        }).catch((e) => {
            console.error(e.response.data);
        })
    }

    private markWorkTimeHoursBooked(bookedAssets: Array<BookedAsset>) {
        this.data.workTimeHours
            .forEach(wth => {
                wth.booked = false
            })

        bookedAssets.forEach(b => {
            if (b.asset.pubId === this.data.asset.pubId) {

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

    private getEndHour() {
        let endHour = this.data.bookingHour + this.data.bookingHourAmount
        let end = (endHour < 10 ? ("0" + endHour) : "" + endHour) + ":00";
        return end;
    }

    private getStartHour() {
        return (this.data.bookingHour < 10 ? ("0" + this.data.bookingHour) : "" + this.data.bookingHour) + ":00";
    }

    private carouselPrev = () => {
        if (this.data.carouselValue === 0) {
            this.data.carouselValue = this.data.asset.imageUrls.length - 1
        } else {
            this.data.carouselValue--
        }
    }

    private carouselNext = () => {
        if (this.data.carouselValue === this.data.asset.imageUrls.length - 1) {
            this.data.carouselValue = 0
        } else {
            this.data.carouselValue++
        }
    }

    private setBookingHour = (e) => {
        this.data.bookingHour = +e.target.value
        this.manageBookingHourAmount()
        this.calculatePrice()
    }

    private setBookingHourAmount = (e) => {
        this.data.bookingHourAmount = +e.target.value
        this.manageBookingHourAmount();
    }

    private increaseBookingHourAmount = () => {
        this.data.bookingHourAmount++
        this.manageBookingHourAmount()
    }

    private decreaseBookingHourAmount = () => {
        this.data.bookingHourAmount--
        this.manageBookingHourAmount()
    }

    private enableBookingButton = () => {
        let nameValid = this.data.bookingName.length > 0
        let phoneValid = this.data.bookingPhone.length == 18

        this.data.bookingButtonDisabled = !(nameValid && phoneValid && this.data.bookingAgreementCheck)
    }

    private manageBookingHourAmount() {
        if (this.data.bookingHourAmount <= 0) {
            this.data.bookingHourAmount = 1
        }

        let maxHour = 0;
        if (this.data.bookingWorkTimeHours.length > 0) {
            maxHour = this.data.bookingWorkTimeHours[0].hour

            this.data.bookingWorkTimeHours.forEach((wth) => {
                if (wth.hour > maxHour) {
                    maxHour = wth.hour
                }
            })

            if (maxHour <= (this.data.bookingHour + this.data.bookingHourAmount)) {
                this.data.bookingHourAmount = maxHour - this.data.bookingHour + 1;
            }
        }

        this.calculatePrice()
    }

    private setBookingName = (e) => {
        this.data.bookingName = e.target.value
        this.enableBookingButton()
    }

    private setBookingDescription = (e) => {
        this.data.bookingDescription = e.target.value
    }

    private setBookingPhone = (e) => {
        let newValue = e.target.value
        newValue = newValue.replace(new RegExp("[^0-9]", "g"), "")


        let formatedValue = "+" + newValue.slice(0, 1)

        if (newValue.length > 1) {
            formatedValue += " (" + newValue.slice(1, 4)
        }

        if (newValue.length > 4) {
            formatedValue += ") " + newValue.slice(4, 7)
        }

        if (newValue.length > 7) {
            formatedValue += "-" + newValue.slice(7, 9)
        }

        if (newValue.length > 9) {
            formatedValue += "-" + newValue.slice(9, 11)
        }

        this.data.bookingPhone = formatedValue

        this.enableBookingButton()
    }

    private setBookingAgreementCheck = () => {
        this.data.bookingAgreementCheck = !this.data.bookingAgreementCheck
        this.enableBookingButton()
    }

    private closeModal = () => {
        this.data.isOpenBookingModal = false
    }

    private setBookingDate = (d: Date) => {
        this.data.bookingDate = d;
        this.data.bookingWorkTimeHours = this.calculateWorkTimeHours()
        this.calculatePrice()
    }

    render() {

        return (
            <article className="space" role="article">
                <div className="space__info">
                    <div className="space__slider glide" id="space-slider-1">
                        <div className="space__track glide__track" data-glide-el="track">
                            <Carousel
                                value={this.data.carouselValue}
                                onChange={v => this.data.carouselValue = v}
                                infinite={true}
                            >
                                {this.data.asset.imageUrls.map((s, index) =>
                                    <img className="space__pic" key={index} src={s} width={808}
                                         height={464} alt=""/>
                                )}
                            </Carousel>
                        </div>
                        <div className="space__footer slider-footer">
                            <div className="space__counter slider-footer__counter">
                                <span className="slider-footer__index">{this.data.carouselValue + 1}</span>/<span
                                className="slider-footer__total">{this.data.asset.imageUrls.length}</span>
                            </div>
                            <div className="space__controls slider-footer__controls" data-glide-el="controls">
                                <button
                                    className="space__control slider-footer__arrow slider-control slider-control--left circle-button unbutton"
                                    data-glide-dir="<"
                                    onClick={this.carouselPrev}
                                >
                                    <span className="visually-hidden">Листать назад</span>
                                    <svg width="16" height="16">
                                        <use xlinkHref="#arrow-left"/>
                                    </svg>
                                </button>
                                <button
                                    className="space__control slider-footer__arrow slider-control slider-control--right circle-button unbutton"
                                    data-glide-dir=">"
                                    onClick={this.carouselNext}
                                >
                                    <svg width="16" height="16">
                                        <use xlinkHref="#arrow-right"/>
                                    </svg>
                                    <span className="visually-hidden">Листать вперёд</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space__description">
                        <h2 className="space__headline headline">
                            <span>Переговорная</span>
                            {this.data.asset.name}
                        </h2>
                        <p className="space__text">{this.data.asset.description}</p>
                        <div
                            className={"space__accordion space__accordion--price " + (this.data.bookingHidePrice ? "space__accordion--closed " : "")}>
                            <button className="space__button unbutton"
                                    onClick={this.toggleHidePrice}
                            >Стоимость
                            </button>
                            <table className="space__table space__accordion-content">
                                <tbody>
                                {this.data.asset.workTimeRanges
                                    .filter(wtr => !wtr.isWeekend)
                                    .map((wtr, index) =>
                                        <tr key={index} className="space__row">
                                            <td className="space__cell">Будни {wtr.start} &ndash; {wtr.end}</td>
                                            <td className="space__cell space__cell--price">{numberFormat(wtr.price)}₽/час</td>
                                        </tr>
                                    )
                                }
                                {this.data.asset.workTimeRanges
                                    .filter(wtr => wtr.isWeekend)
                                    .map((wtr, index) =>
                                        <tr key={index + 1000} className="space__row">
                                            <td className="space__cell">Выходные {wtr.start} &ndash; {wtr.end}</td>
                                            <td className="space__cell space__cell--price">{numberFormat(wtr.price)}₽/час</td>
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className={"space__accordion " + (this.data.bookingHideBooking ? "space__accordion--closed " : "")}>
                    <button className="space__button space__button--booking unbutton"
                            onClick={this.toggleHideBooking}
                    >Бронирование</button>
                    <div className="space__list space__accordion-content">
                        {this.data.workTimeHours.map(h =>
                            <button key={h.hour}
                                    className="space__time-option apply-button unbutton"
                                    onClick={this.openBookModal(h.hour)}
                                    disabled={h.booked}
                            >
                                {h.hour < 10 ? "0" + h.hour : h.hour}:00
                            </button>
                        )}
                    </div>
                </div>
                <Modal
                    isOpen={this.data.isOpenBookingModal}
                    onRequestClose={() => this.data.isOpenBookingModal = false}
                    contentLabel="Example Modal"
                >
                    <div className="popup popup--shown">
                        <div className="popup__form pageclip-form "
                             id="apply-form"
                        >
                            <div className="popup__top">
                                <h2 className="popup__headline">Бронирование</h2>
                                <button className="popup__close unbutton" id="apply-close" type="button"
                                        onClick={this.closeModal}
                                >
                                    <span className="visually-hidden">Закрыть модальное окно</span>
                                    <svg width="16" height="16">
                                        <use xlinkHref="#x"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="popup__info">
                                <div className="popup__summary">
                                    <img className="popup__pic" src="/img/rooms/rooms-metallica-1.jpg"
                                         width={65}
                                         height={44}
                                         alt=""/>
                                    <div className="popup__description">
                                        <p className="popup__accent">{this.data.asset.name}</p>
                                        <p className="popup__text">
                                            <span
                                                id="popup-selected-date">{(moment(this.data.bookingDate)).format("DD MMMM YYYY")}</span>,
                                            <span
                                                id="popup-selected-time"> {this.getStartHour()} - {this.getEndHour()}</span>
                                        </p>
                                    </div>
                                    <div className="popup__price">
                                        <p className="popup__text">К оплате:</p>
                                        <p className="popup__accent">{this.data.bookingPrice}₽</p>
                                    </div>
                                </div>
                                <div className="popup__selects">
                                    <div className="popup__group group">
                                        <ReactDatePicker
                                            dateFormat="dd/MM/yyyy"
                                            className="top__input top__input--select input input--select"
                                            placeholderText="Дата"
                                            selected={this.data.bookingDate}
                                            onChange={this.setBookingDate}/>

                                        <label className="popup__label label" htmlFor="popup-date">Дата</label>
                                        <svg width="16" height="16" fill="none">
                                            <use xlinkHref="#angle-arrow-down"/>
                                        </svg>
                                    </div>
                                    <div className="popup__group group">
                                        <select className="popup__input popup__input--select input input--select"
                                                id="popup-time"
                                                value={this.data.bookingHour}
                                                onChange={this.setBookingHour}
                                        >
                                            {this.data.bookingWorkTimeHours.map(wtr =>
                                                (wtr.booked ?
                                                        <option disabled key={wtr.hour}
                                                                value={wtr.hour}>{wtr.hour < 10 ? "0" + wtr.hour : wtr.hour}:00</option>
                                                        :
                                                        <option
                                                            key={wtr.hour}
                                                            value={wtr.hour}>{wtr.hour < 10 ? "0" + wtr.hour : wtr.hour}:00</option>
                                                )
                                            )}
                                        </select>
                                        <label className="popup__label label" htmlFor="popup-time">Начало аренды</label>
                                        <svg width="16" height="16" fill="none">
                                            <use xlinkHref="#angle-arrow-down"/>
                                        </svg>
                                    </div>
                                    <div className="popup__group group">
                                        <button className="popup__juk popup__juk--minus unbutton"
                                                type="button"
                                                onClick={this.decreaseBookingHourAmount}
                                        >&ndash;</button>
                                        <input className="popup__input popup__input--number input input--number"
                                               id="popup-hours"
                                               type="number"
                                               min="1"
                                               value={this.data.bookingHourAmount}
                                               onChange={this.setBookingHourAmount}
                                        />
                                        <button className="popup__juk popup__juk--plus unbutton"
                                                onClick={this.increaseBookingHourAmount}
                                                type="button">+
                                        </button>
                                        <label className="popup__label label" htmlFor="popup-hours">Количество
                                            часов</label>
                                    </div>
                                </div>
                            </div>
                            <div className="popup__content">
                                <h2 className="popup__headline">Контактные данные</h2>
                                <div className="popup__wrapper">
                                    <div className="popup__group group">
                                        <input className="popup__input input"
                                               type="text" placeholder="&nbsp;"
                                               value={this.data.bookingName}
                                               onChange={this.setBookingName}
                                               required/>
                                        <label className="popup__label label" htmlFor="apply-name">Имя</label>
                                    </div>
                                    <div className="popup__group group">
                                        <input className="popup__input input"
                                               type="text" placeholder="&nbsp;" maxLength={18} required
                                               value={this.data.bookingPhone}
                                               onChange={this.setBookingPhone}
                                        />
                                        <label className="popup__label label" htmlFor="apply-phone">Номер
                                            телефона</label>
                                    </div>
                                    <div className="popup__group popup__group--message group group--message">
                                        <textarea className="popup__input input input--message"
                                                  id="apply-message"
                                                  name="apply-message"
                                                  rows={7}
                                                  cols={20}
                                                  maxLength={340}
                                                  placeholder="&nbsp;"
                                                  value={this.data.bookingDescription}
                                                  onChange={this.setBookingDescription}
                                        />
                                        <label className="popup__label label" htmlFor="apply-email">Текст
                                            сообщения</label>
                                    </div>
                                    <div className="popup__footer">
                                        <input className="popup__checkmark visually-hidden"
                                               id="apply-accept-terms"
                                               name="apply-accept-terms"
                                               type="checkbox" required
                                               checked={this.data.bookingAgreementCheck}
                                               onClick={this.setBookingAgreementCheck}
                                        />
                                        <label className="popup__checkmark-label" htmlFor="apply-accept-terms">Я
                                            принимаю <a href="/docs/personal-data-terms.pdf"
                                                        title="Обработка персональных данных (PDF)" target="_blank">условия
                                                обработки персональных&nbsp;данных</a></label>
                                    </div>
                                    <div className="popup__actions">
                                        <button className="popup__button button button--secondary unbutton"
                                                id="apply-cancel" type="button"
                                                onClick={this.closeModal}
                                        >
                                            <span>Отмена</span>
                                            <svg width="20" height="16">
                                                <use xlinkHref="#long-arrow-right"/>
                                            </svg>
                                        </button>
                                        <button className="popup__button pageclip-form__submit button unbutton"
                                                id="apply-submit"
                                                disabled={this.data.bookingButtonDisabled}
                                                onClick={this.bookAsset}
                                        >
                                            <span>Отправить</span>
                                            <svg width="20" height="16">
                                                <use xlinkHref="#long-arrow-right"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </article>
        );
    }

}
