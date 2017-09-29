const express = require('express');
const router = express.Router();

const shopifyStoresService = require('../services/shopify-stores');
const constructHelper = require('../services/map-theme-construct-helper');
const mapStyles = require('../services/map-styles');

router.get('/install', function (req, res) {
    let shop = req.query['shop'];
    let scopes = 'read_orders,read_products,read_themes,write_themes,write_content';
    let shopify = shopifyStoresService.install({
        shop: shop, // MYSHOP.myshopify.com
        shopify_api_key: process.env.API_KEY, // Your API key
        shopify_shared_secret: process.env.API_SECRET, // Your Shared Secret
        shopify_scope: scopes,
        redirect_uri: `https://${process.env.APP_URL}/jctest/auth`,
        nonce: '' // you must provide a randomly selected value unique for each authorization request
    });

    let installUrl = shopify.buildAuthURL();//Generate url for the application installation screen
    //`http://${shop}/admin/oauth/authorize?client_id=${API_KEY}&scope=${scopes}&redirect_uri=https://${API_URL}/jstest/auth`

    res.redirect(installUrl);
})

router.get('/auth', function (req, res) {
    let shop = req.query['shop'];
    let shopify = shopifyStoresService.getStore(shop);
    shopify.exchange_temporary_token(req.query, function (err, data) {
        shopify.get('/admin/themes.json', function (err, data, headers) {
            res.render('index', {
                title: 'jc map app',
                appKey: process.env.API_KEY,
                shop: shop,
                themes: data.themes,
                mapStyles: Object.keys(mapStyles)
            });
        });
    });
});

router.post('/create-map', function (req, res) {
    const shop = req.query['shop'];
    const shopify = shopifyStoresService.getStore(shop);
    if (!shopify) {
        return;
    }

    let mapConfigurations = shopifyStoresService.saveMapConfiguration(shop, req.body);
    //Getting info about themes in store
    shopify.get('/admin/themes.json', { role: "main" }, function (err, data, headers) {
        if (err || !data.themes.length) {
            return;
        }
        let id = data.themes[0].id;// Main theme id
        //  Create map page template
        shopify.put(`/admin/themes/${id}/assets.json`, {
            asset: {
                key: 'templates/page.jc-map.liquid',
                value: constructHelper.generateMspHtml(mapConfigurations.apiKey)
            }
        }, function (err, data, headers) {
            if (err) {
                res.status(500).end(err);
                return;
            }
            // Get store locations info
            shopify.get('/admin/locations.json', function (err, data, headers) {
                if (err) {
                    res.status(500).end(err);
                    return;
                }
                const location = data.locations;
                // Adde script asset for google map initialization
                shopify.put(`/admin/themes/${id}/assets.json`, {
                    asset: {
                        key: 'assets/jc-map.js',
                        value: constructHelper.generateMspScript(location, mapConfigurations.styles)
                    }
                }, function (err, data, headers) {
                    if(err){
                        res.status(500).end(err);
                        return;
                    }
                    // Creating map page in store
                    shopify.post('/admin/pages.json', {
                        "page": {
                            "title": "Map",
                            "body_html": "<h1>Map page</h1>",
                            "published": true,
                            "template_suffix": 'jc-map'
                        }
                    }, function (err, data, headers) {
                        if(err){
                            res.status(500).end(err);
                            return;
                        }
                        res.status(200).end();
                    });
                });
            });
        });
    });
});

module.exports = router;