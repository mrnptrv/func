import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from "mobx";
import ReactModal from 'react-modal';
import ReactCodeInput from 'react-code-input'
import { formatPhone } from "app/constants/phone";
import { authApi, saveAccessToken, userApi } from "app/constants";
import { UserLite } from "app/api";
import { grecaptcha, RECAPTCHA_V2_SITE_KEY, RECAPTCHA_V3_SITE_KEY } from "app/constants/recaptcha";

class LoginData {
    @observable isOpeningModal = false
    @observable isOpeningDropdown = false
    @observable mobile = "+7 ("
    @observable firstName = ""
    @observable lastName = ""
    @observable code = ""
    @observable codeTime = 180
    @observable isCodeTimerUp = false
    @observable error = ""
    @observable codeSent = false
    @observable isLoading = false
    @observable isLoggedIn = false
    @observable codeValid = true
    @observable buttonDisabledMobile = true
    @observable buttonDisabledCode = true
    @observable buttonDisabledName = true
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

    private resetLoginStyles = {
        overlay: {
            backgroundColor: null
        },
        content: {
            top: null,
            left: null,
            right: null,
            bottom: null,
            border: null,
            overflow: null,
            background: null,
            borderRadius: null,
            padding: null,
            position: null
        }
    }

    private enableButtonMobile = () => {
        let phoneValid = this.data.mobile.length == 18;

        this.data.buttonDisabledMobile = !(phoneValid);
    }

    private enableButtonCode = () => {
        let code = this.data.code.length == 6;

        this.data.buttonDisabledCode = !(code);
    }

    private enableButtonName = () => {
        let firstName = this.data.firstName.length >= 1;
        let secondName = this.data.lastName.length >= 1;

        this.data.buttonDisabledName = !(firstName && secondName)
    }

    private codeCountdown = () => {
        this.data.isCodeTimerUp = true
        this.data.codeTime = 180
        let timer = setInterval(() => {
            this.data.codeTime--;
            if (this.data.codeTime < 0) {
                clearInterval(timer);
                this.data.isCodeTimerUp = false
            }
        }, 1000)
    }

    private handleProfileDropdown = () => {
        this.data.isOpeningDropdown = !this.data.isOpeningDropdown
    }

    private setMobile = (e) => {
        this.data.mobile = formatPhone(e.target.value)
        this.enableButtonMobile();
    }

    private setFirstName = (e) => {
        this.data.firstName = e.target.value
        this.enableButtonName()
    }
    private setLastName = (e) => {
        this.data.lastName = e.target.value
        this.enableButtonName()
    }

    private setCode = (e) => {
        this.data.code = e
        this.enableButtonCode()
    }

