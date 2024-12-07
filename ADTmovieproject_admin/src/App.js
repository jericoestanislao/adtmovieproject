import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Login from './pages/Public/Login/Login';
import Register from './pages/Public/Register/Register';
import Dashboard from './pages/Main/Dashboard/Dashboard';
import Main from './pages/Main/Main';
import Movie from './pages/Main/Movie/Movie';
import Lists from './pages/Main/Movie/Lists/Lists';
import Form from './pages/Main/Movie/Form/Form';
import CastandCrew from './pages/Main/Movie/CastandCrew/CastandCrew'; // Corrected path
import Videos from './pages/Main/Movie/Videos/Videos'; // Corrected path
import Photos from './pages/Main/Movie/Photos/Photos'; // Corrected path
import { AuthProvider } from './context/context';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/main',
    element: <Main />,
    children: [
      //Temporarily disabled the dashboard route
       //Uncomment if Dashboard is needed
       {
        path: 'dashboard',
         element: <Dashboard />,
       },
      {
        path: 'movies',
        element: <Movie />,
        children: [
          {
            path: '', // Default route for "/main/movies"
            element: <Lists />,
          },
          {
            path: 'form/:movieId?',
            element: <Form />,
            children: [
              {
                path: 'castandcrews',
                element: <CastandCrew />,
              },
              {
                path: 'videos',
                element: <Videos />,
              },
              {
                path: 'photos',
                element: <Photos />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
    <div className='App'>
      <RouterProvider router={router} />
    </div>
    </AuthProvider>
  );
}

export default App;
