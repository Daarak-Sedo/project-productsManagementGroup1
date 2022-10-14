import cartModel from '../models/cartModel.js';
import { } from '../util/validator.js';


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

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


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
