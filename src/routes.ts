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
import EditArticle from './pages/EditArticle.tsx';
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
  EditArticle,
  AllUsers,
  AdminAllArticles
]
  .map(x => (({ element: createElement(x), ...(x as any).route }) as Route))
  .sort((a, b) => (a.index || 0) - (b.index || 0));