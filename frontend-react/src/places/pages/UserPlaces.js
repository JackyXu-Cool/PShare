import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserPlaces = () => {
    const userID = useParams().userid;

    const { isLoading, error, sendRequest, errorHandler } = useHttpClient();
    const [loadedPlace, setLoadedPlace] = useState([]);

    useEffect(() => {
        sendRequest(process.env.REACT_APP_SERVER_URL + `/places/user/${userID}`, "GET")
        .then(data => setLoadedPlace(data.places))
        .catch(err => console.log(err));
    }, [userID])

    const placeDeleteHandler = deletePlaceID => {
        setLoadedPlace(prevPlaces => prevPlaces.filter(p => p.id !== deletePlaceID));
    }

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler} />
            {isLoading && 
            <div className="center">
                <LoadingSpinner asOverlay />
            </div>}
            {(!isLoading && setLoadedPlace) &&<PlaceList items={loadedPlace} onDeletePlace={placeDeleteHandler}/>}
        </React.Fragment>
    );
}

export default UserPlaces;