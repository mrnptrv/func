import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {Button, Dropdown, DropdownButton, Form, Modal, Spinner, Table} from "react-bootstrap";
import {authApi, userApi} from "app/constants/api";
import {UserLite, UserWithCurrentAccess} from "app/api/api";
import {MainMenu} from "app/components";
import {formatDate} from "app/constants/utils";
import Col from "react-bootstrap/Col";
import InfiniteScroll from "react-infinite-scroll-component";

const filterRowStyle = {
    paddingBottom: 10
}

class UserListData {
    @observable isLoading = true
    @observable error = ""
    @observable users: Array<UserWithCurrentAccess> = new Array<UserWithCurrentAccess>()
    @observable isShowDeletionDialog = false;
    @observable deletionUser: UserWithCurrentAccess = null;
    @observable currentUser: UserLite = null

    @observable filter = ""
    @observable limit = 50
    @observable offset = 0
    @observable total = 0
    @observable hasMore = false

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

    @action
    next() {
        this.offset = this.offset + 20;
        this.load()
    }

    @action
    load() {
        this.isLoading = true
        authApi().getUsingGET1().then(r => {
            this.currentUser = r.data

            userApi().getUserListUsingPOST({
                filter: this.filter,
                offset: this.offset,
                limit: this.limit
            }).then(
                response => {
                    this.total = response.data.total
                    response.data.list.forEach(it => this.users.push(it))
                    this.calcHasMore()
                    this.isLoading = false
                }).catch(error => {
                if (error && error.response && error.response.data.message) {
                    this.error = error.response.data.message
                }

                this.isLoading = false;
            })
        })
    }

    private calcHasMore() {
        this.hasMore = this.users.length < this.total
    }
}

@observer
export class UserListContainer extends React.Component<any, any> {
    private data = new UserListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.load()
    }

    private deleteUser = () => {
        this.data.deleteUser(this.data.deletionUser)
        this.data.isShowDeletionDialog = false;
    }

    private openDeletionDialog = (asset) => {
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
    private assignRole = (user) => {
        return () => {
            this.props.history.push("/dashboard/assign-role-user/" + user.pubId)
        }
    }

    private createPayment = (user) => {
        return () => {
            this.props.history.push("/dashboard/create-payment/", {userId: user.pubId})
        }
    }

    private fetchMoreData = () => {
        this.data.next()
    }

    private newUser = () => {
        this.props.history.push("/dashboard/create-user")
    }

    private setFilter(v) {
        this.data.filter = v
    }

    private handleKeyPress(target) {
        if (target.charCode === 13) {
            this.data.limit = 50
            this.data.offset = 0
            this.data.users = []
            this.data.load()
            target.preventDefault()
        }
    }

    render() {
        const items = this.data.users.map((user) =>
            <tr key={user.pubId}>
                <td onClick={this.editUser(user)}>{user.firstName} {user.lastName} {user.thirdName}</td>
                <td onClick={this.editUser(user)}>{user.phone}</td>
                <td onClick={this.editUser(user)}>{user.locationName}</td>
                <td onClick={this.editUser(user)} className="text-nowrap">{user.currentAccessAsset}</td>
                <td onClick={this.editUser(user)} className="text-nowrap">{formatDate(user.currentAccessFrom)}</td>
                <td onClick={this.editUser(user)} className="text-nowrap">{formatDate(user.currentAccessTo)}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.createPayment(user)}>Оплатить</Dropdown.Item>
                        <Dropdown.Item onClick={this.editUser(user)}>Редактировать</Dropdown.Item>
                        {this.data.currentUser.role == "GOD"
                            ? <Dropdown.Item onClick={this.assignRole(user)}>Роль</Dropdown.Item>
                            : <></>
                        }
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
                <Form>
                    <Form.Row className="align-items-center" style={filterRowStyle}>
                        <Col>
                            <Form.Control
                                autoFocus={true}
                                type="text"
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
                    dataLength={this.data.users.length}
                    next={this.fetchMoreData}
                    hasMore={this.data.hasMore}
                    loader={
                        <Spinner size="sm" animation="grow"/>
                    }
                >
                    <Table striped={true} bordered={true} hover>
                        <thead>
                        <tr>
                            <th>ФИО</th>
                            <th>Телефон</th>
                            <th>Локация</th>
                            <th>Доступ</th>
                            <th>От</th>
                            <th>До</th>
                            <th/>
                        </tr>
                        </thead>
                        <tbody>
                        {items}
                        </tbody>
                    </Table>
                </InfiniteScroll>
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
