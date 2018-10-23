// const http = require('http')
// const httpProxy = require('http-proxy');

// const proxy = httpProxy.createProxyServer({});
// proxy.on('proxyReq', function(proxyReq, req, res, options) {
//   proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
// });

// const server = http.createServer(function(req, res) {

//   proxy.web(req, res, {
//     target: 'http://127.0.0.1:8080'
//   });
// });

// console.log("listening on port 5050")
// server.listen(5050);




const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');
const app = require('express')()
const cookie = require('cookie')
const PRIVATE_KEY = 'request.app.get()'

app.all('/login', (req, res) => {
    var payload = { username: 'test' }
    var myToken = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'HS256' })
    res.cookie('access_token', myToken, {maxAge: 3600000})
    
    res.json({ success: true, token: myToken })
})

app.use('/', proxy('http://127.0.0.1:8080', {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        return new Promise(function (resolve, reject) {
            if (!proxyReqOpts.headers.cookie) {
                reject()
            }
            let serialized = cookie.parse(proxyReqOpts.headers.cookie)
            if (serialized.access_token) {
                jwt.verify(serialized.access_token, PRIVATE_KEY, function (err, decoded) {
                    if (err) {
                        reject()
                    }
                    resolve(proxyReqOpts);
                })
            }
            reject()
        })
    }
}))
app.use('/', (req, res) => {
    res.status(401).json({ success: false })
})

app.listen(5050, () => {
    console.log('Server started')
})