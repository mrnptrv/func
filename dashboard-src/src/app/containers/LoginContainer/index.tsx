import * as React from 'react';
import {observer} from 'mobx-react';
import {Alert, Button, Form, Modal, Spinner} from "react-bootstrap";
import {observable} from "mobx";
import {authApi, saveAccessToken} from "app/constants/api";
import {formatPhone} from "app/constants/utils";
import {grecaptcha, RECAPTCHA_V3_SITE_KEY} from "app/constants/recaptcha";
import {RECAPTCHA_V2_SITE_KEY} from "../../../../../booking-src/src/app/constants/recaptcha";

class LoginData {
    @observable mobile = ""
    @observable code = ""
    @observable error = ""
    @observable codeSent = false
    @observable isLoading = false
    @observable needV2 = false
    @observable v2Token = "";
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
        let me = this

        grecaptcha.ready(function () {
            grecaptcha.execute(RECAPTCHA_V3_SITE_KEY, {action: 'submit'}).then(function (tokenV3) {
                if (me.data.needV2) {
                    me.doSendCode(tokenV3, me.data.v2Token)
                }

                me.doSendCode(tokenV3, "");
            });
        });
    }

    private doSendCode(tokenV3, tokenV2) {
        authApi().sendCodeUsingPOST({
            mobile: this.data.mobile,
            recaptchaTokenV3: tokenV3,
            recaptchaTokenV2: tokenV2,
        }).then((r) => {
            this.data.isLoading = false;
            if (r.data.status == "NEED_V2") {
                this.renderV2();
                this.data.needV2 = true
                this.data.error = "Пройдите капчу."
            }
            if (r.data.status == "FAIL") {
                this.renderV2();
                this.data.needV2 = true
                this.data.error = "неверная капча"
            }
            if (r.data.status == "OK") {
                this.data.needV2 = false
                this.data.codeSent = true;
            }
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    private renderV2() {
        this.data.isLoading = true
        grecaptcha.render('recaptcha-v2', {
            sitekey: RECAPTCHA_V2_SITE_KEY,
            callback: (r) => {
                this.data.v2Token = r
                this.data.isLoading = false
            }
        });
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
                                <div id="recaptcha-v2"/>
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
