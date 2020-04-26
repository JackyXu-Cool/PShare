import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH} from "../../shared/util/validators";
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useForm } from "../../shared/hooks/form-hook"
import { AuthContext } from "../../shared/context/auth-context";
import "./PlaceForm.css";


const NewPlace = () => {
    const [formState, inputHandler] = useForm({
        title: {
            value: "",
            isValid: false
        },
        description: {
            value: "",
            isValid: false
        },
        address: {
            value: "",
            isValid: false
        },
        image: {
            value: null,
            isValid: false
        }
    }, false);

    const {isLoading, error, sendRequest, errorHandler} = useHttpClient();

    const auth = useContext(AuthContext);
    const history = useHistory();

    // Remember to deal with the situation that either one of the input is left blank!!
    const placeSubmitHandler = async (event) => {
        event.preventDefault();

        if (formState.inputs["title"].value && formState.inputs["description"].value && 
        formState.inputs["address"].value && formState.inputs["image"]) {
            const formData = new FormData();
            formData.append("title", formState.inputs["title"].value);
            formData.append("description", formState.inputs["description"].value);
            formData.append("address", formState.inputs["address"].value);
            formData.append("image", formState.inputs["image"].value);

            sendRequest(process.env.REACT_APP_SERVER_URL + "/places/", "POST", formData, 
            {"Authorization": `Bearer ${auth.token}`})
            .then(() => history.push('/'))
            .catch(err => console.log(err));
        } else {
            alert("Please enter the requried fields");
        }
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler}/>
            <form className="place-form" onSubmit={placeSubmitHandler}>
                {isLoading && <LoadingSpinner overlay/>}
                <Input type="text" 
                    id="title"
                    label="Title" 
                    element="input" 
                    errorText="Please enter a valid title."
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={inputHandler}
                />
                <Input id="description"
                    label="Description" 
                    element="textarea" 
                    errorText="Please enter a valid description (at least 5 characters)."
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    onInput={inputHandler}
                />
                <Input id="address"
                    label="Address" 
                    element="input" 
                    errorText="Please enter a valid address."
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={inputHandler}
                />
                <ImageUpload id="image"
                    onInput={inputHandler}
                />
                <Button type="submit" disabled={!formState.isValid}>ADD PLACE</Button>
            </form>
        </React.Fragment>
    );
}

export default NewPlace;
