import React, { Suspense } from 'react';
import { ColorRing } from 'react-loader-spinner';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RequireAuth from './components/RequireAuth';
import Listing from './pages/Listing';

const Navbar = React.lazy(() => import('./components/Navbar'))
const Create = React.lazy(() => import('./pages/Create'))
const Delivery = React.lazy(() => import('./pages/Delivery'))
const Messages = React.lazy(() => import('./pages/Messages'))
const Signin = React.lazy(() => import('./pages/Signin'))
const Signup = React.lazy(() => import('./pages/Signup'));
const About = React.lazy(() => import('./pages/About'))
const Buying = React.lazy(() => import('./components/delivery/Buying'));
const Selling = React.lazy(() => import('./components/delivery/Selling'));
const SingleChat = React.lazy(() => import('./components/messages/SingleChat'));
const EditList = React.lazy(() => import('./components/create/EditList'));
const PrivateInfo = React.lazy(() => import('./components/profile/PrivateInfo'));
const PrivateListings = React.lazy(() => import('./components/profile/PrivateListings'));
const PrivateProfile = React.lazy(() => import('./components/profile/PrivateProfile'));
const PrivatePurchases = React.lazy(() => import('./components/profile/PrivatePurchases'));
const PublicInfo = React.lazy(() => import('./components/profile/PublicInfo'));
const PublicListing = React.lazy(() => import('./components/profile/PublicListings'));
const PublicProfile = React.lazy(() => import('./components/profile/PublicProfile'));
const ReList = React.lazy(() => import('./components/create/ReList'));
const ChooseCountry = React.lazy(() => import('./components/signin/ChooseCountry'))
const PrivateInfoEdit = React.lazy(() => import('./components/profile/PrivateInfoEdit'));

const ROLES = {
  'User': 2001,
  'Admin': 5150
}

const Loader =
  <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} className=''>
    <ColorRing
      visible={true}
      height="80"
      width="80"
      ariaLabel="blocks-loading"
      wrapperStyle={{}}
      wrapperClass="blocks-wrapper"
      colors={['#494949', '#494949', '#494949', '#494949', '#494949']}
    />
  </div>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/signin" element={<Suspense fallback={Loader}>< Signin /></Suspense>} />
        <Route path="/signup">
          <Route index element={<Suspense fallback={Loader}>< Signup /></Suspense>} />
          <Route path="country" element={<Suspense fallback={Loader}><ChooseCountry /></Suspense>} />
        </Route>

        <Route path='/' element={<Navbar />}>
          <Route index element={<Listing />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/create" element={<Suspense fallback={Loader}><Create /></Suspense>} />
            <Route path="/delivery" element={<Suspense fallback={Loader}><Delivery /></Suspense >} />
            <Route path="/messages" element={<Suspense fallback={Loader}><Messages /></Suspense >} />
            <Route path="/about" element={<Suspense fallback={Loader}><About /></Suspense>} />

            <Route path="/profile">
              <Route path="public/:id" element={<Suspense fallback={Loader}><PublicProfile /></Suspense>} >
                <Route index element={<Suspense fallback={Loader}><PublicInfo /></Suspense>} />
                <Route path="listings" element={<Suspense fallback={Loader}><PublicListing /></Suspense>} />
              </Route>

              <Route path="private" element={<Suspense fallback={Loader}><PrivateProfile /></Suspense>} >
                <Route index element={<Suspense fallback={Loader}><PrivateInfo /></Suspense>} />
                <Route path="edit" element={<Suspense fallback={Loader}><PrivateInfoEdit /></Suspense>} />
                <Route path="listings" element={<Suspense fallback={Loader}><PrivateListings /></Suspense>} />
                <Route path="purchases" element={<Suspense fallback={Loader}><PrivatePurchases /></Suspense>} />
              </Route>
            </Route>

            <Route path="/create">
              <Route path="edit" element={<Suspense fallback={Loader}><EditList /></Suspense>} />
              <Route path="relist" element={<Suspense fallback={Loader}><ReList /></Suspense>} />
            </Route>

            <Route path="/messages">
              <Route path="chat" element={<Suspense fallback={Loader}><SingleChat /></Suspense>} />
            </Route>

            <Route path="/delivery" element={<Suspense fallback={Loader}><Delivery /></Suspense>}>
              <Route index element={<Suspense fallback={Loader}><Buying /></Suspense>} />
              <Route path="selling" element={<Suspense fallback={Loader}><Selling /></Suspense>} />
            </Route>
          </Route>
        </Route>

      </Routes >
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" className='xsm:max-w-[300px] font-sans text-[.9em] sm:max-w-[300px] xsm:ml-auto sm:ml-auto' />
    </BrowserRouter >
  )
}

export default App