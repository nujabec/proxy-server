const express = require('express')
const app = express()
const { createProxyMiddleware} = require("http-proxy-middleware")
const rateLimit = require("express-rate-limit")
require("dotenv").config()
const url = require("url")

const limiter = rateLimit({
    windowMS: 15 * 60 * 1000, // 15 minutes
    max: 10000,
})

app.get("/", (req, res) => {
    res.send("This is my proxy server")
})

// 全てのサイトに適用する場合
// app.use(limiter)

app.use("/corona-tracker-world-data", limiter, (req, res, next) => {
    createProxyMiddleware({
        target: process.env.BASE_API_URL_CORONA_WORLD,
        changeOrigin: true,
        pathRewrite: {
            [`^/corona-tracker-world-data`]:"",
        },
    })(req, res, next)
})

app.use("/weather-data", (req, res, next) => {
    const city = url.parse(req.url).query
    createProxyMiddleware({
        target: `${process.env.BASE_API_URL_WEATHERAPI}${city}&aqi=no`,
        changeOrigin: true,
        pathRewrite: {
            [`^/weather-data`]:"",
        },
    })(req, res, next)
})


const port = process.env.PORT || 5000

app.listen(5000, () => {
    console.log(`Listening on port ${port}`)
})

module.exports = app
