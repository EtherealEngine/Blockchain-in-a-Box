const Endpoints = {
  //HOST: 'http://localhost:8080',
  HOST: 'http://af2fc18b539ee488984fa4e58de37686-1454411376.us-west-1.elb.amazonaws.com',
  GET_ADMIN_FIRSTTIME: '/api/v1/admin/firsttime',
  POST_ADMIN_LOGIN: '/api/v1/admin/login',
  POST_ADMIN_AUTHENTICATION: '/api/v1/admin/authentication',
  SETUP_ORG: "/api/v1/onboarding-data/",
  // ONBOARDING_DATA: "/api/v1/onboarding-data?email=devjeetroychowdhury@gmail.com"
  ONBOARDING_DATA: "/api/v1/onboarding-data",
  ADD_USER: "/api/v1/user-data",
  DEPLOYMENT: "/api/v1/truffle-data",
  TIMER: "/api/v1/initiate-timer",
  AUTH_SERVER:'/api/v1/authorizeServer',
  ETH_STATS_DASHBOARD_URL:"http://a76ab76cfc49440a594d947189734303-848168955.us-west-1.elb.amazonaws.com",
  REMIX_IDE_URL:"http://a04d1d57d648441d793c178bfae2784e-1027067517.us-west-1.elb.amazonaws.com"
};

export default Endpoints;
