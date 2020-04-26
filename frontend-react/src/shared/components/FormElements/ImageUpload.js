import React, { useRef, useState, useEffect } from "react";

import Button from "./Button";
import "./ImageUpload.css";

const ImageUpload = props => {
    const filePickerRef = useRef();
    const [file, setFile] = useState(); 
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!file) return;  // when file changes to undefined
        const fileReader = new FileReader();  // JS API: to convert file into an URL
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        }; // This function will run once "readAsDataURL" finishes
        fileReader.readAsDataURL(file);
    }, [file]);

    const pickHandler = event => {
        let pickedFile;
        let validCondition = isValid;
        if (event.target.files && event.target.files.length === 1) {
            pickedFile = event.target.files[0];
            validCondition = true;
            setFile(pickedFile);
            setIsValid(true);
        } else {
            validCondition = false;
            setIsValid(false);
        }
        props.onInput(props.id, pickedFile, validCondition);
    }

    // This is to open the <input type="file">
    const pickImageHandler = () => {
        filePickerRef.current.click();
    };

    return (
        <div className="form-control">
            <input 
                id={props.id} 
                ref={filePickerRef}
                type="file" 
                style={{display: "none"}} 
                accept='.jpg,.png,.jpeg'
                onChange={pickHandler}  // only trigger after you pick an image and click "open"
            />
            <div className={`image-upload ${props.center && "center"}`}>
                <div className="image-upload__preview">
                    {previewUrl && <img src={previewUrl} alt="preview"/>}
                    {!previewUrl && <p>You have to pick an image</p>}
                </div>
                <Button type="button" onClick={pickImageHandler}>PICK IMAGE</Button>
            </div>
        </div>
    )
};

export default ImageUpload;