import * as React from 'react';
// import * as style from "./style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {locationApi} from "app/constants/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import * as style from "../../style.css"
import {MainMenu} from "app/components";

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


    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Новая локация</h4>

                <Form className={style.editForm}>
                    <Form.Group>
                        <Form.Label>Название:</Form.Label>
                        <Form.Control
                            autoFocus={true}
                            type="text"
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
                            Создать
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
