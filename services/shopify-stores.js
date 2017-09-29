const ShopifyAPI = require('shopify-node-api');
const mapStyles = require('./map-styles');


module.exports = {
    stores: {},
    mapConfiguration: {},
    install (storeOptions) {
        let store = this.stores[storeOptions.shop];

        if (!store) {
            store = new ShopifyAPI(storeOptions);
            this.stores[storeOptions.shop] = store;
        }

        return store;
    },
    shopNameFormater (shop){
        return shop.replace(/https?:\/\//, '');
    },
    getStore (shop) {
        shop = this.shopNameFormater(shop);
        return this.stores[shop];
    },
    saveMapConfiguration (shop, configurations) {
        shop = this.shopNameFormater(shop);
        let mapConfigurations = this.mapConfiguration[shop];
        if (!mapConfigurations) {
            mapConfigurations = {};
            this.mapConfiguration[shop] = mapConfigurations
        }
        mapConfigurations.mapApi = configurations.mapApi;
        mapConfigurations.location = configurations.location;
        let mapStyle;
        if(configurations.mapStyle){
            mapStyles[configurations.mapStyle]
        }else if(configurations.mapStyleCustom){
            mapStyle = JSON.parse(configurations.mapStyleCustom);
        }else{
            mapStyle =mapStyles[Object.keys(mapStyles)[0]];
        }
        mapConfigurations.styles = mapStyle;
        return mapConfigurations;
    }
}