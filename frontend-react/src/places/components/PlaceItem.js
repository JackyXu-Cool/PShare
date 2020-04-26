import React, {useState, useContext} from "react";

import Modal from "../../shared/components/UIComponent/Modal";
import Card from "../../shared/components/UIComponent/Card";
import Button from "../../shared/components/FormElements/Button";
import Map from "../../shared/components/UIComponent/Map"
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import { AuthContext } from "../../shared/context/auth-context"
import { useHttpClient } from "../../shared/hooks/http-hook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faMapMarked } from "@fortawesome/free-solid-svg-icons";
import "./PlaceItem.css";

const PlaceItem = props => {
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setConfirmModal] = useState(false);
    const [likes, setLikes] = useState(props.likes);
    const [likeDisable, setLikeDisable] = useState(false);
    const {isLoading, error, sendRequest, errorHandler} = useHttpClient();
    const auth = useContext(AuthContext);

    const openMapHandler = () => {
        setShowMap(true);
    }

    const closeMapHandler = () => {
        setShowMap(false);
    }

    const showDeleteHandler = () => {
        setConfirmModal(true);
    }

    const closeDeleteHandler = () => {
        setConfirmModal(false);
    }

    // It will delete the data in the backend later
    const confirmDeleteHandler = () => {
        setConfirmModal(false);
        sendRequest(process.env.REACT_APP_SERVER_URL + `/places/${props.id}`, "DELETE", null, 
        {"Authorization": `Bearer ${auth.token}`})
        .then(() => props.onDelete(props.id))
        .catch(err => console.log(err));
    }

    const likesHandler = () => {
        sendRequest(process.env.REACT_APP_SERVER_URL + `/places/likes/${props.id}`, "PATCH")
        .then(data => {
            setLikes(data["likes"]);
            setLikeDisable(true);
        })
        .catch(err => console.log(err));
    }

    return (
    <React.Fragment>
        <ErrorModal error={error} onClear={errorHandler} />
        <Modal  
            show={showMap} 
            onCancel={closeMapHandler}
            header={props.address}
            contentClass="place-item__modal-content"
            footerClass="place-item__modal-actions"
            footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
        >
            <div className="map-container">
               <Map center={props.coordinates} zoom={16}/>
            </div>
        </Modal>
        <Modal
            show={showConfirmModal}
            onCancel={closeDeleteHandler}
            header="Are you sure?"
            footerClass="place-item_modal-actions"
            footer={
            <React.Fragment>
                <Button inverse onClick={closeDeleteHandler}>CANCEL</Button>
                <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
            </React.Fragment>}>
            <p>Do you want to proceed and delete this place?</p>
        </Modal>
        <li className="place-item">
            { isLoading && <LoadingSpinner asOverlay/> }
            <Card className="place-item__content">
                <div className="place-item__image">
                    <img src={`${process.env.REACT_APP_SERVER_URL}/${props.image}`} alt={props.title}/>
                </div>
                <div className="place-item__info">
                    <h2>{props.title}</h2>
                    <h3>{props.address}</h3>
                    <p>{props.description}</p>
                </div>
                <div className="place-item__actions">
                    <Button inverse onClick={openMapHandler}>VIEW ON MAP</Button>
                    { auth.userId === props.creatorID && <Button to={`/places/${props.id}`}>EDIT</Button> }
                    { auth.userId === props.creatorID && <Button danger onClick={showDeleteHandler}>DELETE</Button> }
                    <Button onClick={likesHandler} disabled={likeDisable}>
                        <FontAwesomeIcon icon={faThumbsUp}/> {likes}
                    </Button>
                </div>
            </Card>
        </li>
    </React.Fragment>);
}

export default PlaceItem;
