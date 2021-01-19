import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import ReactGA from 'react-ga';
import _ from 'lodash';
import {
  BrowserRouter, Redirect, Route, Switch,
} from 'react-router-dom';

import Account from 'src/components/Account/Account';
import CountersPage from 'src/components/CountersPage/CountersPage';
import MyNavbar from 'src/components/MyNavbar/MyNavbar';
import NotFound from 'src/components/NotFound/NotFound';
import SubmissionForm from 'src/components/SubmissionForm/SubmissionForm';

import {
  firebaseConnection, firebaseData, getSquadData, getAllCharacters,
} from 'src/helpers/data';

import './App.scss';

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
// TODO: add a dropdown for each opponent, so they can be edited
// TODO: in spreadsheet - replace all <br> tags in counters with \n
// TODO: create a FAQ in github
// TODO: BEFORE LAUNCH - change squadVersion['counterStrategy'] to 'generalStrategy' in db
// TODO: BEFORE LAUNCH - change counterVersion['description'] to 'counterStrategy' in db
// TODO: BEFORE LAUNCH - change videoLink['description'] to 'title' in db
// TODO: BEFORE LAUNCH - remove videoLink['subjectType']
// TODO: start to set up the videos section -
//  - need to create a script to import current videos
//  - add videos section to ModalAddCounter
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
