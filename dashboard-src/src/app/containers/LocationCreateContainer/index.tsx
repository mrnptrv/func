import * as React from 'react';
// import * as style from "./style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {locationApi} from "app/constants/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";

class LocationCreateData {
    @observable error = ""
    @observable name = ""
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class LocationCreateContainer extends React.Component<any, any> {
    private data = new LocationCreateData()

    cancel = () => {
        this.props.history.push("/dashboard/location/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        locationApi().createLocationUsingPOST({
            name: this.data.name,
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/edit-location/" + r.data.pubId)
        }).catch((error) => {
            this.data.isSaving = false

            if (error && error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            }


            if (error && error.response && error.response.data.errors) {
                this.data.fieldErrors = error.response.data.errors.map(e => e.messages).flat()
            }
        })
    }


    render() {
        return (
            <div>
                <MainMenu/>

                <h4>New Location</h4>

                <Form>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Name"
                            value={this.data.name}
                            onChange={(e) => this.data.name = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        {this.data.error &&
                        <Alert variant="danger">
                            {this.data.error}
                            {
                            (<ul>{this.data.fieldErrors.map((e,i) => <li key={i}>{e}</li>)}</ul>)
                            }
                        </Alert>
                        }
                    </Form.Group>
                    <Form.Group>
                        <Button
                            variant="light"
                            onClick={this.cancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.save}
                        >
                            Save
                            {this.data.isSaving &&
                            <Spinner animation="grow" as="span" size="sm" role="status"/>
                            }
                        </Button>
                    </Form.Group>
                </Form>
            </div>
        );
    }

}
