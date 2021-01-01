import * as React from 'react';
import * as style from "../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {MainMenu} from "app/components/MainMenu";
import {locationApi} from "app/constants/api";
import {Location} from "../../../api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";

class LocationEditData {
    @observable isLocationLoading = true
    @observable error = ""
    @observable location: Location = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class LocationEditContainer extends React.Component<any, any> {
    private data = new LocationEditData()

    cancel = () => {
        this.props.history.push("/dashboard/location/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        locationApi().updateLocationUsingPOST({
            pubId: this.data.location.pubId,
            name: this.data.location.name,
        }).then(() => {
            this.data.isSaving = false
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

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isLocationLoading = true

        locationApi().getLocationUsingGET(this.props.match.params.id)
            .then(res => {
                this.data.location = res.data
                this.data.isLocationLoading = false
            })
            .catch(error => {
                this.data.isLocationLoading = false

                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }
            })
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Location</h4>
                {this.data.isLocationLoading ? <Spinner animation="grow"/> :
                    <Form className={style.assetForm}>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Name"
                                value={this.data.location.name}
                                onChange={(e) => this.data.location.name = e.target.value}
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
                }
            </div>
        );
    }

}