    sendCode = () => {
        this.data.error = ""
        this.data.isLoading = true
        let me = this

        grecaptcha.ready(function () {
            grecaptcha.execute(RECAPTCHA_V3_SITE_KEY, { action: 'submit' }).then(function (tokenV3) {
                if (me.data.needV2) {
                    me.doSendCode(tokenV3, me.data.v2Token)
                }

                me.doSendCode(tokenV3, "");
            });
        });
        if (!this.data.isCodeTimerUp) {
            this.codeCountdown();
        }
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
                this.data.codeValid = false;
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
                    <>
                        <button className={
                            this.data.isOpeningDropdown ?
                                "nav__user nav__user--open nav__user--entered nav__tool-button unbutton" :
                                "nav__user nav__user--entered nav__tool-button unbutton"}
                            onClick={() => this.handleProfileDropdown()}
                        >
                            <span className="visually-hidden">Личный кабинет</span>
                            <span className="nav__user-name text">{this.data.user?.firstName.charAt(0) + "" + this.data.user?.lastName.charAt(0)}</span>
                        </button>
                        <div className={this.data.isOpeningDropdown ? "nav__profile-dropdown nav__profile-dropdown--show" : "nav__profile-dropdown"}>
                            <svg className="nav__profile-arrow" width="12" height="6">
                                <use xlinkHref="#triangle" />
                            </svg>
                            <button className="nav__profile-close nav--open-menu nav__tool-button unbutton"
                                onClick={() => this.handleProfileDropdown()}
                            >
                                <span className="visually-hidden">Закрыть профиль</span>
                                <span className="nav__line"></span>
                            </button>
                            <div className="nav__id-wrapper">
                                <button className="nav__user nav__user--entered nav__user--dropdown-icon unbutton">
                                    <span className="visually-hidden">Личный кабинет</span>
                                    <span className="nav__user-name text">
                                        {
                                            this.data.user?.firstName.charAt(0) + "" + this.data.user?.lastName.charAt(0)
                                        }
                                    </span>
                                </button>
                                <div className="nav__name-wrapper">
                                    <p className="nav__name text">{this.data.user?.firstName + " " + this.data.user?.lastName}</p>
                                    <p className="nav__phone text">{formatPhone(this.data.user?.phone)}</p>
                                </div>
                            </div>
                            <button className="nav__logout-button unbutton" onClick={() => this.logout()}>
                                <span className="visually-hidden">Выйти из аккаунта</span>
                                <svg>
                                    <use xlinkHref="#logout" width="16" height="16" />
                                </svg>
                            </button>
                        </div>
                    </>
                    :
                    <button className="nav__user nav__tool-button unbutton"
                        onClick={() => {
                            this.data.isOpeningModal = true;
                            innerWidth < 957 ? document.querySelector("html").classList.toggle("no-scroll") : null
                        }}>
                        <span className="visually-hidden">Личный кабинет</span>
                        <svg width="16" height="16">
                            <use xlinkHref="#user"></use>
                        </svg>
                    </button>
                }
                <ReactModal
                    closeTimeoutMS={500}
                    isOpen={this.data.isOpeningModal}
                    onRequestClose={() => this.data.isOpeningModal = false}
                    style={this.resetLoginStyles}
                >
                    {this.data.codeSent ?
                        (
                            <div className="login-form">
                                <div className="login-form__top">
                                    <svg className="login-form__top-button" width="14" height="14" onClick={() => this.data.codeSent = false}>
                                        <use xlinkHref="#arrow-left" />
                                    </svg>
                                    <h3 className="login-form__top-title text">Введите код</h3>
                                    <div className="login-form__cross-wrapper"
                                        onClick={() => {
                                            this.data.isOpeningModal = false;
                                            innerWidth < 957 ? document.querySelector("html").classList.toggle("no-scroll") : null
                                        }}>
                                        <svg className="login-form__close-cross" width="16" height="16">
                                            <use xlinkHref="#close-cross" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="login-form__main login-form__main--code">
                                    <p className="login-form__text-top login-form__text-top--phone text">
                                        Мы отправили SMS с кодом проверки
                                        на телефон <strong className="login-form__text-top login-form__text-top--accent login-form__text-top--phone text">{this.data.mobile}</strong>
                                    </p>
                                    <ReactCodeInput className="login-form__code-wrapper" value={this.data.code} isValid={this.data.codeValid} onChange={this.setCode} inputMode="numeric" name="login-form__input-code" fields={6} />
                                    {
                                        this.data.error == "Invalid code or phone number" ?
                                            <p className="login-form__text-bottom login-form__text-bottom-error text">
                                                Неправильный код проверки
                                            </p> :
                                            null
                                    }
                                    <button className="login-form__button button apply-button unbutton" onClick={this.exchangeCode}
                                        disabled={this.data.buttonDisabledCode || this.data.isLoading}>
                                        <span>Продолжить</span>
                                        <svg width="20" height="16">
                                            <use xlinkHref="#arrow-right" />
                                        </svg>
                                    </button>
                                    {this.data.codeValid}
                                    {this.data.codeTime > 1
                                        ?
                                        <p className="login-form__text-bottom text">
                                            Выслать код повторно через
                                            <strong className="login-form__text-bottom login-form__text-bottom--accent text">
                                                {" 0" + Math.floor(this.data.codeTime / 60) + ":" + (this.data.codeTime % 60 < 10 ? "0" + this.data.codeTime % 60 : this.data.codeTime % 60)}
                                            </strong>
                                        </p>
                                        :
                                        <a className="login-form__text-bottom login-form__text-bottom--link text" onClick={() => { this.sendCode() }}>
                                            Выслать код заново
                                        </a>
                                    }
                                </div>
                            </div>
                        )
                        : (this.data.needSaveNames ?
                            <div className="login-form">
                                <svg className="login-form__arrow" width="12" height="6">
                                    <use xlinkHref="#triangle" />
                                </svg>
                                <div className="login-form__top">
                                    <svg className="login-form__top-button" width="14" height="14"
                                        onClick={() => {
                                            this.data.isOpeningModal = false;
                                            innerWidth < 957 ? document.querySelector("html").classList.toggle("no-scroll") : null
                                        }}>
                                        <use xlinkHref="#arrow-left" />
                                    </svg>
                                    <h3 className="login-form__top-title text">Личные данные</h3>
                                    <div className="login-form__cross-wrapper" onClick={() => this.data.isOpeningModal = false}>
                                        <svg className="login-form__close-cross" width="16" height="16">
                                            <use xlinkHref="#close-cross" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="login-form__main login-form__main--code">
                                    <p className="login-form__text-top login-form__text-top--phone text">
                                        Укажите ваше имя и фамилию
                                    </p>
                                    <p className="login-form__group group">
                                        <input className="login-form__name-input input" name="apply-name" placeholder="&nbsp;" value={this.data.firstName} onChange={this.setFirstName}></input>
                                        <label className="login-form__name-label label" htmlFor="apply-name">Имя</label>
                                    </p>
                                    <p className="login-form__group group">
                                        <input className="login-form__name-input input" name="apply-second-name" placeholder="&nbsp;" value={this.data.lastName} onChange={this.setLastName}></input>
                                        <label className="login-form__name-label label" htmlFor="apply-second-name">Фамилия</label>
                                    </p>
                                    <button className="login-form__button login-form__button--name button apply-button unbutton" onClick={this.saveAccount}
                                        disabled={this.data.buttonDisabledName || this.data.isLoading}>
                                        <span>Завершить</span>
                                        <svg width="20" height="16">
                                            <use xlinkHref="#arrow-right" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            : <div className="login-form">
                                <svg className="login-form__arrow" width="12" height="6">
                                    <use xlinkHref="#triangle" />
                                </svg>
                                <div className="login-form__top">
                                    <h3 className="login-form__top-title text">Ваш телефон</h3>
                                    <div className="login-form__cross-wrapper"
                                        onClick={() => {
                                            this.data.isOpeningModal = false;
                                            innerWidth < 957 ? document.querySelector("html").classList.toggle("no-scroll") : null
                                        }}>
                                        <svg className="login-form__close-cross" width="16" height="16">
                                            <use xlinkHref="#close-cross" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="login-form__main">
                                    <p className="login-form__text-top text">
                                        Пожалуйста, укажите код страны
                                        и свой номер телефона.
                                    </p>
                                    <input className="login-form__input input"
                                        type="text"
                                        value={this.data.mobile}
                                        onChange={this.setMobile}
                                    />
                                    <div id="recaptcha-v2" className="login-form__captcha" />
                                    <button className="login-form__button button apply-button unbutton" onClick={this.sendCode}
                                        disabled={this.data.buttonDisabledMobile || this.data.isLoading}>
                                        <span>Продолжить</span>
                                        <svg width="20" height="16">
                                            <use xlinkHref="#arrow-right" />
                                        </svg>
                                    </button>
                                    <p className="login-form__text-bottom-wrapper login-form__text-bottom text">
                                        Нажимая на кнопку
                                            <strong className="login-form__text-bottom login-form__text-bottom--accent text"> Продолжить </strong>
                                            вы подтверждаете, что ознакомились с
                                            <a href="/docs/personal-data-terms.pdf" className="login-form__text-bottom login-form__text-bottom--link text"> условиями обработки персональных данных.</a>
                                    </p>
                                </div>
                            </div>
                        )
                    }
                </ReactModal>
            </>
        );
    }
}
