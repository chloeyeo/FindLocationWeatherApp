var container = document.getElementById("map");
let latitude,
  longitude,
  options,
  map,
  imageSize,
  imageOption,
  markerImage,
  markerPosition,
  marker,
  roadviewContainer,
  roadview,
  roadviewClient,
  position,
  weatherDataUrl,
  weatherImageUrl;

let statusText = ``;
const view = document.querySelector(".view");
const openweatherApiKey = "2f5667655dbf20203376e75c1b0dba8d";
function showView() {
  getWeatherData();
  createMap();
  createRoadView();
}

function createRoadView() {
  roadviewContainer = document.getElementById("roadview"); //로드뷰를 표시할 div
  roadview = new kakao.maps.Roadview(roadviewContainer); //로드뷰 객체
  roadviewClient = new kakao.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체

  position = new kakao.maps.LatLng(latitude, longitude);

  // 특정 위치의 좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
  roadviewClient.getNearestPanoId(position, 50, function (panoId) {
    roadview.setPanoId(panoId, position); //panoId와 중심좌표를 통해 로드뷰 실행
  });
}

function createMap() {
  options = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 3,
  };

  map = new kakao.maps.Map(container, options);
}

async function getWeatherData() {
  try {
    weatherDataUrl = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(weatherDataUrl, {
      params: { lat: latitude, lon: longitude, appid: openweatherApiKey },
    });
    // use json stringify to convert object to string THEN use json parse to convert json to Our object format
    const weatherDataObject = JSON.parse(JSON.stringify(response.data));
    // openWeather uses kelvin by default
    // convert kelvin to celsius by -273.15 (C=K-273.15)
    const temp = Math.trunc(weatherDataObject.main.temp - 273.15);
    const iconId = weatherDataObject.weather[0].icon;
    weatherImageUrl = `https://openweathermap.org/img/wn/${iconId}@2x.png`;
    console.log("iconId " + iconId);
    console.log("weatherImageUrl " + weatherImageUrl);
    const weather = weatherDataObject.weather[0].description;
    statusText += `Current weather: ${weather}<br>`;
    statusText += `It is now currently ${temp} degrees<br>`;
    $(".status").html(statusText);

    imageSize = new kakao.maps.Size(80, 80); // 마커이미지의 크기입니다
    imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    markerImage = new kakao.maps.MarkerImage(
      weatherImageUrl, // is it bc we didn't JSON.parse(JSON.stringify) here?? 1. do this then change back to original object
      imageSize,
      imageOption
    );

    markerPosition = new kakao.maps.LatLng(latitude, longitude); // 마커가 표시될 위치입니다

    // 마커를 생성합니다
    marker = new kakao.maps.Marker({
      position: markerPosition,
      image: markerImage, // 마커이미지 설정
    });

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);
  } catch (error) {
    console.error(error.message);
  }
}

function onClick() {
  function success(position) {
    statusText = "";
    latitude = position.coords.latitude; // horizontal
    longitude = position.coords.longitude; // vertical
    statusText += `latitude: ${latitude}, longitude: ${longitude}<br>`;
    showView();
  }

  function error() {
    $("status").html("현재 위치를 찾을 수 없네요");
  }

  if (!navigator.geolocation) {
    $("status").html("브라우저가 지원 안함");
  } else {
    $("status").html("위치파악중");
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

//event
document.querySelector(".findMe").addEventListener("click", onClick);
