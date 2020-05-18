const express = require('express');
const rp = require('request-promise');
const xsenv = require('@sap/xsenv');

xsenv.loadEnv();

const app = express()
const port = process.env.PORT || 3000;
const dest_service = xsenv.getServices({ dest: { tag: 'destination' } }).dest;
const uaa_service = xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa;
const sUaaCredentials = dest_service.clientid + ':' + dest_service.clientsecret;
const sDestinationName = 'My-Destination';


app.get('/data', (req, res) => {
    return rp({
        uri: uaa_service.url + '/oauth/token',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(sUaaCredentials).toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'
        },
        form: {
            'client_id': dest_service.clientid,
            'grant_type': 'client_credentials'
        }
    }).then((data) => {
        const token = JSON.parse(data).access_token;
        return rp({
            uri: dest_service.uri + '/destination-configuration/v1/destinations/' + sDestinationName,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    }).then((data) => {
        const oDestination = JSON.parse(data);
        const token = oDestination.authTokens[0];
        return rp({
            method: 'GET',
            uri: oDestination.destinationConfiguration.URL + "/MyOtherService",
            headers: {
                'Authorization': `${token.type} ${token.value}`
            }
        });
    }).then((result) => {
        res.send(result);
    }).catch((error) => {
        res.send("error: " + JSON.stringify(error));
    });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))