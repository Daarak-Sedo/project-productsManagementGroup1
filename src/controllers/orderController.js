import orderModel from '../models/orderModel.js';
import { } from '../util/validator.js';
import {isValidObjectId,isValidIncludes} from '../util/validator.js';



//======================================createOrder=============================================>
const createOrder = async (req, res) => {
    try {
          let userId = req.params.userId
        let data = req.body

        //DEstructuring
        let { cartId, cancellable, status } = data

        let userToken = req.userId

        //check productId is Valid ObjectId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }

        //find userID in user collection
        const validUser = await userModel.findById(userId);

        if (!validUser) {
            return res.status(404).send({ status: false, message: "User not present" })
        }

        // //Authorisation
        // if (userToken !== userId) {
        //     return res.status(403).send({ status: false, message: "Unauthorized user" })
        // }

        //validation for empty Request body
        if (Object.keys(data).length == 0) {
            res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" })
            return
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please enter cartId" })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is not valid" })
        }

        //find cartID in cart collection
        const findCart = await cartModel.findOne({ _id: cartId, userId: userId })

        if (!findCart) {
            return res.status(404).send({ status: false, message: "No cart found" })
        }


        let itemsArr = findCart.items
        if (itemsArr.length == 0) {
            return res.status(400).send({ status: false, message: "Cart is empty" })
        }

        let sum = 0
        for (let i of itemsArr) {
            sum += i.quantity
        }


        //create Object to add data
        let newData = {
            userId: userId,
            items: findCart.items,
            totalPrice: findCart.totalPrice,
            totalItems: findCart.totalItems,
            totalQuantity: sum
        }

        //validation
        if (isValidIncludes("cancellable", data)) {
            if (!isValid(cancellable)) {
                return res.status(400).send({ status: false, message: "Please enter cancellable" })
            }
            if (![true, false].includes(cancellable)) {
                return res.status(400).send({ status: false, message: "cancellable must be a boolean value" })
            }
            newData.cancellable = cancellable

        }
        if (isValidIncludes("status", data)) {
            if (!isValid(status)) {
                return res.status(400).send({ status: false, message: "Please enter status" })
            }
            if (!["pending", "completed", "canceled"].includes(status)) {
                return res.status(400).send({ status: false, message: "status must be a pending,completed,canceled" })
            }
            newData.status = status

        }
        const orderCreated = await orderModel.create(newData)

        //here order is done thats why making cart empty
        findCart.items = []
        findCart.totalItems = 0
        findCart.totalPrice = 0
        findCart.save()

        return res.status(201).send({ status: true, message: "Success", data: orderCreated })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateOrder=============================================>
const updateOrder = async (req, res) => {
    try {
       
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createOrder, updateOrder }
