import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {userApi} from "app/constants/api";
import {UserLite} from "app/api/api";

class UserListData {
    @observable isLoading = true
    @observable error = ""
    @observable users: Array<UserLite> = new Array<UserLite>()
    @observable isShowDeletionDialog = false;
    @observable deletionUser: UserLite = null;

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

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionUser = null;
    }

    editUser = (user) => {
        return () => {
            this.props.history.push("/dashboard/edit-user/" + user.pubId)
        }
    }

    newUser = () => {
        this.props.history.push("/dashboard/create-user")
    }

    render() {
        const items = this.data.users.map((user) =>
            <tr key={user.pubId}>
                <td>{user.firstName} {user.lastName} {user.thirdName} ( {user.email} / {user.phone} )</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editUser(user)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(user)}>Delete</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>

                <h4>Users ({this.data.users.length})
                    <Button
                        variant="light"
                        onClick={this.newUser}
                    > + </Button>
                </h4>
                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>Name</th>
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
                        <Modal.Title>Delete User</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Continue deleting the user?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Not</Button>
                        <Button variant="primary" onClick={this.deleteUser}>Yes</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
