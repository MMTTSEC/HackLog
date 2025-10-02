import type {JSX} from 'react';
import{createElement} from 'react';
// page components
import NotFoundPage from './pages/NotFoundPage.tsx';
import Start from './pages/Start.tsx';
import Login from './pages/Login.tsx';
import Articles from './pages/Articles.tsx';
import MyArticles from './pages/MyArticles.tsx';
import AllUsers from './pages/AllUsers.tsx';
import AdminAllArticles from './pages/AdminAllArticles.tsx';
import CreateArticle from './pages/CreateArticle.tsx';
import Article from './pages/Article.tsx';
import Register from './pages/Register.tsx';

interface Route {
  element: JSX.Element;
  path: string;
  loader?: Function;
  menuLabel?: string;
  index?: number;
  parent?: string;
}

export default [
  NotFoundPage,
  Start,
  Login,
  Articles,
  Article,
  Register,
  MyArticles,
  CreateArticle,
  AllUsers,
  AdminAllArticles
]
  // map the route property of each page component to a Route
  .map(x => (({ element: createElement(x), ...x.route }) as Route))
  // sort by index (and if an item has no index, sort as index 0)
  .sort((a, b) => (a.index || 0) - (b.index || 0));