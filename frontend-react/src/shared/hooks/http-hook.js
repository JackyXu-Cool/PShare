import { useState, useCallback } from "react";

export const useHttpClient = () => {
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const sendRequest = useCallback(
        async (url, method='GET', body=null, headers={}) => {
            setIsLoading(true);

            try {
                const response = await fetch(`${url}`, {
                    method: method,
                    headers: headers,
                    body: body
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }
                setIsLoading(false);  
                return data;
            } catch (err) {
                setError(err.message);
                setIsLoading(false);  
                throw err;
            }
    }, []);

    const errorHandler = () => {
        setError(null);
    }

    return {isLoading: isLoading, 
            error: error, 
            sendRequest: sendRequest,
            errorHandler: errorHandler}
};