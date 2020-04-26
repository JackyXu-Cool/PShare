import React, {useState, useContext} from "react";

import {VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from "../../shared/util/validators"
import Card from "../../shared/components/UIComponent/Card"
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import { AuthContext } from "../../shared/context/auth-context"
import { useForm } from "../../shared/hooks/form-hook"
import { useHttpClient } from "../../shared/hooks/http-hook"; 
import "./Auth.css";

const Authenticate = () => {
    const auth = useContext(AuthContext);
    const {isLoading, error, sendRequest, errorHandler} = useHttpClient();

    const [isLoginMode, setLoginMode] = useState(true);

    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: "",
            isValid: false
        },
        password: {
            value: "",
            isValid: false
        }
    }, false)

    const authenticateSubmitHandler = async(event) => {
        event.preventDefault();

        if (isLoginMode) {
            sendRequest(process.env.REACT_APP_SERVER_URL + "/users/login", 'POST', JSON.stringify({
                email: formState.inputs.email.value,
                password: formState.inputs.password.value
            }), {"Content-Type": "application/json"})
            .then(data => { 
                auth.login(data.user.userId, data.user.token);
            })
            .catch(err => console.log(err)); 
            // Error has already been processed in sendRequest() method. This is 
            // just to make sure auth.login() does not execute if there is an error   
        } else {
            if (!formState.inputs.name.value || !formState.inputs.email.value || !formState.inputs.password.value
                || !formState.inputs.image.value) {
                    alert("Invalid input");
            } else {
                const formData = new FormData();
                formData.append("name", formState.inputs.name.value);
                formData.append("email", formState.inputs.email.value);
                formData.append("password", formState.inputs.password.value);
                formData.append("image", formState.inputs.image.value);
                sendRequest(process.env.REACT_APP_SERVER_URL + "/users/signup", "POST", 
                formData) // It will automatically add the correct "content-type" header
                .then(data => {
                    auth.login(data.user.userId, data.user.token);
                })
                .catch(err => console.log(err));
            }
        }
    };

    const switchModeHandler = () => {
        if (isLoginMode) {
            setFormData({
                ...formState.inputs,
                name: {
                    value: "",
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false)
        } else {
            setFormData({
                email: {
                    value: "",
                    isValid: false
                },
                password: {
                    value: "",
                    isValid: false
                }
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        }
        setLoginMode(prevMode => !prevMode)
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler}/>
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay/>}
                <h2>Login Required</h2>
                <hr />
                <form onSubmit={authenticateSubmitHandler}>
                    {!isLoginMode && <Input id="name"
                        element="input"
                        type="text"
                        label="Your name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please Enter your name"
                        onInput={inputHandler}/>}
                    {!isLoginMode && <ImageUpload center 
                        id="image" 
                        onInput={inputHandler} />}
                    <Input
                        id="email"
                        element="input"
                        type="text"
                        label="Email Address"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please Enter a valid email"
                        onInput={inputHandler}
                    />
                    <Input 
                        id="password"
                        element="input"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(8)]}
                        errorText="Please Enter a valid password (at least 8 characters long)"
                        onInput={inputHandler}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ?"LOGIN" :"SIGNUP"}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>
                    SWITCH TO {isLoginMode ?"SIGNUP" :"LOGIN"}
                </Button>
            </Card>
        </React.Fragment>
    );
};

export default Authenticate;