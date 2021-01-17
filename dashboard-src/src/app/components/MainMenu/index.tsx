import * as React from 'react';
import {Nav, Navbar} from 'react-bootstrap';

export class MainMenu extends React.Component<any, any> {
    render() {
        return (
            <Navbar>
                <Navbar.Brand><h1>Func Dash</h1></Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/dashboard/booking">Booking</Nav.Link>
                    <Nav.Link href="/dashboard/list">Assets</Nav.Link>
                    <Nav.Link href="/dashboard/location/list">Locations</Nav.Link>
                    <Nav.Link href="/dashboard/company-list">Companies</Nav.Link>
                    <Nav.Link href="/dashboard/payment-plan-list">Payment plans</Nav.Link>
                    <Nav.Link href="/dashboard/user-list">Users</Nav.Link>
                </Nav>
            </Navbar>
        );
    }
}
