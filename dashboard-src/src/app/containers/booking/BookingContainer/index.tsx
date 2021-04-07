import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {Button, ButtonGroup, Form, Modal, OverlayTrigger, Popover, Row, Table} from "react-bootstrap";
import {assetsApi, bookingApi} from "app/constants/api";
import {Asset, Booking} from "app/api/api";
import ReactDatePicker from "react-datepicker";
import Col from "react-bootstrap/Col";
import format from "date-fns/format";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import addDays from "date-fns/addDays";
import {getStatusName, ru_RU} from "app/constants/locale_ru";
import {MainMenu} from "app/components";
import {WORK_HOURS} from "app/constants/constants";
import {LocationSelect} from "app/components/LocationSelect";
import {CHANGE_LOCATION_TOPIC, LOCATION_STORE} from "app/store/LocationStore";
import {eventBus, subscribe} from "mobx-event-bus2";

class BookingData {
    @observable isLoading = true
    @observable error = ""
    @observable booking: Array<Booking> = new Array<Booking>();
    @observable assetList: Array<Asset> = new Array<Asset>();
    @observable statusFilter = "ALL";
    @observable assetPubIdFilter = ""
    @observable isShowErrorModal = false;
    @observable fromDate = new Date()
    @observable toDate: Date = null
}

const dateFilterStyle = {
    minWidth: 220,
    maxWidth: 220
}

const filterRowStyle = {
    paddingBottom: 10
}

@observer
export class BookingContainer extends React.Component<any, any> {
    private data = new BookingData()
    private locationStore = LOCATION_STORE

    constructor(props: any, context: any) {
        super(props, context);
        eventBus.register(this)
        this.locationStore.loadLocations()
    }

    private setFromDate = (d: Date) => {
        this.data.fromDate = d;
        this.load()
    }

    private setToDate = (d: Date) => {
        this.data.toDate = d;

        this.load();
    }

    private selectAsset(pubId) {
        this.data.assetPubIdFilter = pubId
        this.load();
    }

    @subscribe(CHANGE_LOCATION_TOPIC)
    changeLocationLister() {
        this.load()
    }

    private book(asset, day, h) {
        return () => {
            this.props.history.push("/dashboard/create-booking"
                + "/" + this.locationStore.selectedLocationPubId()
                + "/" +asset.pubId
                + "/" + format(day, "yyyy-MM-dd") + "/" + h
            )
        }
    }

    private getBooking(asset, day, h): Booking {
        let bs = this.data.booking.filter(b =>
            b.asset.pubId === asset.pubId &&
            format(day, "yyyy-MM-dd") === format(new Date(b.date), "yyyy-MM-dd") &&
            h > this.getHour(b.start) && h <= this.getHour(b.end)
        )

        if (bs.length > 0) {
            return bs[0]
        }

        return null
    }

    private getHour(s) {
        let a = s.split(":")
        return +(a[0] as number)
    }

    private load() {
        this.data.isLoading = true
        bookingApi().listUsingPOST({
            locationId: this.locationStore.selectedLocationPubId(),
            status: this.data.statusFilter !== 'ALL' ? this.data.statusFilter : undefined,
            assetId: this.data.assetPubIdFilter || undefined,
            from: this.data.fromDate ? format(this.data.fromDate, "yyyy-MM-dd") : undefined,
            to: this.data.toDate ? format(this.data.toDate, "yyyy-MM-dd") : undefined
        }).then((response) => {
            this.data.booking = response.data
        }).then(() => {
            return assetsApi().assetsListUsingPOST({
                type: "MEETING_ROOM",
                locationPubId: this.locationStore.selectedLocationPubId()
            })
        }).then((res) => {
            this.data.assetList = res.data

        }).then(() => {
            this.data.isLoading = false
        }).catch((error) => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    private edit = (booking) => {
        return () => {
            this.props.history.push("/dashboard/edit-booking/" + booking.pubId)
        }
    }

    private approve(booking) {
        return () => {
            bookingApi().approveUsingPOST(booking.pubId).then((r) => {
                this.data.booking = this.data.booking.map(b => {
                    if (b.pubId === booking.pubId) {
                        return r.data
                    } else {
                        return b
                    }
                })

                this.load()
            }).catch(error => {
                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                    console.error(this.data.error);

                    this.showErrorDialog()
                }
            })
        }
    }

    private decline(booking) {
        return () => {
            bookingApi().declineUsingPOST(booking.pubId).then((r) => {
                this.data.booking = this.data.booking.map(b => {
                    if (b.pubId === booking.pubId) {
                        return r.data
                    } else {
                        return b
                    }
                })

                this.load()
            }).catch(error => {
                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                    console.error(this.data.error);
                    this.showErrorDialog()
                }
            })
        }
    }

