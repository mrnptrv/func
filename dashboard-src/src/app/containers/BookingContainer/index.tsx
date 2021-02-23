import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {Button, Dropdown, DropdownButton, Form, Modal, Spinner, Table} from "react-bootstrap";
import {assetsApi, bookingApi} from "app/constants/api";
import {Asset, Booking} from "app/api/api";
import ReactDatePicker from "react-datepicker";
import Col from "react-bootstrap/Col";
import format from "date-fns/format";
import {getAssetTypeName, getStatusName, ru_RU} from "app/constants/locale_ru";
import {MainMenu} from "app/components";

class BookingData {
    @observable isLoading = true
    @observable error = ""
    @observable booking: Array<Booking> = new Array<Booking>();
    @observable assetList: Array<Asset> = new Array<Asset>();
    @observable statusFilter = "PENDING";
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

    constructor(props: any, context: any) {
        super(props, context);
        this.load()
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

    private load() {
        this.data.isLoading = true
        bookingApi().listUsingPOST({
            status: this.data.statusFilter !== 'ALL' ? this.data.statusFilter : undefined,
            assetId :this.data.assetPubIdFilter || undefined,
            from : this.data.fromDate ? format(this.data.fromDate, "yyyy-MM-dd") : undefined,
            to : this.data.toDate ? format(this.data.toDate, "yyyy-MM-dd") : undefined
        }).then((response) => {
            this.data.booking = response.data
        }).then(() => {
            return assetsApi().assetsListUsingPOST({})
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


    render() {
        const items = this.data.booking.map((booking) =>
            <tr key={booking.pubId}>
                <td className="text-nowrap">{booking.asset.name}</td>
                <td className="text-nowrap">{getAssetTypeName(booking.asset.type)}</td>
                <td className="text-nowrap">{booking.userData.name}</td>
                <td className="text-nowrap">{booking.userData.phone}</td>
                <td className="text-nowrap">{getStatusName(booking.status)}</td>
                <td className="text-nowrap">{booking.date} {booking.start}-{booking.end}</td>
                <td className="text-nowrap text-right">{booking.price}р</td>
                <td>{booking.description}</td>
                <td className="text-right">
                    <DropdownButton title="&bull;&bull;&bull;" variant="outline-secondary">
                        <Dropdown.Item
                            onClick={this.edit(booking)}
                            >
                            Редактировать
                        </Dropdown.Item>
                        {booking.status !== 'BOOKED' ?
                        <Dropdown.Item
                            onClick={this.approve(booking)}
                        >
                            Подтвердить
                        </Dropdown.Item>
                            :<span/>
                        }
                        {booking.status !== 'DECLINED' ?
                        <Dropdown.Item
                            onClick={this.decline(booking)}
                        >
                            Отменить
                        </Dropdown.Item>

                            :<span/>
                        }
                    </DropdownButton>
                </td>
            </tr>
        );

        return (
            <div>
                <MainMenu/>
                <h4>Бронирование </h4>
                <Form>
                    <Form.Row className="align-items-center" style={filterRowStyle}>
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

                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>Ресурс</th>
                        <th>Тип</th>
                        <th>ФИО</th>
                        <th>Телефон</th>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Цена</th>
                        <th>Описание</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>

                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={9}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
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
}
