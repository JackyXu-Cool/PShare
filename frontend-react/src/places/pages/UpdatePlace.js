import React, { useEffect, useState, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";

import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import Card from "../../shared/components/UIComponent/Card";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import "./PlaceForm.css"

const UpdatePlace = () => {
    const place_id = useParams().placeid;

    const [formState, inputHandler] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        }
    }, false);

    const { isLoading, error, sendRequest, errorHandler } = useHttpClient();
    const [loadedPlace, setLoadedPlace] = useState();
    const history = useHistory();
    const auth = useContext(AuthContext);
    
    useEffect(() => {
        sendRequest(process.env.REACT_APP_SERVER_URL + `/places/${place_id}`, "GET")
        .then(data => {
            setLoadedPlace(data.place);
        })
        .catch(err => console.log(err))
    }, [place_id]);

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner asOverlay/>
            </div>
        )
    }

    if (!loadedPlace && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find that place</h2>
                </Card>
            </div>
        )
    }

    const updatePlaceSubmitHandler = (event) => {
        event.preventDefault();

        if (formState.inputs["title"].value && formState.inputs["description"].value) {
            sendRequest(process.env.REACT_APP_SERVER_URL + `/places/${place_id}`, 'PATCH', JSON.stringify({
                title: formState.inputs.title.value,
                description: formState.inputs.description.value
            }), {"Content-Type": "application/json", "Authorization": `Bearer ${auth.token}`})
            .then(() => history.push(`/${auth.userId}/places`))
            .catch(err => console.log(err));
        } else {
            alert("Please enter the requried fields");
        }
    }

    // "formState.inputs.title.value" need to be modified when work with real backend 
    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler}/>
            {(!isLoading && loadedPlace) &&
            <form className="place-form" onSubmit={updatePlaceSubmitHandler}>
                <Input 
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title"
                    initialValue={loadedPlace.title}
                    initialValid={true}  // Actually, I don't use this value in "input" component
                    onInput={inputHandler}
                />
                <Input 
                    id="description"
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description(at least 5 characters)"
                    initialValue={loadedPlace.description}
                    initialValid={true}
                    onInput={inputHandler}
                />
                <Button type="submit" disabled={!formState.isValid}>UPDATE PLACE</Button>
            </form>}
        </React.Fragment>
    )
}

export default UpdatePlace;