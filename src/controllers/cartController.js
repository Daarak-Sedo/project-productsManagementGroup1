import cartModel from '../models/cartModel.js';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import { } from '../util/validator.js';
import {isValidObjectId,isValid} from '../util/validator.js';
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId



//======================================createCart =============================================>
const createCart = async (req, res) => {
    try {
     
      }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};


//======================================updateCart=============================================>

const updateCart = async (req, res) => {
    try {
       let userId = req.params.userId;
        let data = req.body
        let { productId, cartId, removeProduct } = req.body

        // ---------checking data in request body----------
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please provide deatila to update the documents" });
        }

        // ------------- user validation -------------------
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }

        //------------ find user in user collection --------------
        const validUser = await userModel.findById(userId);
        if (!validUser) {
            return res.status(404).send({ status: false, message: "User not present" })
        }


        //--------------- cart validation ---------------------
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please enter cart id" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is not valid" })
        }

        //----------------- find cartID in cart collection --------------
        const findCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!findCart) {
            return res.status(404).send({ status: false, message: "Cart not present" })
        }


        //------------------- product validation ------------------------
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please enter product id" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "product id is not valid" })
        }

        //--------------------find productId in product collection------------
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product not present" })
        }

        let items = findCart.items
        let productArr = items.filter(x => x.productId.toString() == productId)

        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "Product is not present in cart" })
        }

        let index = items.indexOf(productArr[0])

        //-------------- removeProduct validation -----------------------
        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "plz enter removeProduct" })
        }

        if (removeProduct != 1 && removeProduct != 0) {
            return res.status(400).send({ status: false, message: "Value of Removed Product Must be 0 or 1." })
        }

        if (removeProduct == 0) {
            findCart.totalPrice = (findCart.totalPrice - (findProduct.price * findCart.items[index].quantity)).toFixed(2)

            findCart.items.splice(index, 1)

            findCart.totalItems = findCart.items.length

            findCart.save()
           
        }

        if (removeProduct == 1) {
            findCart.items[index].quantity -= 1
            findCart.totalPrice = (findCart.totalPrice - findProduct.price).toFixed(2)

            if (findCart.items[index].quantity == 0) {
                findCart.items.splice(index, 1)
               }
            findCart.totalItems = findCart.items.length
            findCart.save()
        }
        return res.status(200).send({ status: true, message: "Success", data: findCart })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



//======================================getCart=============================================>
const getCart = async (req, res) => {
    try {
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteCart=============================================>
const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: ` '${userId}' this userId is invalid.` })

        let foundCart = await cartModel.findOne({ userId })
        if (!foundCart) return res.status(404).send({ status: false, message: `Cart not found`})

        if (foundCart.totalItems === 0)
            return res.status(404).send({ status: false, message: `Item already deleted.` })
        
        const deleteCart = await cartModel.findOneAndUpdate({ _id: foundCart._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        res.status(204).send({ status: true, message: `successfully deleted.`, data: deleteCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createCart, updateCart, getCart, deleteCart };
