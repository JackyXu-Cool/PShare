import React, {useReducer, useEffect} from "react";

import {validate} from "../../util/validators";
import "./Input.css";

const inputReducer = (state, action) => {
    switch (action.type){
        case 'CHANGE':
            return {
                ...state,
                value: action.val,
                isValid: validate(action.val, action.validators)
            };
        default:
            return state;
    }
}

const Input = props => {
    const [inputState, dispatch] = useReducer(inputReducer, {value: props.initialValue || "", isValid: true});

    const onChangeHandler = event => {
        dispatch({
            type: "CHANGE",
            val: event.target.value,
            validators: props.validators
        });
    }

    const {id, onInput} = props;  // Deconstruct the object
    const {value, isValid} = inputState;

    useEffect(() => {
        onInput(id, value, isValid)
    }, [id, value, onInput, isValid])

    const element = props.element === "input" ? (
             <input id={props.id} 
                    type={props.type} 
                    placeholder={props.placeholder} 
                    onChange={onChangeHandler}
                    value={inputState.value}/>
            ): (
             <textarea id={props.id} 
                       rows={props.rows || 3} 
                       onChange={onChangeHandler}
                       value={inputState.value}/>   
            )


    return (<div className={`form-control ${!inputState.isValid && "form-control--invalid"}`}>
                <label htmlFor={props.id}>{props.label}</label>
                {element}
                {!inputState.isValid && <p>{props.errorText}</p>}
            </div>);
}

export default Input;
