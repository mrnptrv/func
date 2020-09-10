import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import {AssetListContainer} from "app/containers/AssetListContainer";

// render react DOM
export const App = hot(({history}) => {
    return (
        <AssetListContainer />
    );
});
