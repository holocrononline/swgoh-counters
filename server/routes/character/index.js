const routeFactory = require('./routes');

module.exports = app => async (server) => {
  const data = require('./data')(app);
  data.zeta = require('../zeta/data')(app);
  const routes = routeFactory({ ...app, data });
  return routes.forEach(route => server.route(route));
};
