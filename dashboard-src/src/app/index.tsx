import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {Route, Router, Switch} from 'react-router';
import {TodoContainer} from 'app/containers/TodoContainer';
import {LoginContainer} from "app/containers/LoginContainer";
import {RegisterContainer} from "app/containers/RegisterContainer";
import {authApi} from "app/constants/api";

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
                <Route path="/dashboard/todo" component={TodoContainer}/>
                <Route path="/dashboard/list" component={TodoContainer}/>
                <Route path="/dashboard/login" component={LoginContainer}/>
                <Route path="/dashboard/register" component={RegisterContainer}/>
            </Switch>
        </Router>
    );
});
