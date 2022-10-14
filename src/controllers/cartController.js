import cartModel from '../models/cartModel.js';
import userModel from '../models/userModel.js';
import { } from '../util/validator.js';
import {isValidObjectId,isValid} from '../util/validator.js';



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
        const validCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!validCart) {
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
        const validProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!validProduct) {
            return res.status(404).send({ status: false, message: "Product not present" })
        }

        let items = validCart.items
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
            validCart.totalPrice = (validCart.totalPrice - (validProduct.price * validCart.items[index].quantity)).toFixed(2)
            validCart.items.splice(index, 1)

            validCart.totalItems = validCart.items.length
            validCart.save()
        }

        if (removeProduct == 1) {
            validCart.items[index].quantity -= 1
            validCart.totalPrice = (validCart.totalPrice - validProduct.price).toFixed(2)

            if (validCart.items[index].quantity == 0) {
                validCart.items.splice(index, 1)
               }
            validCart.totalItems = validCart.items.length
            validCart.save()
        }
        return res.status(200).send({ status: true, message: "Success", data: validCart })
        
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



//======================================getCart=============================================>
const getCart = async (req, res) => {
    try {
        // const userId = req.params.userId

        // const foundCart = await cartModel.findOne({ userId }).select({ createdAt: 0, updatedAt: 0 }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 })

        // if (!foundCart)
        //     return res.status(404).send({ status: false, message: `No such cart found for this user.`})

        // if (foundCart.items.length == 0)
        //     return res.status(200).send({ status: true, message: 'Cart empty', data: foundCart })

        // res.status(200).send({ status: true, message: 'Success', data: foundCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteCart=============================================>
const deleteCart = async (req, res) => {
    try {
        // const userId = req.params.userId;

        // if (!isValidObjectId(userId))
        //     return res.status(400).send({ status: false, message: ` '${userId}' this productId is invalid.` })

        // let foundCart = await cartModel.findOne({ userId })
        // if (!foundCart) return res.status(404).send({ status: false, message: 'no such cart found for this user' })

        // if (foundCart.totalItems === 0)
        //     return res.status(404).send({ status: false, message: `Item already deleted.` })
        
        // const deleteCart = await cartModel.findOneAndUpdate({ _id: foundCart._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        // res.status(204).send({ status: true, message: 'successfully deleted', data: deleteCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createCart, updateCart, getCart, deleteCart };
