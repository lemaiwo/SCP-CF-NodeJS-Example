const express = require('express');
const core = require('@sap-cloud-sdk/core');
const xsenv = require('@sap/xsenv');

xsenv.loadEnv();
const app = express()
const port = process.env.PORT || 3000;

const sDestinationName = 'IAS';

app.get('/data', async (req, res) => {
    const dest = await core.getDestination(sDestinationName);
    let response = await core.executeHttpRequest(dest, {
        method: 'GET',
        url: "/service/scim/Users?count=2&startIndex=3"
    });
    res.send(response.data);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))