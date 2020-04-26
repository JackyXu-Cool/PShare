import React, { useEffect, useState } from "react";

import UsersList from "../components/UsersList";
import LoadingSpinner from "../../shared/components/UIComponent/LoadingSpinner";
import ErrorModal from "../../shared/components/UIComponent/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

const User = () => {
    const {isLoading, error, sendRequest, errorHandler} = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();

    useEffect(() => {
        sendRequest(process.env.REACT_APP_SERVER_URL + "/users/", 'GET')
        .then(data => setLoadedUsers(data.users))
        .catch(err => console.log(err));
    }, [])

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler}/>
            {isLoading && <div className="center">
                <LoadingSpinner asOverlay/>
            </div>}
            {(!isLoading && loadedUsers) && <UsersList items={loadedUsers}/>}
        </React.Fragment>
    )
}

export default User;