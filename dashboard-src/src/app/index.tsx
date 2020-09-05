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

// render react DOM
export const App = hot(({history}) => {
    let api = authApi()

    api.getUsingGET1().then(() => {
        // console.log('@@@ index.tsx -> access token valid -> 16');
        // history.push("/dashboard/list")
    }).catch(() => {
        history.push("/dashboard/login")
        console.log('@@@ index.tsx -> access token invalid -> 18');
    })

    return (
        <Router history={history}>
            <Switch>
                <Route path="/dashboard/login" component={LoginContainer}/>
                <Route path="/dashboard/register" component={RegisterContainer}/>
                <Route path="/dashboard/booking" component={BookingContainer}/>
                <Route path="/dashboard/list" component={AssetListContainer}/>
                <Route path="/dashboard/asset/:id" exact component={AssetEditContainer}/>
                <Route path="/dashboard/create-asset" exact component={AssetCreateContainer}/>
            </Switch>
        </Router>
    );
});
