import * as React from 'react';
import * as style from "app/containers/style.css";
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {assetsApi} from "app/constants/api";
import {WorkTimeRange} from "app/api/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";
import {WORK_HOURS} from "app/constants/constants";
import {LocationSelect} from "app/components/LocationSelect";
import {AssetTypeSelect} from "app/components/AssetTypeSelect";
import {LOCATION_STORE} from "app/store/LocationStore";
import {ASSET_TYPE_STORE} from "app/store/AssetTypeStore";
import {MainMenu} from "app/components";


class AssetCreateData {
    @observable error = ""
    @observable asset: {
        workTimeRanges: WorkTimeRange[];
        imageUrls: string[];
        name: string;
        pubId: string;
        description: string;
        location: {
                pubId: string;
                name: string;
                updatedBy: { phone: string; pubId: string; email: string };
                createdBy: { phone: string; pubId: string; email: string };
                created: string;
                updated: string
            };
        type: string;
        capacity: number
    } = {
        description: "",
        imageUrls: new Array<string>(),
        name: "",
        pubId: "",
        type: "MEETING_ROOM",
        workTimeRanges: new Array<WorkTimeRange>(),
        capacity: 0,
        location: {
            pubId: "",
            name: "",
            created: "",
            createdBy: {
                pubId: "",
                email: "",
                phone: ""
            },
            updated: "",
            updatedBy: {
                pubId: "",
                email: "",
                phone: "",
            }
        }
    }
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class AssetCreateContainer extends React.Component<any, any> {
    private data = new AssetCreateData()
    private locationStore = LOCATION_STORE
    private assetTypeStore = ASSET_TYPE_STORE

    cancel = () => {
        this.props.history.push("/dashboard/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        assetsApi().createUsingPOST({
            locationPubId: this.locationStore.selectedLocationPubId(),
            type: this.assetTypeStore.selectedId(),
            name: this.data.asset.name,
            description: this.data.asset.description,
            workTimeRanges: this.data.asset.workTimeRanges,
            imageUrls: this.data.asset.imageUrls,
            capacity: this.data.asset.capacity
        }).then((r) => {
            this.data.isSaving = false
            this.props.history.push("/dashboard/asset/" + r.data.pubId)
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

    addWorkTimeRange = () => {
        this.data.asset.workTimeRanges.push({
            start: "00:00",
            end: "00:00",
            price: "0.00",
            isWeekend: false
        })
    }

    addImageUrl = () => {
        this.data.asset.imageUrls.push("")
    }

    private setWeekend(wtr: WorkTimeRange, isWeekend: boolean) {
        return () => {
            wtr.isWeekend = isWeekend
        }
    }

    private setStartWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.start = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setEndWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.end = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private deleteWorkTimeRange(wtr: WorkTimeRange) {
        return () => {
            this.data.asset.workTimeRanges = this.data.asset.workTimeRanges.filter(w => wtr != w)
        };
    }

    private deleteImageUrl(index: number) {
        return () => {
            let arr = this.data.asset.imageUrls.slice(0)
            arr.splice(index, 1)
            this.data.asset.imageUrls = arr
        };
    }

    render() {
        return (
            <div>
                <MainMenu/>
                <h4>Создание ресурса</h4>

                <Form className={style.editForm}>
                    <Form.Group>
                        <Form.Label>Локация:</Form.Label>
                        <LocationSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Тип:</Form.Label>
                        <AssetTypeSelect/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Название:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Название"
                            value={this.data.asset.name}
                            onChange={(e) => this.data.asset.name = e.target.value}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Описание:</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Описание"
                            rows={3}
                            value={this.data.asset.description}
                            onChange={(e) => this.data.asset.description = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Вместимость:</Form.Label>
                        <Form.Control
                            type="capacity"
                            placeholder="Вместимость"
                            value={this.data.asset.capacity}
                            onChange={(e) => this.data.asset.capacity = e.target.value}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            Стоимость часа:
                            <Button
                                variant="light"
                                onClick={this.addWorkTimeRange}
                            > + </Button>
                        </Form.Label>

                        {this.data.asset.workTimeRanges.map(wtr =>
                            <InputGroup className="mb-3">
                                <DropdownButton
                                    className={style.hourType}
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.isWeekend ? "выходные " : "рабочие "}
                                >
                                    <Dropdown.Item onClick={this.setWeekend(wtr, false)}>
                                        рабочие
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={this.setWeekend(wtr, true)}>
                                        выходные
                                    </Dropdown.Item>
                                </DropdownButton>
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.start}
                                    id="input-group-dropdown-1"
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setStartWorkTime(wtr, h)}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                                <DropdownButton
                                    as={InputGroup.Prepend}
                                    variant="outline-secondary"
                                    title={wtr.end}
                                    id="input-group-dropdown-1"
                                >
                                    {WORK_HOURS.map(h =>
                                        <Dropdown.Item onClick={this.setEndWorkTime(wtr, h)}>
                                            {h < 10 ? "0" + h : h}:00
                                        </Dropdown.Item>
                                    )}
                                </DropdownButton>
                                <Form.Control
                                    aria-describedby="basic-addon1"
                                    value={wtr.price}
                                    onChange={(e) => {
                                        wtr.price = e.target.value
                                    }}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary"
                                            onClick={this.deleteWorkTimeRange(wtr)}
                                    >X</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            Изображения:
                            <Button
                                variant="light"
                                onClick={this.addImageUrl}
                            > + </Button>
                        </Form.Label>
                        {this.data.asset.imageUrls.map((imageURL, index) =>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    aria-describedby="basic-addon1"
                                    value={imageURL}
                                    onChange={(e) => {
                                        this.data.asset.imageUrls[index] = e.target.value
                                    }}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary"
                                            onClick={this.deleteImageUrl(index)}
                                    >X</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        )}

                    </Form.Group>
                    <Form.Group>
                        {this.data.error &&
                        <Alert variant="danger">
                            {this.data.error}
                            {this.data.fieldErrors.length &&
                            (<ul>{this.data.fieldErrors.map(e => <li>{e}</li>)}</ul>)
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
                            Отмена
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
