import * as React from 'react';
import {observer} from 'mobx-react';
import {observable} from "mobx";
import ReactModal from 'react-modal';
import {formatPhone} from "app/constants/phone";
import {authApi, saveAccessToken, userApi} from "app/constants";
import {UserLite} from "app/api";
import {grecaptcha, RECAPTCHA_V2_SITE_KEY, RECAPTCHA_V3_SITE_KEY} from "app/constants/recaptcha";

class LoginData {
    @observable isOpeningModal = false
    @observable mobile = ""
    @observable firstName = ""
    @observable lastName = ""
    @observable code = ""
    @observable error = ""
    @observable codeSent = false
    @observable isLoading = false
    @observable isLoggedIn = false
    @observable user: UserLite = null
    @observable needV2 = false
    @observable v2Token = "";
    @observable needSaveNames = false;
}


@observer
export class AccountTile extends React.Component<any, any> {
    private data = new LoginData()

    constructor(props: any, context: any) {
        super(props, context);
        this.getUser();
    }

    private getUser() {
        authApi().getUsingGET1().then((r) => {
            this.data.isLoggedIn = true
            this.data.user = r.data
        }).catch(() => {
            saveAccessToken(null)
            this.data.isLoggedIn = false
            this.data.user = null
        })
    }

    private setMobile = (e) => {
        this.data.mobile = formatPhone(e.target.value)
    }

    private setFirstName = (e) => {
        this.data.firstName = e.target.value
    }
    private setLastName = (e) => {
        this.data.lastName = e.target.value
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

            authApi().getUsingGET1().then((r) => {
                if (r.data.firstName || r.data.lastName) {
                    window.location.reload()
                    this.data.isOpeningModal = false
                } else {
                    this.data.needSaveNames = true
                }
            })
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }
            this.data.isLoading = false;
        })
    }

    saveAccount = () => {
        userApi().saveAccountUsingPOST({
            firstName: this.data.firstName,
            lastName: this.data.lastName,
        }).then(r => {
            window.location.reload()
            this.data.isOpeningModal = false
        })
    }

    logout = () => {
        saveAccessToken("")
        this.data.isLoggedIn = false
        window.location.reload()
    }

    render() {
        return (
            <>
                {this.data.isLoggedIn ?
                    <div>
                        {formatPhone(this.data.user?.phone)}
                        <div onClick={this.logout}>Выйти</div>
                    </div> :
                    <div onClick={() => this.data.isOpeningModal = true}>
                        Login
                    </div>
                }
                <ReactModal
                    isOpen={this.data.isOpeningModal}
                    onRequestClose={() => this.data.isOpeningModal = false}
                >
                    {this.data.codeSent
                        ?
                        (<div>
                            <div>
                                Код:
                                <input type="text"
                                       value={this.data.code}
                                       onChange={this.setCode}
                                />
                            </div>
                            <div>
                                {this.data.error}
                            </div>
                            <div>
                                <button onClick={this.exchangeCode}
                                        disabled={this.data.isLoading}
                                >
                                    Подтвердить
                                </button>
                            </div>
                        </div>)
                        : (this.data.needSaveNames ?
                                <div>
                                    <div>
                                        Имя:
                                        <input type="text"
                                               value={this.data.firstName}
                                               onChange={this.setFirstName}
                                        />
                                    </div>
                                    <div>
                                        Фамилия:
                                        <input type="text"
                                               value={this.data.lastName}
                                               onChange={this.setLastName}
                                        />
                                    </div>
                                    <div>
                                        {this.data.error}
                                    </div>
                                    <div>
                                        <button onClick={this.saveAccount}
                                                disabled={this.data.isLoading}
                                        >
                                            Войти
                                        </button>
                                    </div>
                                </div>
                                : <div>
                                    <div>
                                        Телефон:
                                        <input type="text"
                                               value={this.data.mobile}
                                               onChange={this.setMobile}
                                        />
                                        <div id="recaptcha-v2"/>
                                    </div>
                                    <div>
                                        {this.data.error}
                                    </div>
                                    <div>
                                        <button onClick={this.sendCode}
                                                disabled={this.data.isLoading}
                                        >
                                            Войти
                                        </button>
                                    </div>
                                </div>
                        )
                    }
                </ReactModal>
            </>
        );
    }

}
