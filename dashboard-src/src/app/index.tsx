import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {Route, Router, Switch} from 'react-router';
import {LoginContainer} from "app/containers/LoginContainer";
import {RegisterContainer} from "app/containers/RegisterContainer";
import {authApi} from "app/constants/api";
import {AssetListContainer} from "app/containers/AssetListContainer";
import {AssetEditContainer} from "app/containers/AssetEditContainer";
import {AssetCreateContainer} from "app/containers/AssetCreateContainer";
import {BookingContainer} from "app/containers/BookingContainer";
import {BookingEditContainer} from "app/containers/BookingEditContainer";
import {LocationListContainer} from "app/containers/LocationListContainer";
import {LocationCreateContainer} from "app/containers/LocationCreateContainer";
import {LocationEditContainer} from "app/containers/LocationEditContainer";
import {CompanyListContainer} from "app/containers/company/ListContainer";
import {CompanyEditContainer} from "app/containers/company/EditContainer";
import {CompanyCreateContainer} from "app/containers/company/CreateContainer";
import {PaymentPlanListContainer} from "app/containers/paymentPlan/ListContainer";
import {PaymentPlanCreateContainer} from "app/containers/paymentPlan/CreateContainer";
import {PaymentPlanEditContainer} from "app/containers/paymentPlan/EditContainer";

// render react DOM
export const App = hot(({history}) => {
    let api = authApi()

    api.getUsingGET1().then(() => {
        // history.push("/dashboard/list")

        if (history.location.pathname == "/dashboard/index.html" || history.location.pathname == "/dashboard/") {
            history.push("/dashboard/list")
        }
    }).catch(() => {
        history.push("/dashboard/login")
    })

    return (
        <Router history={history}>
            <Switch>
                <Route path="/dashboard/login" component={LoginContainer}/>
                <Route path="/dashboard/register" component={RegisterContainer}/>
                <Route path="/dashboard/booking" component={BookingContainer}/>
                <Route path="/dashboard/edit-booking/:id" component={BookingEditContainer}/>
                <Route path="/dashboard/list" component={AssetListContainer}/>
                <Route path="/dashboard/asset/:id" exact component={AssetEditContainer}/>
                <Route path="/dashboard/create-asset" exact component={AssetCreateContainer}/>
                <Route path="/dashboard/location/list" exact component={LocationListContainer}/>
                <Route path="/dashboard/create-location" exact component={LocationCreateContainer}/>
                <Route path="/dashboard/edit-location/:id" exact component={LocationEditContainer}/>
                <Route path="/dashboard/company-list" exact component={CompanyListContainer}/>
                <Route path="/dashboard/edit-company/:id" exact component={CompanyEditContainer}/>
                <Route path="/dashboard/create-company" exact component={CompanyCreateContainer}/>
                <Route path="/dashboard/payment-plan-list" exact component={PaymentPlanListContainer}/>
                <Route path="/dashboard/create-payment-plan" exact component={PaymentPlanCreateContainer}/>
                <Route path="/dashboard/edit-payment-plan/:id" exact component={PaymentPlanEditContainer}/>
                <Route>Loading...</Route>
            </Switch>
        </Router>
    );
});
