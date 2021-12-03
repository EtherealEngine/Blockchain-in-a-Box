const Endpoints = {
  // HOST: 'http://localhost:8080',
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
};

export default Endpoints;
