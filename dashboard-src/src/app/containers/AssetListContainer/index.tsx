import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {Button, Dropdown, DropdownButton, Spinner, Table} from "react-bootstrap";
import {assetsApi} from "app/constants/api";
import {Asset} from "../../../api";

class AssetListData {
    @observable isLoading = true
    @observable error = ""
    @observable assets: Array<Asset> = new Array<Asset>()

    @action
    deleteAsset(asset) {
        assetsApi().deleteUsingPOST({
            pubId: asset.pubId
        }).then((res) => {
            this.assets = this.assets.filter(a => a.pubId != asset.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class AssetListContainer extends React.Component<any, any> {
    private data = new AssetListData()


    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        assetsApi().listUsingGET().then((response) => {
            this.data.assets = response.data
            this.data.isLoading = false
        }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deleteAsset = (asset) => {
        return () => {
            this.data.deleteAsset(asset)
        }
    }

    editAsset = (asset) => {
        return () => {
            this.props.history.push("/dashboard/asset/" + asset.pubId)
        }
    }

    newAsset = () => {
        this.props.history.push("/dashboard/create-asset")
    }

    render() {
        const items = this.data.assets.map((asset) =>
            <tr key={asset.pubId}>
                <td>{asset.name}</td>
                <td>{asset.type}</td>
                <td>{asset.capacity}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editAsset(asset)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={this.deleteAsset(asset)}>Delete</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>

                <h4>Assets ({this.data.assets.length})
                    <Button
                        variant="light"
                        onClick={this.newAsset}
                    > + </Button>
                </h4>
                <Table striped boarder hover >
                    <thead>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th/>
                    </thead>
                    <tbody>
                    {this.data.isLoading ?
                        <tr>
                            <td colSpan={3}><Spinner size="sm" animation="grow"/></td>
                        </tr>
                        : items
                    }
                    </tbody>
                </Table>
            </div>
        );
    }
}