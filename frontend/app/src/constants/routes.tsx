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
    path: routePaths.mainRoute(),
    component: Landing,
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
    path: routePaths.analyzeMain(),
    component: Analyze,
    exact: false,
  },
  {
    path: routePaths.analyzeConversations(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeConversationDetail(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeDashboard(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeStatistics(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeSentiment(),
    component: Analyze,
    exact: true,
  },
  {
    path: routePaths.analyzeSettings(),
    component: Analyze,
    exact: true,
  }
];

export default getRoutes;
