import './App.css'
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import ScrollTop from './Components/ScrollTop'
import ProtectedRoute from './Components/ProtectedRoute';

// Home Sections
import Hero from './Components/Hero'
import Category from './Components/Category'
import Launch from './Components/Launch'
import Newsletter from './Components/Newsletter'
import AppPromotion from './Components/AppPromotion'
import ShopTheLook from './Components/ShopTheLook'
import HogaaInMotion from './Components/HogaaInMotion'

// Pages
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Offers from './Pages/Offers'
import Wishlist from "./Pages/Wishlist";
import About from './Footer/About'
import Faq from './Footer/Faq'
import Return from './Footer/Return'
import Contact from './Footer/Contact'
import Term from './Footer/Term'
import Store from './Footer/Store'
import ProductDetail from './Pages/ProductDetail'
import CategoryProductPage from "./Pages/CategoryProductPage";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
import Orders from "./Pages/Orders";
import Profile from './Components/Profile'
import PaymentSuccess from './Pages/PaymentSuccess';
import PaymentFailed from './Pages/PaymentFailed';
import DynamicPage from './Components/DynamicPage';
import SearchPage from './Pages/SearchPage';

const Home = () => (
  <>
    <Hero />
    <Category />
    <HogaaInMotion />
    <Launch />
    <ShopTheLook />
    {/* <Newsletter /> */}
    <AppPromotion />
  </>
);

// Layout wrapper for pages with Navbar & Footer
const MainLayout = ({ children, hideNavFooter = false }) => {
  const location = useLocation();
  const shouldHideNavFooter = hideNavFooter || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!shouldHideNavFooter && <Navbar />}
      {!shouldHideNavFooter && <ScrollTop />}
      {children}
      {!shouldHideNavFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Home />
            </MainLayout>
          } />

          <Route path="/login" element={
            <MainLayout>
              <Login />
            </MainLayout>
          } />
          <Route path="/:slug" element={
            <MainLayout>
              <DynamicPage />
            </MainLayout>
          } />


          <Route path="/signup" element={
            <MainLayout>
              <Signup />
            </MainLayout>
          } />

          <Route path="/product/:slug" element={
            <MainLayout>
              <ProductDetail />
            </MainLayout>
          } />

          <Route path="/collections/:categorySlug" element={
            <MainLayout>
              <CategoryProductPage />
            </MainLayout>
          } />

          <Route path="/search" element={
            <MainLayout>
              <SearchPage />
            </MainLayout>
          } />

          <Route path="/offers" element={
            <MainLayout>
              <Offers />
            </MainLayout>
          } />

          <Route path="/about" element={
            <MainLayout>
              <About />
            </MainLayout>
          } />

          <Route path="/terms" element={
            <MainLayout>
              <Term />
            </MainLayout>
          } />

          <Route path="/contact" element={
            <MainLayout>
              <Contact />
            </MainLayout>
          } />

          <Route path="/faq" element={
            <MainLayout>
              <Faq />
            </MainLayout>
          } />

          <Route path="/return" element={
            <MainLayout>
              <Return />
            </MainLayout>
          } />

          <Route path="/store" element={
            <MainLayout>
              <Store />
            </MainLayout>
          } />

          {/* Payment Routes (No Navbar/Footer) */}
          <Route path="/payment-success" element={
            <MainLayout hideNavFooter={true}>
              <PaymentSuccess />
            </MainLayout>
          } />

          <Route path="/payment-failed" element={
            <MainLayout hideNavFooter={true}>
              <PaymentFailed />
            </MainLayout>
          } />

          <Route path="/payment-cancelled" element={
            <MainLayout hideNavFooter={true}>
              <PaymentFailed />
            </MainLayout>
          } />

          {/* Protected Routes (require login) */}
          <Route path="/cart" element={
            <MainLayout>
              <Cart />
            </MainLayout>
          } />

          <Route path="/checkout" element={
            <MainLayout>
              <Checkout />
            </MainLayout>
          } />

          <Route path="/order-success" element={
            <ProtectedRoute>
              <MainLayout>
                <OrderSuccess />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/wishlist" element={
            <ProtectedRoute>
              <MainLayout>
                <Wishlist />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <MainLayout>
                <Orders />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App;