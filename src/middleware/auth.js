import jwt from 'jsonwebtoken';

const authentication = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token)
            res.status(400).send({ status: false, message: `Token must be present.` })

        token = req.headers.authorization.slice(7);

        jwt.verify(token, 'group1', (err, decoded) => {
            if (err)
                res.status(400).send({ status: false, message: `Authentication Failed!`, error: err.message })
            req['user'] = decoded.userId
            next()
        })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const authorization = async (req, res, next) => {
    try {
        const userId = req.params.userId
        if (req.user != userId)
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

export { authentication, authorization };

