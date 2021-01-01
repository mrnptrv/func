import * as React from 'react';
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {Button, Dropdown, DropdownButton, Modal, Spinner, Table} from "react-bootstrap";
import {locationApi} from "app/constants/api";
import {Location} from "../../../api";

class LocationListData {
    @observable isLoading = true
    @observable error = ""
    @observable locations: Array<Location> = new Array<Location>()
    @observable isShowDeletionDialog = false;
    @observable deletionLocation: Location = null;

    @action
    deleteLocation(location) {
        locationApi().deleteLocationUsingPOST({
            pubId: location.pubId
        }).then(() => {
            this.locations = this.locations.filter(a => a.pubId != location.pubId)
        }).catch(error => {
            console.log(error);
        })
    }
}

@observer
export class LocationListContainer extends React.Component<any, any> {
    private data = new LocationListData()

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLoading = true
        locationApi().getLocationListUsingPOST("").then(
            (response) => {
                this.data.locations = response.data
                this.data.isLoading = false
            }).catch(error => {
            if (error && error.response && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            this.data.isLoading = false;
        })
    }

    deleteLocation = () => {
        this.data.deleteLocation(this.data.deletionLocation)
        this.data.isShowDeletionDialog = false;
    }

    openDeletionDialog = (asset) => {
        return () => {
            this.data.deletionLocation = asset;
            this.data.isShowDeletionDialog = true
        }
    }

    hideDeletionDialog = () => {
        this.data.isShowDeletionDialog = false
        this.data.deletionLocation = null;
    }

    editLocation = (location) => {
        return () => {
            this.props.history.push("/dashboard/edit-location/" + location.pubId)
        }
    }

    newLocation = () => {
        this.props.history.push("/dashboard/create-location")
    }

    render() {
        const items = this.data.locations.map((location) =>
            <tr key={location.pubId}>
                <td>{location.name}</td>
                <td className="text-right">
                    <DropdownButton variant="outline-secondary" title="&bull;&bull;&bull;">
                        <Dropdown.Item onClick={this.editLocation(location)}>Edit</Dropdown.Item>
                        <Dropdown.Item onClick={this.openDeletionDialog(location)}>Delete</Dropdown.Item>
                    </DropdownButton>
                </td>
            </tr>
        );
        return (
            <div>
                <MainMenu/>

                <h4>Locations ({this.data.locations.length})
                    <Button
                        variant="light"
                        onClick={this.newLocation}
                    > + </Button>
                </h4>
                <Table striped={true} bordered={true} hover>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th/>
                    </tr>
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
                <Modal show={this.data.isShowDeletionDialog} onHide={this.hideDeletionDialog}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Location</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            Continue deleting the location?
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hideDeletionDialog}>Not</Button>
                        <Button variant="primary" onClick={this.deleteLocation}>Yes</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
