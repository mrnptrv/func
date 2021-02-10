import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {paymentApi} from "app/constants/api";
import {Payment} from "app/api/api";
import {MainMenu} from "app/components";
import format from "date-fns/format";

class PaymentListData {
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
}

@observer
export class PaymentListContainer extends React.Component<any, any> {
    private data = new PaymentListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        paymentApi().getPaymentListUsingPOST({}).then(
            (response) => {
                this.data.payments = response.data
                this.data.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deletePayment = () => {
        this.data.deletePayment(this.data.deletionPayment)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (payment) => {
        return () => {
            this.data.deletionPayment = payment;
            this.data.isShowDeletionDialog = true
        }
    }

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionPayment = null;
    }

    editPayment = (payment) => {
        return () => {
            this.props.history.push("/dashboard/edit-payment/" + payment.pubId)
        }
    }

    newPayment = () => {
        this.props.history.push("/dashboard/create-payment")
    }

    formatDate(d: string) {
        if (d) {
            let date = new Date(d)
            if (format(date, "HH:mm") === "00:00") {
                return format(date, "yyyy-MM-dd")
            }
            return format(date, "yyyy-MM-dd HH:mm")
        }
        return ""
    }

    render() {
        const items = this.data.payments.map((payment) =>
            <tr key={payment.pubId}>
                <td>{payment.companyName} {payment.userName}</td>
                <td>{payment.assetName}</td>
                <td>{payment.paymentPlanName}</td>
                <td className="text-nowrap text-right">{payment.total}</td>
                <td className="text-nowrap"> {this.formatDate(payment.start)} </td>
                <td className="text-nowrap">{this.formatDate(payment.end)}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editPayment(payment)}>Редактирование</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(payment)}>Удаление</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
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
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={3}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
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
