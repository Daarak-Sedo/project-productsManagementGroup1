import productModel from '../models/productModel.js';
import uploadFile from '../aws/aws.js';
import { isValidObjectId, isValid, isValidPrice, isBoolean, isValidString } from '../util/validator.js';
// import { isValidName, isValidEmail, isValidFile, isValidNumber, isValidPass, isValidTxt, isValidPin, isValidObjectId } from '../util/validator.js';
import getSymbolFromCurrency from 'currency-symbol-map'


//======================================createProduct=============================================>
const createProduct = async (req, res) => {
    
        const file = req.files;
        const data = req.body;

        //------------------------------body validation--------------------------------->
        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, message: `Please provide product details` });

        if (Object.keys(data).length > 12)
            return res.status(400).send({ status: false, message: `You cam't add extra field` });

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!isValid(title))
            return res.status(400).send({ status: false, message: `Title is required and should be a valid string.` })

        const dupTitle = await productModel.findOne({ title })
        if (dupTitle)
            return res.status(400).send({ status: false, message: `This '${title}' is already in use` })

        if (!isValid(description))
            return res.status(400).send({ status: false, message: `Description is required and should be a valid string.` })

        if (!isValidPrice(price))
            return res.status(400).send({ status: false, message: `Price is required and should be a valid price e.g(54,589.23,6726,etc).` })

        if (!isValid(currencyId))
            return res.status(400).send({ status: false, message: `Currency id is required and should be a valid string.` })

        if (currencyId !== 'INR')
            return res.status(400).send({ status: false, message: `INR should be the currency id.` })

        if (!currencyFormat)
            return res.status(400).send({ status: false, message: `Please enter valid Indian currency Id (INR) to get the currency format.` })

        const symbol = getSymbolFromCurrency('INR')
        data['currencyFormat'] = symbol
        console.log(symbol)

        if (isFreeShipping) {
            if (!isBoolean(isFreeShipping))
                return res.status(400).send({ status: false, message: "Is free Shipping value should be boolean" })
        }

        if (style) {
            if (!isValidString(style))
                return res.status(400).send({ status: false, message: "Style should be a valid string" })
        }

        if (!isValid(availableSizes))
            return res.status(400).send({ status: false, message: "Please enter available sizes,it is required" })

        if (availableSizes) {
            let sizeArray = availableSizes.split(',').map(x => x.trim())
            //console.log(sizeArray)
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XL", "XXL"].includes(sizeArray[i]))) {
                    return res.status(400).send({ status: false, message: `Please enter size from available sizes ["S","XS","M","X","L","XL","XXL"]` })
                }
            }
            data['availableSizes'] = sizeArray
        }
        if (installments) {
            if (isNaN(Number(installments))) return res.status(400).send({ status: false, message: "Installments should be a valid number" })
        }

        //if (!(req.body.productImage)) return res.status(400).send({ status: false, message: "Product image is required" })

        if (!(file && file.length)) return res.status(400).send({ status: false, message: "No file found" })

        let uploadedFileUrl = await uploadFile(file[0])
        data['productImage'] = uploadedFileUrl

        const saveProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Product created successfully", data: saveProduct })
    
};


