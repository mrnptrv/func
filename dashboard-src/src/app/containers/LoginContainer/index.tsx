import * as React from 'react';
import {observer} from 'mobx-react';
import {Alert, Button, Form, Modal, Spinner} from "react-bootstrap";
import {observable} from "mobx";
import {authApi, saveAccessToken} from "app/constants/api";

class LoginData {
    @observable login = ""
    @observable password = ""
    @observable error = ""
    @observable isLoading = false

}

@observer
export class LoginContainer extends React.Component<any, any> {
    private data = new LoginData()

    register = () => {
        this.props.history.push("/dashboard/register")
    }

    login = () => {
        this.data.error = ""
        this.data.isLoading = true
        authApi().loginUsingPOST({
            mobile: this.data.login,
            password: this.data.password
        }).then((response) => {
            saveAccessToken(response.data.accessToken)

            this.props.history.push("/dashboard/list")
            this.data.isLoading = false;
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    render() {
        return (
            <Modal.Dialog>
                <Modal.Header>Войти</Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control type="text" placeholder="Логин"
                                          value={this.data.login}
                                          onChange={(e) => this.data.login = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control type="password" placeholder="Пароль"
                                          value={this.data.password}
                                          onChange={(e) => this.data.password = e.target.value}
                            />
                        </Form.Group>
                        {this.data.error &&
                        <Form.Group><Alert variant="danger">{this.data.error}</Alert></Form.Group>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary"
                            onClick={this.login}
                            disabled={this.data.isLoading}
                    >
                        Войти
                        {
                            this.data.isLoading &&
                            <Spinner as="span"
                                     animation="grow"
                                     size="sm"
                                     role="status"
                                     aria-hidden="true"
                            />
                        }
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
}