    private filterByStatus(status) {
        this.data.statusFilter = status
        this.load()
    }

    private hideErrorDialog = () => {
        this.data.isShowErrorModal = false;
    }

    private showErrorDialog = () => {
        this.data.isShowErrorModal = true;
    }

    private days(): Array<Date> {
        let result = [this.data.fromDate]

        if (this.data.toDate != null) {
            let days = differenceInCalendarDays(this.data.toDate, this.data.fromDate)
            result = []
            for (let i = 0; i <= days; i++) {
                let day = addDays(this.data.fromDate, i)
                result.push(day)
            }
        }
        return result
    }

    private formatHour(h: number): String {
        return (h < 10 ? ("0" + h) : "" + h) + ":00"
    }


    render() {
        let headers = (<></>);
        let formattedDays = this.days()

        if (formattedDays.length == 1) {
            headers = <>{WORK_HOURS.map(h => (
                <th key={h} className="text-lg-center">
                    {h < 10 ? "0" + h : h}:00
                </th>
            ))
            }
            </>
        } else {
            headers = <>{
                formattedDays.map(fd => format(fd, "dd.MM.yy")).map(fd => (
                    <th key={fd} className="text-lg-center">{fd}</th>))
            } </>
        }

        let body = this.data.assetList.map(a => {
            return <tr key={a.pubId}>
                <td className="align-middle text-lg-center ">{a.name}</td>
                {formattedDays.length == 1 ? WORK_HOURS.map(h => {
                    let booking = this.getBooking(a, formattedDays[0], h)
                    return (<td key={a.pubId + h}>
                        {booking ?
                            <OverlayTrigger rootClose trigger={['click']} placement="right"
                                            overlay={this.bookingPopover(booking)}>
                                <div className={"booking-cell booking-status-" + booking?.status}>
                                </div>
                            </OverlayTrigger>
                            :
                            <div className="booking-cell" onClick={this.book(a, formattedDays[0], h)}>

                            </div>
                        }
                    </td>)
                }) : formattedDays.map(d => {
                    return (<td key={d.getTime()}>
                        {WORK_HOURS.map(h => {
                            let booking = this.getBooking(a, d, h)
                            if (booking) {
                                return <OverlayTrigger key={h}
                                                       rootClose trigger={['click']}
                                                       placement="right"
                                                       overlay={this.bookingPopover(booking)}>
                                    <div className={"text-lg-center booking-cell booking-status-" + booking?.status}>
                                        {this.formatHour(h)}
                                    </div>
                                </OverlayTrigger>

                            }
                            return (<div key={h}
                                         className="booking-cell text-lg-center"
                                         onClick={this.book(a, formattedDays[0], h)}
                            >
                                {this.formatHour(h)}
                            </div>)
                        })}
                    </td>)
                })
                }
            </tr>
        })

        return (
            <div>
                <MainMenu/>
                <h4>Бронирование </h4>
                <Form>
                    <Form.Row className="align-items-center" style={filterRowStyle}>
                        <Col>
                            <Form.Label className="small">Локация:</Form.Label>
                            <LocationSelect/>
                        </Col>
                        <Col>
                            <Form.Label className="small">Статус:</Form.Label>

                            <Form.Control
                                as="select"
                                value={this.data.statusFilter}
                                onChange={(e) => this.filterByStatus(e.target.value)}
                                size="sm"
                            >
                                {['ALL', 'PENDING', 'BOOKED', 'DECLINED'].map(s => {
                                    return <option
                                        key={s}
                                        value={s}
                                    >{getStatusName(s)}</option>
                                })}
                            </Form.Control>
                        </Col>
                        <Col sm={3}>
                            <Form.Label className="small">Переговорка:</Form.Label>
                            <Form.Control
                                as="select"
                                value={this.data.assetPubIdFilter}
                                onChange={(e) => this.selectAsset(e.target.value)}
                                size="sm"
                            >
                                <option value="">-</option>
                                {this.data.assetList.map(a => {
                                    return <option
                                        key={a.pubId}
                                        value={a.pubId}
                                    >{a.name}</option>
                                })}
                            </Form.Control>
                        </Col>
                        <Col style={dateFilterStyle}>
                            <Form.Label className="small">C:</Form.Label>
                            <ReactDatePicker
                                locale={ru_RU}
                                dateFormat="dd.MM.yyyy"
                                className="top__input top__input--select input input--select"
                                placeholderText=""
                                selected={this.data.fromDate}
                                onChange={this.setFromDate}
                            />
                        </Col>
                        <Col style={dateFilterStyle}>
                            <Form.Label className="small">По:</Form.Label>
                            <ReactDatePicker
                                locale={ru_RU}
                                dateFormat="dd.MM.yyyy"
                                className="top__input top__input--select input input--select"
                                placeholderText=""
                                selected={this.data.toDate}
                                onChange={this.setToDate}
                            />
                        </Col>
                        <Col>&nbsp;</Col>
                    </Form.Row>
                </Form>

                <Table className="booking-table" bordered={true} striped={true}>
                    <thead>
                    <tr>
                        <th className="text-lg-center">Объект аренды</th>
                        {headers}
                    </tr>
                    </thead>
                    <tbody>
                    {body}
                    </tbody>
                </Table>

                <Modal show={this.data.isShowErrorModal} onHide={this.hideErrorDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ошибка</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>{this.data.error}</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideErrorDialog}>Закрыть</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    private bookingPopover(booking: Booking) {
        return (
            <Popover className="booking-popover" id={booking?.pubId}>
                <Popover.Title>
                    Бронирование
                </Popover.Title>
                <Popover.Content className="booking-details ">
                    <Row>
                        <Col className="booking-details-label">Статус:</Col> <Col>{getStatusName(booking?.status)}</Col>
                    </Row>
                    <Row>
                        <Col className="booking-details-label">Стоимость:</Col> <Col>{booking.price}</Col>
                    </Row>
                    <Row>
                        <Col className="booking-details-label">ФИО:</Col> <Col>{booking?.userData?.name}</Col>
                    </Row>
                    <Row>
                        <Col className="booking-details-label">Телефон:</Col> <Col
                        className="text-nowrap">{booking?.userData?.phone}</Col>
                    </Row>
                    <Row>
                        <Col className="booking-details-label">Описание:</Col> <Col>{booking?.description}</Col>
                    </Row>
                    <ButtonGroup className="booking-actions" size="sm" aria-label="Basic example">
                        <Button variant="link"
                                onClick={this.edit(booking)}
                        >
                            Редактировать
                        </Button>
                        {booking?.status != "BOOKED" ?
                            <Button variant="link"
                                    onClick={this.approve(booking)}
                            >
                                Подтвердить
                            </Button> : <></>
                        }
                        {booking?.status != "DECLINED" ?
                            <Button variant="link"
                                    onClick={this.decline(booking)}
                            >
                                Отменить
                            </Button> : <></>
                        }
                    </ButtonGroup>
                </Popover.Content>
            </Popover>
        );
    }
}
