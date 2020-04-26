import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import MainNavigation from "./shared/components/Navigation/MainNavigation";
import User from "./users/pages/User";
import UserPlaces from "./places/pages/UserPlaces";
import NewPlace from "./places/pages/NewPlace";
import UpdatePlace from "./places/pages/UpdatePlace";
import Authenticate from "./users/pages/authenticate";
import { AuthContext } from "./shared/context/auth-context"

let logoutTimer;

const App = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const login = useCallback((uid, token) => {
    const tokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60);
    localStorage.setItem("UserData", JSON.stringify({
      userId: uid, 
      token: token,
      expiration: tokenExpirationDate.toISOString() // a special string format to store date.
    }));
    setUserId(uid);
    setToken(token);
  }, [])

  const logout = useCallback(() => {
    setUserId(null);
    setToken(null);
    localStorage.removeItem("UserData");
  }, [])

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("UserData"));
    if (storedData) {
      if (new Date(storedData.expiration) > new Date()) {
        setToken(storedData.token);  // log user in 
        setUserId(storedData.userId); // log user in
      } else {
        localStorage.removeItem("UserData");
      }
    }
  }, [login]); // Only run once. To log user in if [1] token in local storage [2] token does not expire

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("UserData"));
    if (token && storedData) {
      logoutTimer = setTimeout(logout, new Date(storedData.expiration).getTime() - new Date().getTime());      
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout]); // Log user out automatically if the token expires
  // if token is set to null, then clear the timeout
  // if a valid token is set, then set up the timeout

  let routes;
  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <User />
        </Route>
        <Route path="/:userid/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeid">
          <UpdatePlace />
        </Route>
        <Redirect to="/" />
      </Switch>
    )
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
            <User />
        </Route>
        <Route path="/:userid/places" exact>
            <UserPlaces />
        </Route>
        <Route path="/auth">
            <Authenticate />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    )
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn: !!token,
        token: token, 
        userId: userId, 
        login: login, 
        logout: logout 
      }}
    >
      <Router>
        <MainNavigation />
        <main>
            {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
