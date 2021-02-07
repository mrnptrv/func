import * as React from 'react';
import {observer} from 'mobx-react';
import {Alert, Button, Form, Modal, Spinner} from "react-bootstrap";
import {observable} from "mobx";
import {authApi} from "app/constants/api";

class RegisterData {
    @observable login = ""
    @observable password = ""
    @observable error = ""
    @observable isLoading = false
}

@observer
export class RegisterContainer extends React.Component<any, any> {
    private data = new RegisterData()

    login = () => {
        this.props.history.push("/dashboard/login")
    }

    register = () => {
        this.data.error = ""
        this.data.isLoading = true;
        authApi().registerUsingPOST({
            mobile: this.data.login,
            password: this.data.password
        }).then((response) => {
            this.props.history.push("/dashboard/login")
            this.data.isLoading = false;
        }).catch(error => {
            this.data.isLoading = false;
            if (error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            } else {
                this.data.error = "Cannot register. Server unavailable."
                console.log(error);
            }

        })
    }

    render() {
        return (
            <Modal.Dialog>
                <Modal.Header>Регистрация</Modal.Header>
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
                        {this.data.error && <Form.Group><Alert variant="danger">{this.data.error}</Alert></Form.Group>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="link" onClick={this.login}>
                        Login
                    </Button>
                    <Button variant="primary"
                            onClick={this.register}
                            disabled={this.data.isLoading}
                    >
                        Зарегистрироваться
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