//==========================================getProducts=============================================>
const getProductByQuery = async (req, res) => {
    try {
        const reqBody = req.query
        let { name, priceGreaterThan, priceLessThan, size, priceSort, ...rest } = reqBody

        if (Object.keys(reqBody).length === 0)
            return res.status(400).send({ status: false, message: `Please enter some data for searching.` })
        
        let filters
        let searchObj = { isDeleted: false }
        priceSort = parseInt(priceSort)

        if (Object.keys(rest).length > 0)
            return res.status(400).send({ status: false, message: `You can't search by '${Object.keys(rest)}' this key` });
        
        if (size) {
            size = size.toUpperCase().split(',')
            searchObj.availableSizes = { $in: size }
        }

        if (name)
            searchObj.title = { $regex: name.trim(), $options: 'i' }

        if (priceGreaterThan)
            searchObj.price = { $gt: priceGreaterThan }

        if (priceLessThan)
            searchObj.price = { $lt: priceLessThan }

        if (priceGreaterThan && priceLessThan)
            searchObj.price = { $gt: priceGreaterThan, $lt: priceLessThan }

        if (priceSort > 1 || priceSort < -1 || priceSort === 0)
            return res.status(400).send({ status: false, message: `Please sort by '1' or '-1'.` })
        
        if (priceSort)
            filters = { price: priceSort }

        const products = await productModel.find(searchObj).sort(filters)

        if (products.length === 0)
            return res.status(404).send({ status: false, message: ` '${Object.values(reqBody) }' this product does't exist.` })

        return res.status(200).send({ status: true, message: `Success`, data: products })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getProductById=============================================>
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: ` '${productId}' this productId is invalid.` })

        const existUser = await productModel.findById(productId)

        if (!existUser)
            return res.status(404).send({ status: false, message: `Product does't exits.` })

        if (existUser === true)
            return res.status(400).send({ status: false, message: ` '${productId}' this productId already deleted.` })

        res.status(200).send({ status: true, message: `Successful`, data: checkProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateProduct=============================================>
const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!productId) return res.status(400).send({ status: false, message: "Product id is required in path params" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Product id should be valid mongoose type object Id" })

        const productExist = await productModel.findById({ _id: productId })
        if (!productExist) return res.status(404).send({ status: false, message: "Product details from given product id not found" })

        if (productExist.isDeleted === 'false') return res.status(400).send({ status: false, message: "Product is already deleted" })

        if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "No data found to be updated,please enter data to update" })

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = req.body

        let obj = {}

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required and should be valid" })
            const dupTitle = await productModel.findOne({ title: title })
            if (dupTitle) return res.status(400).send({ status: false, message: "Title is already present in DB" })
            obj['title'] = title
        }
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "Description is required and should be valid" })
            obj['description'] = description
        }
        if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: `Price is required and should be a valid price e.g(54,589.23,6726,etc).` })
            obj['price'] = price
        }
        if (currencyId) {
            if (currencyId !== 'INR') return res.status(400).send({ status: false, message: `NR should be the currency id.` })
            obj['currencyId'] = currencyId
        }
        if (currencyFormat) {
            if (currencyFormat != 'INR' || currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currency id or currency format i.e 'INR' or '₹'" })
            const symbol = getSymbolFromCurrency('INR')
            obj['currencyFormat'] = symbol
            console.log(symbol)
        }
        if (isFreeShipping) {
            if (!isBoolean(isFreeShipping)) return res.status(400).send({ status: false, message: "Is free Shipping value should be boolean" })
            obj['isFreeShipping'] = isFreeShipping
        }
        if (style) {
            if (!isValidString(style)) return res.status(400).send({ status: false, message: "Style should be a valid string" })
            obj['style'] = style
        }
        if (installments) {
            if (isNaN(Number(installments))) return res.status(400).send({ status: false, message: "Installments should be a valid number" })
            obj['installments'] = installments
        }


        if (productImage) {
            let file = req.files
            if (!(file && file.length)) return res.status(400).send({ status: false, message: "No file found" })

            let uploadedFileUrl = await uploadFile(file[0])
            obj['productImage'] = uploadedFileUrl
        }
        obj = { $set: obj }
        if (availableSizes) {
            let sizeArray = availableSizes.toUpperCase().split(',').map(x => x.trim())
            //console.log(sizeArray)
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XL", "XXL"].includes(sizeArray[i]))) {
                    return res.status(400).send({ status: false, message: `Please enter size from available sizes ["S","XS","M","X","L","XL","XXL"]` })
                }
            }
            obj['$addToSet'] = { availableSizes: sizeArray }
        }
        const updatedPro = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, obj, { new: true })
        return res.status(200).send({ status: true, message: "Product updated successfully!!", data: updatedPro })



    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteProduct=============================================>
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!isValidObjectId(productId))
            return res.status(400).send({ status: false, message: ` '${productId}' this productId is invalid.` })

        const existProduct = await productModel.findById(productId)

        if (!existProduct)
            return res.status(404).send({ status: false, message: `Product does't exits` })

        if (existProduct.isDeleted === true)  
            return res.status(400).send({ status: false, message: ` '${productId}' this productId already deleted.` })

        const deleteData = await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });

        res.status(200).send({ status: true, message: `Successfully deleted.`, data: deleteData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createProduct, getProductByQuery, getProductById, updateProduct, deleteProduct };


