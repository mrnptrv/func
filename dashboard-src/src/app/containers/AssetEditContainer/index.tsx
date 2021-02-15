import * as React from 'react';
import * as style from "../style.css"
import {observer} from 'mobx-react';
import {observable} from "mobx";
import {assetsApi} from "app/constants/api";
import {Asset, WorkTimeRange} from "app/api/api";
import {Alert, Button, Dropdown, DropdownButton, Form, InputGroup, Spinner} from "react-bootstrap";
import {LOCATION_STORE} from "app/store/LocationStore";
import {LocationSelect} from "app/components/LocationSelect";
import {WORK_HOURS} from "app/constants/constants";
import {AssetTypeSelect} from "app/components/AssetTypeSelect";
import {ASSET_TYPE_STORE} from "app/store/AssetTypeStore";
import {MainMenu} from "app/components";

class AssetEditData {
    @observable isAssetLoading = true
    @observable error = ""
    @observable asset: Asset = null
    @observable fieldErrors: Array<String> = new Array<String>()
    @observable isSaving = false
}

@observer
export class AssetEditContainer extends React.Component<any, any> {
    private data = new AssetEditData()
    private locationStore = LOCATION_STORE
    private assetTypeStore = ASSET_TYPE_STORE

    cancel = () => {
        this.props.history.push("/dashboard/list")
    }

    save = () => {
        this.data.isSaving = true
        this.data.error = ""
        this.data.fieldErrors = new Array<String>()

        assetsApi().updateUsingPOST({
            pubId: this.data.asset.pubId,
            type: this.assetTypeStore.selectedId(),
            name: this.data.asset.name,
            description: this.data.asset.description,
            workTimeRanges: this.data.asset.workTimeRanges,
            imageUrls: this.data.asset.imageUrls,
            capacity: this.data.asset.capacity,
            locationPubId: this.locationStore.selectedLocationPubId()
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

    constructor(props: any, context: any) {
        super(props, context);

        this.data.isAssetLoading = true

        assetsApi().getUsingGET(this.props.match.params.id)
            .then(res => {
                this.data.asset = res.data
                this.data.isAssetLoading = false

                this.locationStore.selectLocation(this.data.asset.location.pubId)
                this.assetTypeStore.select(this.data.asset.type)
            })
            .catch(error => {
                this.data.isAssetLoading = false

                if (error && error.response && error.response.data.message) {
                    this.data.error = error.response.data.message
                }
            })
    }

    private setStartWorkTime(wtr: WorkTimeRange, h: number) {
        return () => {
            wtr.start = (h < 10 ? "0" + h : h) + ":00"
        }
    }

    private setWeekend(wtr: WorkTimeRange, isWeekend: boolean) {
        return () => {
            wtr.isWeekend = isWeekend
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
            <div >
                <MainMenu/>
                <h4>Ресурс</h4>
                {this.data.isAssetLoading ? <Spinner animation="grow"/> :
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
                                type="number"
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
