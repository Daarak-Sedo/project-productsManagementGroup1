import express from 'express';
const router = express.Router();
import { createUser, login, gateUser, updateUser } from '../controllers/userController.js';
import { createProduct, getProductByQuery, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCart, updateCart, getCart, deleteCart } from '../controllers/cartController.js';
import { createOrder, updateOrder } from '../controllers/orderController.js';
import { authentication, authorization } from '../middleware/auth.js';


//--------------FEATURE I - User---------------->
router.post('/register', createUser);  //aj
router.post('/login', login);          //sa
router.get('/user/:userId/profile', authorization, gateUser);   //shayan
router.put('/user/:userId/profile', authentication, authorization, updateUser); //shayan

//-------------FEATURE II - Product--------------->
router.post('/products', createProduct);               //aj
router.get('/products', getProductByQuery);            //shayan
router.get('/products/:productId', getProductById);     //shayan
router.put('/products/:productId', updateProduct);     //sa
router.delete('/products/:productId', deleteProduct)   //shayan

//------------FEATURE III - cart--------------->
router.post('/users/:userId/cart', authentication, authorization, createCart);        //aj
router.put('/users/:userId/cart', authentication, authorization, updateCart);         //bbbbb
router.get('/users/:userId/cart', authentication, authorization, getCart);            //shayan  
router.delete('/users/:userId/cart', authentication, authorization, deleteCart);      //shayan  

//-------------FEATURE IV - Order--------------->
router.post('/users/:userId/orders', authentication, authorization, createOrder);   //bbbb
router.put('/users/:userId/orders', authentication, authorization, updateOrder);    //sana


export default router;
