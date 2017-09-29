jQuery(function () {
  ShopifyApp.ready(function () {
    ShopifyApp.Bar.initialize({
      title: 'The jc test app',
      buttons: {
        primary: {
          label: 'Create map page',
          message: 'save',
          callback: function (data) {
            ShopifyApp.Bar.loadingOn();
            // setTimeout(function(){
            //   ShopifyApp.Bar.loadingOff();
            // }, 2000)
            var mapFromElements = $('#map-config')[0].elements;
            var mapConfiguration = {
              apiKey: mapFromElements.apiKey.value,
              // lat: mapFromElements.lat.value, 
              // lng: mapFromElements.lng.value,
              mapStyle: mapFromElements.mapStyle.value,
              mapStyleCustom: mapFromElements.mapStyleCustom.value
            }
            if(checkValidation(mapConfiguration)){
              $.post('/jctest/create-map?shop=' + ShopifyConfig.shopOrigin, mapConfiguration).then(function (data) {
                ShopifyApp.Bar.loadingOff();
              });
            }
          }
        }
      }
    });
  });
  $('.map-style-radio').on('change', function () {
    console.log(this);
  })

  function checkValidation(mapConfiguration) {
    $('.validation-notification').text('');
    if(!mapConfiguration.apiKey){
      $('.validation-notification').text('Api key is required');
      return false;
    }
    return true;
  }
});