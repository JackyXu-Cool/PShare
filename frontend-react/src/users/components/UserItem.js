import React, { useState } from "react";
import {Link} from "react-router-dom";

import Card from "../../shared/components/UIComponent/Card";
import Avatar from "../../shared/components/UIComponent/Avatar";
import "./UserItem.css";

const UserItem = props => {
    const [imageURL, setImageURL] = useState(null);

    const getImageURL = async () => {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/${props.image}`);
        if (response.status === 200) {
            setImageURL(`${process.env.REACT_APP_SERVER_URL}/${props.image}`);
        } else {
            setImageURL(`${process.env.REACT_APP_SERVER_URL}/uploads/images/backup.jpg`); 
        }
    };

    getImageURL();

    return (
        <li className="user-item">
            <Card className="user-item__content">
                <Link to={`/${props.id}/places`}>
                    <div className="user-item__image">
                        <Avatar image={imageURL} alt={props.name}/>
                    </div>
                    <div className="user-item__info">
                        <h2>{props.name}</h2>
                        <h3>{props.placeCount} {props.placeCount === 1 ?"place" :"places"}</h3>
                    </div>
                </Link>
            </Card>
        </li>
    )
}

export default UserItem;