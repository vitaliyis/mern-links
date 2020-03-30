import React from 'react';
import 'materialize-css'
import {BrowserRouter as Router} from 'react-router-dom'
import {useRoutes} from "./routes";
import {useAuth} from "./hooks/auth.hook";
import {AuthContext} from "./context/AuthContext";
import {Navbar} from "./component/Navbar";
import {Loader} from "./component/Loader";

function App() {
  const {token, login, logout, userId, ready} = useAuth()
  const isAuthenticated = !!token      // говорит зарегистрирован ли пользователь в системе или нет
  const routes = useRoutes(isAuthenticated)

  if (!ready) {
    return <Loader />
  }
  return (
    <AuthContext.Provider value={{
      token, login, logout, userId, isAuthenticated
    }}>
    <Router>
      {isAuthenticated && <Navbar/>}
      <div className="container">
        {routes}
      </div>
    </Router>
    </AuthContext.Provider>
  );
}

export default App;
