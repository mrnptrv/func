import * as React from 'react';
import * as style from "../../style.css"
import {observer} from 'mobx-react';
import {action, observable} from "mobx";
import {authApi, roleApi} from "app/constants/api";
import {Alert, Button, Form, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {MainMenu} from "app/components";
import {Location, Role, UserLite} from "app/api";
import Select from "react-select";


class AssignRoleData {
    @observable isUserLoading = true
    @observable isSaving = false
    @observable error = ""
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable currentUser: UserLite = null;
    @observable role: Role = null;
    @observable selectedLocations: Array<Location> = new Array<Location>();

    @action
    selectLocation(pubId) {
        let selected = LOCATION_STORE.locations.find(l => l.pubId === pubId)

        if (selected) {
            this.selectedLocations.push(selected)
        }
    }
}

@observer
export class AssignRoleContainer extends React.Component<any, any> {
    private data = new AssignRoleData()
    private locationStore = LOCATION_STORE


    constructor(props: any, context: any) {
        super(props, context);

        this.data.isUserLoading = true

        authApi().getUsingGET1().then(r => {
            this.data.currentUser = r.data

            if (r.data.role != "GOD") {
                this.data.isUserLoading = false
                this.data.error = "Недостаточно прав"
            } else {
                this.locationStore.loadLocations().then(() => {
                    roleApi().getRoleUsingPOST(this.props.match.params.id).then(r => {
                        this.data.role = r.data

                        this.data.selectedLocations = [];
                        (this.data.role?.locationIds ?? []).forEach(id => {
                            this.data.selectLocation(id);
                        })
                        this.data.isUserLoading = false
                    }).catch(e => {
                        this.data.isUserLoading = false
                    })
                })
            }
        })
    }


    cancel = () => {
        this.props.history.push("/dashboard/user-list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        roleApi().assignRoleUsingPOST({
            userId: this.props.match.params.id,
            locationIds: this.data.selectedLocations.map(it => it.pubId),
            role: this.data.role.role
        }).then(() => {
            this.data.isSaving = false
            this.cancel()
        }).catch(error => {
            this.data.isSaving = false

            if (error && error.response && error.response.data && error.response.data.message) {
                this.data.error = error.response.data.message
            }

            if (error && error.response && error.response.data.errors) {
                this.data.fieldErrors = error.response.data.errors.map(e => e.messages).flat()
            }
        })
    }

    private roleDefaultValue() {
        if (this.data.role.role) {
            return this.roleOptions().filter(o => o.value == this.data.role.role)
        }
        return null
    }

    private roleOptions() {
        return [
            {"label": "Бог", "value": "GOD"},
            {"label": "Администратор", "value": "ADMIN"},
            {"label": "Сотрудник", "value": "WORKER"},
            {"label": "Резидент", "value": "RESIDENT"},
        ]
    }

    private selectRole(selected) {
        this.data.role.role = selected.value
    }

    private locationsDefaultValue() {
        if (this.data.selectedLocations) {
            return this.data.selectedLocations.map(it => ({
                label: it.name,
                value: it.pubId
            }));
        }

        return [];
    }

    private locationOptions() {
        return this.locationStore.locations
            .map(l => ({"label": l.name, "value": l.pubId}))
    }

    private locationSelect(selected) {
        this.data.selectedLocations = []
        if (selected) {
            selected.forEach(it => {
                let selected = this.locationStore.locations.find(l => l.pubId === it.value)

                if (selected) {
                    this.data.selectedLocations.push(selected)
                }
            })
        }
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Управление доступом</h4>
                {this.data.isUserLoading ? <Spinner animation="grow"/> :
                    <>
                        <Form className={style.userForm}>
                            <Form.Group>
                                <Form.Label>Роль:</Form.Label>
                                <Select
                                    value={this.roleDefaultValue()}
                                    options={this.roleOptions()}
                                    onChange={e => this.selectRole(e)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Доступные локации:</Form.Label>

                                <Select
                                    isMulti
                                    value={this.locationsDefaultValue()}
                                    options={this.locationOptions()}
                                    onChange={e => this.locationSelect(e)}
                                />
                            </Form.Group>
                            <Form.Group>
                                {this.data.error &&
                                <Alert variant="danger">
                                    {this.data.error}
                                    {
                                        (<ul>{this.data.fieldErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>)
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
                    </>
                }
            </div>
        );
    }
}
