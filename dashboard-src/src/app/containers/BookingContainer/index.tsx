import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {bookingApi} from "app/constants/api";
import {Booking} from "../../../api";

class BookingData {
    @observable isLoading = true
    @observable error = ""
    @observable booking: Array<Booking> = new Array<Booking>();
    @observable statusFilter = "PENDING";
    @observable isShowErrorModal = false;
}

@observer
export class BookingContainer extends React.Component<any, any> {
    private data = new BookingData()


    constructor(props: any, context: any) {
        super(props, context);
        this.load()
    }

    private load() {
        this.data.isLoading = true
        bookingApi().listUsingPOST({
            status: this.data.statusFilter !== 'ALL' ? this.data.statusFilter : undefined
        })
            .then((response) => {
                this.data.isLoading = false
                this.data.booking = response.data
            })
            .catch((error) => {
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
        return () => {
            this.data.statusFilter = status
            this.load()
        }
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
                <td className="text-nowrap">{booking.asset.type}</td>
                <td className="text-nowrap">{booking.userData.name}</td>
                <td className="text-nowrap">{booking.userData.phone}</td>
                <td className="text-nowrap">{booking.status}</td>
                <td className="text-nowrap">{booking.date} {booking.start}-{booking.end}</td>
                <td className="text-nowrap text-right">{booking.price}р</td>
                <td>{booking.description}</td>
                <td className="text-right">
                    <DropdownButton title="&bull;&bull;&bull;" variant="outline-secondary">
                        <Dropdown.Item
                            onClick={this.edit(booking)}
                            >
                            Edit
                        </Dropdown.Item>
                        {booking.status !== 'BOOKED' ?
                        <Dropdown.Item
                            onClick={this.approve(booking)}
                        >
                            Approve
                        </Dropdown.Item>
                            :<span/>
                        }
                        {booking.status !== 'DECLINED' ?
                        <Dropdown.Item
                            onClick={this.decline(booking)}
                        >
                            Decline
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
                <h4>Booking ({this.data.booking.length})
                </h4>
                <DropdownButton title={this.data.statusFilter} variant="outline-secondary">
                    {['ALL', 'PENDING', 'BOOKED', 'DECLINED'].map(s =>
                        <Dropdown.Item
                            onClick={this.filterByStatus(s)}
                        >
                            {s}
                        </Dropdown.Item>
                    )}
                </DropdownButton>

                <Table striped boarder hover>
                    <thead>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Description</th>
                    <th/>
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
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>{this.data.error}</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideErrorDialog}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
