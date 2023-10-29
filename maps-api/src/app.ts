import axios from 'axios'

interface GoogleGeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }>
  status: 'OK' | 'ZERO_RESULTS'
}

declare let google: any

const form = document.querySelector('form') as HTMLFormElement
const addressInput = document.getElementById('address') as HTMLInputElement
const mapTemplate = document.getElementById('map') as HTMLTemplateElement
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

const head = document.querySelector('head') as HTMLHeadElement
const script = document.createElement('script')
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}`
script.defer = true
script.async = true
head.append(script)

function initMap (responseData: GoogleGeocodingResponse): void {
  const coordinates = responseData.results[0].geometry.location
  const map = new google.maps.Map(mapTemplate, {
    center: coordinates,
    zoom: 10
  })

  const marker = new google.maps.Marker({ position: coordinates })
  marker.setMap(map)
}

function searchAddressHandler (event: Event): void {
  event.preventDefault()
  const address = addressInput.value
  axios
    .get<GoogleGeocodingResponse>(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${GOOGLE_API_KEY}`)
    .then(response => {
      if (response.data.status !== 'OK') {
        throw new Error('Could not fetch location!')
      }

      initMap(response.data)
    })
    .catch(err => {
      alert(err.message)
      console.log(err)
    })
}

form.addEventListener('submit', searchAddressHandler)
