import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {AssetListContainer} from "app/containers/AssetListContainer";
import {AccountTile} from "app/components/AccountTile";
import {LocationTile} from "app/components/LocationTile";

// render react DOM
export const App = hot(({history}) => {
    return (
        <AssetListContainer />
    );
});

export const Login = hot(({history}) => {
    return (
        <AccountTile/>
    );
});

export const LocationApp = hot(({history}) => {
    return (
        <LocationTile/>
    );
});

