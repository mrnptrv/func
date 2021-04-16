import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {AccountTile} from "app/components/AccountTile";
import {AssetListContainer} from "app/containers/AssetListContainer";
import {Route, Router, Switch} from "react-router";

// render react DOM
export const App = hot(({history}) => {
    if (history.location.pathname == "/booking/index.html" || history.location.pathname == "/booking/") {
        history.push("/booking/izhevsk")
    }

    if (history.location.pathname.includes("/dashboard/")){
        history.push("/booking/izhevsk")
    }

    return (
        <Router history={history}>
            <Switch>
                <Route path="/booking/:id" component={AssetListContainer}/>
                <Route>Загрузка...</Route>
            </Switch>
        </Router>
    );
});

export const Login = hot(({history}) => {
    return (
        <AccountTile/>
    );
});


