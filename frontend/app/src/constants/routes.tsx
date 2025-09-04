import { routePaths } from './routePaths';

import Login from '../containers/Login';
import Signup from '../containers/Signup';
import Landing from '../containers/Landing';
import AboutUs from '../containers/AboutUs';
import Profile from '../containers/Profile';
import Analyze from '../containers/Analyze/Analyze';

const getRoutes = () => [
  {
    path: routePaths.login(),
    component: Login,
    exact: true,
  },
  {
    path: routePaths.signup(),
    component: Signup,
    exact: true,
  },
  {
    path: routePaths.landing(),
    component: Landing,
    exact: true,
  },
  {
    path: routePaths.about(),
    component: AboutUs,
    exact: true,
  },
  {
    path: routePaths.profile(),
    component: Profile,
    exact: true,
  },
  {
    path: routePaths.analyze(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeMain(":agentId"),
    component: Analyze,
    exact: false,
  },
  {
    path: routePaths.analyzeConversations(":agentId"),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeConversationDetail(":agentId", ":convID"),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeDashboard(":agentId"),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeStatistics(":agentId"),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeSentiment(":agentId"),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeSettings(":agentId"),
    component: Analyze,
    exact: true,
  }
];

export default getRoutes;
