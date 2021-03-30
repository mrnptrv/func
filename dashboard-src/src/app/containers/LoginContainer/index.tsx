import * as React from 'react';
import {observer} from 'mobx-react';
import {Alert, Button, Form, Modal, Spinner} from "react-bootstrap";
import {observable} from "mobx";
import {authApi, saveAccessToken} from "app/constants/api";
import {formatPhone} from "app/constants/utils";

class LoginData {
    @observable mobile = ""
    @observable code = ""
    @observable error = ""
    @observable codeSent = false
    @observable isLoading = false

}

@observer
export class LoginContainer extends React.Component<any, any> {
    private data = new LoginData()

    private setMobile = (e) => {
        this.data.mobile = formatPhone(e.target.value)
    }

    private setCode = (e) => {
        this.data.code = e.target.value
    }

    sendCode = () => {
        this.data.error = ""
        this.data.isLoading = true
        authApi().sendCodeUsingPOST({
            mobile: this.data.mobile
        }).then((response) => {
            this.data.isLoading = false;
            this.data.codeSent = true;
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    exchangeCode = () => {
        this.data.error = ""
        this.data.isLoading = true

        authApi().exchangeCodeUsingPOST({
            mobile: this.data.mobile,
            code: this.data.code
        }).then((response) => {
            this.data.isLoading = false;
            this.data.codeSent = false;

            saveAccessToken(response.data.accessToken)

            this.props.history.push("/dashboard/list")
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
                <Modal.Header>
                    {this.data.codeSent ? "Введите код" : "Войти"}
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {this.data.codeSent ?
                            <Form.Group>
                                <Form.Control type="text" placeholder="Sms код"
                                              value={this.data.code}
                                              onChange={this.setCode}
                                />
                            </Form.Group>
                            : <Form.Group>
                                <Form.Control type="text" placeholder="Телефон"
                                              value={this.data.mobile}
                                              onChange={this.setMobile}
                                />
                            </Form.Group>

                        }
                        {this.data.error &&
                        <Form.Group><Alert variant="danger">{this.data.error}</Alert></Form.Group>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {this.data.codeSent ?
                        <Button variant="primary"
                                onClick={this.exchangeCode}
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
                        :
                        <Button variant="primary"
                                onClick={this.sendCode}
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
                    }
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
}
