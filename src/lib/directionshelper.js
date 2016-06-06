
export function lookupDirections(google, map, request) {


  return new Promise((resolve, reject) => {
    const directionsService = new google.maps.DirectionsService(map);

    directionsService.route(request, (results, status, pagination) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        resolve(results, pagination);
      } else {
        reject(results, status);
      }
    })
  });
}
