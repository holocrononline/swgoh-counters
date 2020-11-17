import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import ReactGA from 'react-ga';
import _ from 'lodash';

import './App.scss';

import CountersPage from '../components/CountersPage/index';
import MyNavbar from '../components/MyNavbar/MyNavbar';
import NotFound from '../components/NotFound/NotFound';
import Account from '../components/Account/index';
import SubmissionForm from '../components/SubmissionForm/SubmissionForm';

import firebaseConnection from '../helpers/data/firebaseConnection';
import firebaseData from '../helpers/data/firebaseData';
import { getSquadData } from '../helpers/data/squadsData';
import { getAllCharacters } from '../helpers/data/characterData';

firebaseConnection();

const PrivateRoute = ({ component: Component, authenticated, ...rest }) => {
  const routeChecker = props => (authenticated === true
    ? (<Component {...props} {...rest} />)
    : (<Redirect to={{ pathname: '/', state: { from: props.location } }} />));
  return <Route {...rest} render={props => routeChecker(props)} />;
};

const defaultUser = {
  id: '',
  allyCode: '',
  email: '',
  patreonId: '',
  patronStatus: '',
  username: '',
};

const storedSquads = JSON.parse(sessionStorage.getItem('squads')) || [];
const storedCharacters = JSON.parse(sessionStorage.getItem('characters')) || [];

// TODO: write a script that deletes all associated counters if a squad is deleted
class App extends React.Component {
  state = {
    user: defaultUser,
    data: null,
    authenticated: false,
    characters: storedCharacters,
    squads: storedSquads,
    view: 'normal',
  }

  authenticateUser = (authUser) => {
    if (authUser) {
      const user = { id: authUser.uid, email: authUser.email };
      this.validateAccount(user);
      firebase.auth().getRedirectResult()
        .then((result) => {
          if (result.credential) {
            result.user.getIdToken(true)
              .then(token => sessionStorage.setItem('token', token));
          }
        });
      this.setState({ authenticated: true });
    } else {
      this.setState({ authenticated: false });
    }
  }

  getSquads = async () => {
    const results = await getSquadData();
    if (!_.isEqual(results, this.state.squads)) {
      this.setState({ squads: results });
      sessionStorage.setItem('squads', JSON.stringify(results));
    }
  }

  reload = () => window.location.reload();

  getCharacters = async () => {
    const results = await getAllCharacters();
    this.setState({ characters: results });
    sessionStorage.setItem('characters', JSON.stringify(results));
  }

  async componentDidMount() {
    this.removeListener = firebase.auth().onAuthStateChanged(this.authenticateUser);
    ReactGA.pageview(window.location.pathname);
    this.getCharacters();
    this.getSquads();
  }

  handleAllyCode = (e) => {
    const user = Object.assign({}, this.state.user);
    user.allyCode = e.target.value;
    this.setState({ user });
  };

  handleClearAllyCode = () => {
    const {
      id, allyCode, email, patreonId, patronStatus, username,
    } = this.state;
    const user = {
      id,
      allyCode,
      email,
      patreonId,
      patronStatus,
      username,
    };
    this.setState({ user });
    firebaseData.updateUserInfo(user);
  };

  handleLogout = () => {
    this.setState({ user: defaultUser });
  }

  handleViewBtn = () => {
    this.setState({ view: this.state.view === 'normal' ? 'reverse' : 'normal' });
  }

  setUserInfo = (res) => {
    this.setState(prevState => ({
      user: {
        ...prevState.user,
        email: res.email,
        allyCode: res.allyCode,
        id: res.id,
        patreonId: res.patreonId,
        patronStatus: res.patronStatus,
        username: res.username,
      },
    }));
  };

  unlinkPatreonAccount = () => {
    this.setState(prevState => ({
      user: {
        ...prevState.user,
        patreonId: '',
        patronStatus: '',
      },
    }));
  };

  validateAccount = (user) => {
    firebaseData.getUserByFirebaseAuthUid(user.id)
      .then((res) => {
        if (res !== '') {
          this.setUserInfo(res);
          return console.info(`Firebase user ${res.email} validated`);
        }
        console.info('No Firebase user found in DB');
        firebaseData.createUser(user)
          .then(response => this.setUserInfo(response));
        return console.info('User created in Firebase');
      })
      .catch(err => console.error(err));
  };

  render() {
    const { authenticated, user, view } = this.state;
    return (
      <div id="App" className="App">
        <BrowserRouter basename="/" hashType="slash">
            <React.Fragment>
              <MyNavbar
                authenticated={authenticated}
                handleLogout={this.handleLogout}
              />
              <div id="modal"></div>
              <div>
                  <Switch>
                    <Route exact path="/" render={props => <CountersPage
                        {...props}
                        authenticated={authenticated}
                        handleViewBtn={this.handleViewBtn}
                        reload={this.reload}
                        size={'5v5'}
                        user={user}
                        view={view}
                      />}
                    />

                    <Route exact path="/3v3" render={props => <CountersPage
                        {...props}
                        authenticated={authenticated}
                        handleViewBtn={this.handleViewBtn}
                        reload={this.reload}
                        size={'3v3'}
                        user={user}
                        view={view}
                      />}
                    />

                    <Route exact path="/submit" component={ SubmissionForm } />


                    <PrivateRoute
                      exact path="/account"
                      authenticated={authenticated}
                      component={Account}
                      handleClearAllyCode={this.handleClearAllyCode}
                      handleAllyCode={this.handleAllyCode}
                      unlinkPatreonAccount={this.unlinkPatreonAccount}
                      user={user}
                    />

                    <Route component={NotFound} />
                    <Redirect from="*" to="/" />
                  </Switch>
              </div>
            </React.Fragment>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
