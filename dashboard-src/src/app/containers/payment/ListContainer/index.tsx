import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Form, Modal, Spinner, Table} from "react-bootstrap";
import {paymentApi} from "app/constants/api";
import {Payment} from "app/api/api";
import {MainMenu} from "app/components";
import {formatDate} from "app/constants/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import Col from "react-bootstrap/Col";

const filterRowStyle = {
    paddingBottom: 10
}

class PaymentListData {
    @observable filter = ""
    @observable limit = 50
    @observable offset = 0
    @observable total = 0
    @observable hasMore = false
    @observable isLoading = true
    @observable error = ""
    @observable payments: Array<Payment> = new Array<Payment>()
    @observable isShowDeletionDialog = false;
    @observable deletionPayment: Payment = null;

    @action
    deletePayment(payment) {
        paymentApi().deletePaymentUsingPOST({
            pubId: payment.pubId
        }).then(() => {
            this.payments = this.payments.filter(a => a.pubId != payment.pubId)
        }).catch(error => {
            console.log(error);
        })
    }

    @action
    load() {
        this.isLoading = true
        paymentApi().getPaymentListUsingPOST({
            filter: this.filter,
            offset: this.offset,
            limit: this.limit
        }).then(
            (response) => {
                this.total = response.data.total
                response.data.list.forEach(it => this.payments.push(it))
                this.calcHasMore()
                this.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.error = error.response.data.message
            }

            this.isLoading = false;
        })
    }

    @action
    next() {
        this.offset = this.offset + 20;
        this.load()
    }

    private calcHasMore() {
        this.hasMore = this.payments.length < this.total
    }
}

@observer
export class PaymentListContainer extends React.Component<any, any> {
    private data = new PaymentListData()

    constructor(props: any, context: any) {
        super(props, context)
        this.data.load()
    }

    private deletePayment = () => {
        this.data.deletePayment(this.data.deletionPayment)
        this.data.isShowDeletionDialog = false;
    }

    private openDeletionDialog = (payment) => {
        return () => {
            this.data.deletionPayment = payment;
            this.data.isShowDeletionDialog = true
        }
    }

    private hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionPayment = null;
    }

    private editPayment = (payment) => {
        return () => {
            this.props.history.push("/dashboard/edit-payment/" + payment.pubId)
        }
    }

    private newPayment = () => {
        this.props.history.push("/dashboard/create-payment")
    }

    private fetchMoreData = () => {
        this.data.next()
    }

    private setFilter(v) {
        this.data.filter = v
    }

    private handleKeyPress(target)  {
        if (target.charCode === 13) {
            this.data.limit = 50
            this.data.offset = 0
            this.data.payments = []
            this.data.load()
            target.preventDefault()
        }
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>
                    Платежи
                    <Button
                        variant="light"
                        onClick={this.newPayment}
                    > + </Button>
                </h4>
                <Form>
                    <Form.Row className="align-items-center" style={filterRowStyle}>
                        <Col>
                            <Form.Control
                                type="select"
                                size="sm"
                                value={this.data.filter}
                                onChange={(e) => this.setFilter(e.target.value)}
                                onKeyPress={(e) => this.handleKeyPress(e)}
                            >
                            </Form.Control>
                        </Col>
                    </Form.Row>
                </Form>
                <InfiniteScroll
                    dataLength={this.data.payments.length}
                    next={this.fetchMoreData}
                    hasMore={this.data.hasMore}
                    loader={
                        <Spinner size="sm" animation="grow"/>
                    }
                >
                    <Table striped={true} bordered={true} hover>
                        <thead>
                        <tr>
                            <th>Организация/ФИО</th>
                            <th>Ресурс</th>
                            <th>Платеж</th>
                            <th>Сумма</th>
                            <th>От</th>
                            <th>До</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {this.data.payments.map((payment, index) => (
                            <tr key={payment.pubId}>
                                <td>{payment.companyName} {payment.userName}</td>
                                <td>{payment.assetName}</td>
                                <td>{payment.paymentPlanName}</td>
                                <td className="text-nowrap text-right">{payment.total}</td>
                                <td className="text-nowrap"> {formatDate(payment.start)} </td>
                                <td className="text-nowrap">{formatDate(payment.end)}</td>
                                <td className="text-right">
                                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                                        <Dropdown.Item
                                            onClick={this.editPayment(payment)}>Редактирование</Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={this.openDeletionDialog(payment)}>Удаление</Dropdown.Item>
                                    </DropdownButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </InfiniteScroll>
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Удаление платеж</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Платеж будет удален. Продолжить?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Нет</Button>
                        <Button variant="primary" onClick={this.deletePayment}>Да</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
