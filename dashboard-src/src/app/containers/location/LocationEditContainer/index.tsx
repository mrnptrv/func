import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {locationApi} from "app/constants/api";
import {Location} from "app/api/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import {MainMenu} from "app/components";

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
            path: this.data.location.path,
        }).then(() => {
            this.data.isSaving = false

            this.props.history.push("/dashboard/location/list")
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
                <h4>Локация</h4>
                {this.data.isLocationLoading ? <Spinner animation="grow"/> :
                    <Form className={style.editForm}>
                        <Form.Group>
                            <Form.Label>Название:</Form.Label>
                            <Form.Control
                                autoFocus={true}
                                type="text"
                                value={this.data.location.name}
                                onChange={(e) => this.data.location.name = e.target.value}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Путь:</Form.Label>
                            <Form.Control
                                type="text"
                                value={this.data.location.path}
                                onChange={(e) => this.data.location.path = e.target.value}
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
                        <Form.Group className="float-right">
                            <Button
                                className="mr-2"
                                variant="light"
                                onClick={this.cancel}
                            >
                                Отменить
                            </Button>
                            <Button
                                className="mr-2"
                                variant="primary"
                                onClick={this.save}
                            >
                                Сохранить
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
