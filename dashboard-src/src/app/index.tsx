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

// render react DOM
export const App = hot(({history}) => {
    let api = authApi()

    api.getUsingGET1().then(() => {
        // history.push("/dashboard/list")
        console.log('@@@ index.tsx -> after get -> 18', history.location.pathname);

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
                <Route >Not Found</Route>
            </Switch>
        </Router>
    );
});
