import * as React from 'react';
import {Nav, Navbar} from 'react-bootstrap';
import * as style from "./style.css"

export class MainMenu extends React.Component<any, any> {
    render() {
        return (
            <Navbar className={style.menu}>
                <Navbar.Brand><h2>Func Dash</h2></Navbar.Brand>
                <Nav className={style.nav + " justify-content-end"}>
                    <Nav.Link className={style.linkF} href="/dashboard/booking">Бронирование</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/payment-list">Платежи</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/list">Объекты аренды</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/location/list">Локации</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/company-list">Организации</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/payment-plan-list">Тарифы</Nav.Link>
                    <Nav.Link className={style.link} href="/dashboard/user-list">Резиденты</Nav.Link>
                </Nav>
            </Navbar>
        );
    }
}
