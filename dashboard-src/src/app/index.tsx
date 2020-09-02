import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {Route, Router, Switch} from 'react-router';
import {TodoContainer} from 'app/containers/TodoContainer';
import {AuthAPIApi} from "../api";
import * as Cookies from "js-cookie";

// render react DOM
export const App = hot(({history}) => {
    let accessToken = Cookies.get("func_ut");

    let api = new AuthAPIApi({
        basePath: "http://localhost:8080",
        accessToken: accessToken
    })

    api.getUsingGET1().then(() => {
        console.log('@@@ index.tsx -> access token valid -> 16');
    }).catch(() => {
        console.log('@@@ index.tsx -> access token invalid -> 18');
    })

    return (
        <Router history={history}>
            <Switch>
                <Route path="/" component={TodoContainer}/>
            </Switch>
        </Router>
    );
});
