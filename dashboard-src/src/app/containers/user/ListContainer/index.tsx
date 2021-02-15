import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {userApi} from "app/constants/api";
import {UserWithCurrentAccess} from "app/api/api";
import {MainMenu} from "app/components";
import {formatDate} from "app/constants/utils";

class UserListData {
    @observable isLoading = true
    @observable error = ""
    @observable users: Array<UserWithCurrentAccess> = new Array<UserWithCurrentAccess>()
    @observable isShowDeletionDialog = false;
    @observable deletionUser: UserWithCurrentAccess = null;

    @action
    deleteUser(user) {
        userApi().deleteUserUsingPOST({
            pubId: user.pubId
        }).then(() => {
            this.users = this.users.filter(a => a.pubId != user.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class UserListContainer extends React.Component<any, any> {
    private data = new UserListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        userApi().getUserListUsingPOST({}).then(
            (response) => {
                this.data.users = response.data
                this.data.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deleteUser = () => {
        this.data.deleteUser(this.data.deletionUser)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (asset) => {
        return () => {
            this.data.deletionUser = asset;
            this.data.isShowDeletionDialog = true
        }
    }

    private hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionUser = null;
    }

    private editUser = (user) => {
        return () => {
            this.props.history.push("/dashboard/edit-user/" + user.pubId)
        }
    }

    private createPayment = (user) => {
        return () => {
            this.props.history.push("/dashboard/create-payment/", {userId: user.pubId})
        }
    }

    private newUser = () => {
        this.props.history.push("/dashboard/create-user")
    }

    render() {
        const items = this.data.users.map((user) =>
            <tr key={user.pubId}>
                <td>{user.firstName} {user.lastName} {user.thirdName}</td>
                <td>{user.phone}</td>
                <td className="text-nowrap text-right">{user.currentAccessAsset}</td>
                <td className="text-nowrap">{formatDate(user.currentAccessFrom)}</td>
                <td className="text-nowrap">{formatDate(user.currentAccessTo)}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.createPayment(user)}>Оплатить</Dropdown.Item>
                        <Dropdown.Item onClick={this.editUser(user)}>Редактировать</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(user)}>Удалить</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>
                <h4>
                    Резиденты
                    <Button
                        variant="light"
                        onClick={this.newUser}
                    > + </Button>
                </h4>
                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Телефон</th>
                        <th>Доступ</th>
                        <th>C</th>
                        <th>До</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={6}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Удаление резидента</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Резидент будет удален. Продолжить?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Нет</Button>
                        <Button variant="primary" onClick={this.deleteUser}>Да</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
